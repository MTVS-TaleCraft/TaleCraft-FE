'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

interface Novel {
  novelId: number;
  title: string;
  titleImage: string;
  summary: string;
  userId: string;
  availability: string;
  reportCount?: number;
}

export default function AdminNovelsPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchNovels();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:8081/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
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

  const fetchNovels = async () => {
    try {
      console.log('작품 목록을 가져오는 중...');
      const response = await fetch('http://localhost:8081/api/novels');
      
      if (response.ok) {
        const data = await response.json();
        console.log('받은 작품 데이터:', data);
        
        if (data.novelList && Array.isArray(data.novelList)) {
          // 각 작품의 실제 신고 수를 가져오기
          const novelsWithReports = await Promise.all(
            data.novelList.map(async (novel: Novel) => {
              try {
                const reportResponse = await fetch(`http://localhost:8081/api/reports/novels/${novel.novelId}/count`);
                let reportCount = 0;
                
                if (reportResponse.ok) {
                  const reportData = await reportResponse.json();
                  reportCount = reportData.reportCount || 0;
                }
                
                return {
                  ...novel,
                  reportCount: reportCount
                };
              } catch (error) {
                console.error(`작품 ${novel.novelId}의 신고 수 조회 실패:`, error);
                return {
                  ...novel,
                  reportCount: 0
                };
              }
            })
          );
          
          setNovels(novelsWithReports);
          console.log('처리된 작품 목록:', novelsWithReports);
        } else {
          console.error('novelList가 배열이 아닙니다:', data);
          setNovels([]);
        }
      } else {
        console.error('작품 목록을 가져오는데 실패했습니다. 상태:', response.status);
        const errorText = await response.text();
        console.error('에러 내용:', errorText);
        setNovels([]);
      }
    } catch (error) {
      console.error('작품 목록을 가져오는데 실패했습니다:', error);
      setNovels([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-blue-400 text-white p-4 shadow-md">
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="text-xl font-bold hover:text-blue-200 transition-colors">
            TaleCraft
          </Link>
          <div className="flex items-center space-x-2">
            {isSearchOpen ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1 rounded text-black text-sm w-48 focus:outline-none focus:ring-2 focus:ring-white"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-blue-500"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">검색 닫기</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-blue-500"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">검색</span>
              </Button>
            )}
            {userInfo && (
              <span className="text-sm font-medium">
                관리자: {userInfo.userName}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-blue-500"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">메뉴</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-6 pt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">작품 관리</h1>
          <Link 
            href="/admin"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            뒤로 가기
          </Link>
        </div>
        
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">전체 작품</h3>
            <p className="text-3xl font-bold text-blue-600">{novels.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">신고된 작품</h3>
            <p className="text-3xl font-bold text-red-600">
              {novels.filter(novel => novel.reportCount && novel.reportCount > 0).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">공개 작품</h3>
            <p className="text-3xl font-bold text-green-600">
              {novels.filter(novel => novel.availability === 'PUBLIC').length}
            </p>
          </div>
        </div>

        {/* 작품 목록 */}
        <div className="space-y-4">
          {novels.map((novel) => (
            <div key={novel.novelId} className="bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-300 transition-all">
              <div className="flex items-center space-x-4">
                {/* 작품 표지 */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-32 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    표지
                  </div>
                </div>
                
                                 {/* 작품 정보 */}
                 <div className="flex-1 bg-yellow-200 p-4 rounded-lg">
                   <div className="text-lg font-semibold text-gray-800 mb-2">{novel.title}</div>
                   <div className="text-sm text-gray-600 mb-2">작성자: {novel.userId}</div>
                   <div className="text-sm text-gray-600 mb-2">상태: {novel.availability === 'PUBLIC' ? '공개' : '비공개'}</div>
                   <div className={`text-sm font-medium ${novel.reportCount && novel.reportCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                     신고 수: {novel.reportCount || 0}건
                   </div>
                 </div>
                
                {/* 관리 버튼 */}
                <div className="flex flex-col space-y-2">
                  <button 
                    className={`px-4 py-2 rounded text-white font-medium ${
                      novel.availability === 'PUBLIC' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {novel.availability === 'PUBLIC' ? '작품 차단하기' : '작품 활성화하기'}
                  </button>
                  <div className="text-sm text-gray-600 text-center">
                    {novel.availability === 'PUBLIC' ? 'ACTIVE' : 'DEACTIVE'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 사이드바 */}
      <div className={`fixed right-0 top-0 h-full w-80 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-b from-purple-400 to-pink-400 p-6 shadow-lg">
          {/* 사용자 섹션 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
            </div>
            {userInfo ? (
              <div className="text-center">
                <p className="text-black font-semibold text-lg">{userInfo.userName}</p>
                <p className="text-black text-sm">{userInfo.email}</p>
              </div>
            ) : (
              <p className="text-black font-semibold text-lg">관리자</p>
            )}
          </div>

          {/* 메뉴 버튼들 */}
          <div className="space-y-4">
            <Link 
              href="/admin"
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors block text-center"
              onClick={() => setIsSidebarOpen(false)}
            >
              관리자 홈
            </Link>
            <Link 
              href="/admin/users"
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors block text-center"
              onClick={() => setIsSidebarOpen(false)}
            >
              사용자 관리
            </Link>
            <Link 
              href="/admin/reports"
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors block text-center"
              onClick={() => setIsSidebarOpen(false)}
            >
              신고 관리
            </Link>
            <button 
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
              onClick={() => {
                handleLogout();
                setIsSidebarOpen(false);
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 오버레이 */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  );
} 