'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

interface User {
  id: string;
  email: string;
  userName: string;
  isBlocked: boolean;
  isWithdrawn: boolean;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentValue: string;
  onUpdate: (newValue: string) => void;
  fieldType: 'email' | 'userName' | 'password';
}

function UpdateModal({ isOpen, onClose, title, currentValue, onUpdate, fieldType }: UpdateModalProps) {
  const [value, setValue] = useState(currentValue);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onUpdate(value);
      onClose();
    } catch (error) {
      console.error('업데이트 실패:', error);
      alert('업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {fieldType === 'email' ? '새 이메일' : 
               fieldType === 'userName' ? '새 닉네임' : '새 비밀번호'}
            </label>
            <input
              type={fieldType === 'password' ? 'password' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    currentValue: string;
    fieldType: 'email' | 'userName' | 'password';
  }>({
    isOpen: false,
    title: '',
    currentValue: '',
    fieldType: 'userName'
  });
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        
        // 관리자 권한 확인 (authorityId가 3이 아니면 접근 거부)
        if (data.authorityId !== "3") {
          alert('관리자 권한이 필요합니다.');
          router.push('/');
          return;
        }
        
        // 사용자 정보 가져오기
        fetchUserDetail();
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/auth/profile?targetUserId=${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error('사용자 정보 가져오기 실패:', response.status);
        // 임시 더미 데이터
        setUser({
          id: userId,
          email: "user@example.com",
          userName: "사용자",
          isBlocked: false,
          isWithdrawn: false,
        });
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      // 임시 더미 데이터
      setUser({
        id: userId,
        email: "user@example.com",
        userName: "사용자",
        isBlocked: false,
        isWithdrawn: false,
      });
    }
  };

  const handleViewWorks = (userId: string) => {
    // 작품 목록 보기 기능
    console.log('작품 목록 보기:', userId);
  };

  const handleChangeEmail = () => {
    if (!user) return;
    setModalConfig({
      isOpen: true,
      title: '이메일 변경',
      currentValue: user.email,
      fieldType: 'email'
    });
  };

  const handleChangeNickname = () => {
    if (!user) return;
    setModalConfig({
      isOpen: true,
      title: '닉네임 변경',
      currentValue: user.userName,
      fieldType: 'userName'
    });
  };

  const handleChangePassword = () => {
    if (!user) return;
    setModalConfig({
      isOpen: true,
      title: '비밀번호 변경',
      currentValue: '',
      fieldType: 'password'
    });
  };

  const handleProcessBlock = (userId: string, isBlocked: boolean) => {
    // 차단 처리 기능
    console.log('차단 처리:', userId, isBlocked);
  };

  const handleWithdraw = (userId: string) => {
    // 탈퇴 처리 기능
    console.log('탈퇴 처리:', userId);
  };

  const handleUpdateUser = async (newValue: string) => {
    if (!user) return;

    const token = localStorage.getItem('token');
    const updateData: Partial<{
      targetUserId: string;
      email?: string;
      userName?: string;
      newPassword?: string;
    }> = {
      targetUserId: userId // 관리자가 변경할 사용자 ID
    };

    switch (modalConfig.fieldType) {
      case 'email':
        updateData.email = newValue;
        break;
      case 'userName':
        updateData.userName = newValue;
        break;
      case 'password':
        updateData.newPassword = newValue;
        break;
    }

    try {
      const response = await fetch('http://localhost:8081/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // 사용자 정보 새로고침
        await fetchUserDetail();
        alert('성공적으로 변경되었습니다.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 변경 실패:', error);
      alert('변경에 실패했습니다.');
    }
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">사용자를 찾을 수 없습니다.</p>
          <Link href="/admin/users" className="text-blue-500 hover:underline">
            사용자 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-blue-400 text-white p-4 shadow-md">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users" className="text-xl font-bold hover:text-blue-200 transition-colors">
              ← 사용자 목록
            </Link>
            <span className="text-sm">[관리자] 유저 보기 페이지</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-white hover:text-gray-200 transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto p-6 pt-16">
        <div className="bg-orange-300 border-t-2 border-t-orange-400 border-b-2 border-b-orange-400 p-4">
          {/* 사용자 정보 섹션들 */}
          <div className="bg-yellow-200 p-4 border-b border-orange-400">
            <div className="flex justify-between items-center">
              <span className="font-medium">아이디: {user.id}</span>
              <button 
                onClick={() => handleViewWorks(user.id)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                작품 목록 보기
              </button>
            </div>
          </div>

          <div className="bg-yellow-200 p-4 border-b border-orange-400">
            <div className="flex justify-between items-center">
              <span className="font-medium">이메일: {user.email}</span>
              <button 
                onClick={handleChangeEmail}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                이메일 변경
              </button>
            </div>
          </div>

          <div className="bg-yellow-200 p-4 border-b border-orange-400">
            <div className="flex justify-between items-center">
              <span className="font-medium">닉네임: {user.userName}</span>
              <button 
                onClick={handleChangeNickname}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                닉네임 변경
              </button>
            </div>
          </div>

          <div className="bg-yellow-200 p-4 border-b border-orange-400">
            <div className="flex justify-between items-center">
              <span className="font-medium">비밀번호</span>
              <button 
                onClick={handleChangePassword}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                비밀번호 변경
              </button>
            </div>
          </div>

          <div className="bg-yellow-200 p-4 border-b border-orange-400">
            <div className="flex justify-between items-center">
              <span className="font-medium">유저 차단 여부</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user.isBlocked ? "차단됨" : "차단 전"}</span>
                <button 
                  onClick={() => handleProcessBlock(user.id, user.isBlocked)}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  처리하기
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-200 p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">유저 탈퇴 여부</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user.isWithdrawn ? "탈퇴됨" : "활성화"}</span>
                <button 
                  onClick={() => handleWithdraw(user.id)}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 업데이트 모달 */}
      <UpdateModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        currentValue={modalConfig.currentValue}
        onUpdate={handleUpdateUser}
        fieldType={modalConfig.fieldType}
      />
    </div>
  );
} 