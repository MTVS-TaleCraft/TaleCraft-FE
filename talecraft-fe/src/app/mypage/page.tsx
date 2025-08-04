'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, removeAuthToken } from '@/utils/cookies';
import { checkAuthAndRedirect } from '@/utils/auth';
import Link from 'next/link';

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
}

export default function MyPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const initPage = async () => {
      const isAuthenticated = await checkAuthAndRedirect(router);
      if (isAuthenticated) {
        checkLoginStatus();
      }
    };
    
    initPage();
  }, [router]);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        fetchUserInfo();
      } else {
        router.push('/auth/login?redirect=/mypage');
      }
    } catch (error) {
      router.push('/auth/login?redirect=/mypage');
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else {
        setError('사용자 정보를 불러올 수 없습니다.');
        if (response.status === 401) {
          router.push('/auth/login?redirect=/mypage');
        }
      }
    } catch (error) {
      setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNicknameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: newNickname,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserInfo(prev => prev ? { ...prev, userName: newNickname } : null);
        setShowNicknameModal(false);
        setNewNickname('');
      } else {
        setError(data.error || '닉네임 변경에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/');
      } else {
        console.error('로그아웃 실패');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch('/api/user/withdraw', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('회원 탈퇴가 완료되었습니다.');
        router.push('/');
      } else {
        const data = await response.json();
        alert(data.message || '회원 탈퇴에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-blue-400 text-white p-4 shadow-md">
        <div className="flex justify-between items-center w-full">
          <Link href="/">
            <h1 className="text-xl font-bold cursor-pointer hover:text-blue-200 transition-colors">TaleCraft</h1>
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">내 정보</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {userInfo && (
            <div className="space-y-4">
              {/* 아이디 */}
              <div className="flex items-center p-4 bg-yellow-100 rounded-lg">
                <span className="font-semibold text-gray-700 w-24">아이디:</span>
                <span className="flex-1 text-gray-900">{userInfo.userId}</span>
              </div>

              {/* 닉네임 */}
              <div className="flex items-center p-4 bg-yellow-100 rounded-lg">
                <span className="font-semibold text-gray-700 w-24">닉네임:</span>
                <span className="flex-1 text-gray-900">{userInfo.userName}</span>
                <button
                  onClick={() => setShowNicknameModal(true)}
                  className="ml-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  닉네임 변경
                </button>
              </div>

              {/* 비밀번호 */}
              <div className="flex items-center p-4 bg-yellow-100 rounded-lg">
                <span className="font-semibold text-gray-700 w-24">비밀번호:</span>
                <span className="flex-1 text-gray-900">********</span>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="ml-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  비밀번호 변경
                </button>
              </div>

              {/* 이메일 */}
              <div className="flex items-center p-4 bg-yellow-100 rounded-lg">
                <span className="font-semibold text-gray-700 w-24">이메일:</span>
                <span className="flex-1 text-gray-900">{userInfo.email}</span>
              </div>
            </div>
          )}

          {/* 회원 탈퇴 버튼 */}
          <div className="mt-8 text-center">
            <button 
              onClick={handleWithdraw}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      {/* 닉네임 변경 모달 */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">닉네임 변경</h3>
            <form onSubmit={handleNicknameUpdate}>
              <input
                type="text"
                placeholder="새 닉네임"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? '변경 중...' : '변경'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNicknameModal(false);
                    setNewNickname('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">비밀번호 변경</h3>
            <form onSubmit={handlePasswordUpdate}>
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                required
              />
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                required
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? '변경 중...' : '변경'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 회원탈퇴 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-red-600">회원탈퇴</h3>
            <p className="text-gray-600 mb-4">
              정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <form onSubmit={handleWithdraw}>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? '처리 중...' : '탈퇴'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawPassword('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 