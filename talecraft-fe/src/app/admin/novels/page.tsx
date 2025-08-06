'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Menu, ArrowLeft } from 'lucide-react';
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
  isBanned?: boolean;
}

export default function AdminNovelsPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const fetchNovels = useCallback(async () => {
    try {
      console.log('신고된 작품 목록을 가져오는 중...');
      // 1. 먼저 신고된 소설 ID 목록을 가져오기
      console.log('신고된 소설 API 호출 시작...');
              const reportedResponse = await fetch('/api/reports/reported-novels', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('신고된 소설 API 응답 상태:', reportedResponse.status);
      let reportedNovelIds: number[] = [];
      
      if (reportedResponse.ok) {
        const reportedData = await reportedResponse.json();
        reportedNovelIds = reportedData.reportedNovelIds || [];
        console.log('신고된 소설 ID 목록:', reportedNovelIds);
      } else if (reportedResponse.status === 403) {
        console.error('관리자 권한이 필요합니다.');
        // 이미 checkAuth에서 권한을 확인했으므로 alert 제거
        router.push('/admin');
        return;
      } else if (reportedResponse.status === 401) {
        console.error('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      } else {
        console.error('신고된 소설 ID 목록을 가져오는데 실패했습니다. 상태:', reportedResponse.status);
        const errorText = await reportedResponse.text();
        console.error('에러 내용:', errorText);
        setNovels([]);
        return;
      }

      if (reportedNovelIds.length === 0) {
        console.log('신고된 소설이 없습니다.');
        setNovels([]);
        return;
      }

      // 2. 신고된 소설들의 상세 정보를 가져오기
      const novelsWithReports = await Promise.all(
        reportedNovelIds.map(async (novelId: number) => {
          try {
            // 소설 정보 가져오기
            const novelResponse = await fetch(`/api/novels/${novelId}`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            let novelData = null;

            if (novelResponse.ok) {
              novelData = await novelResponse.json();
              console.log(`소설 ${novelId} 원본 데이터:`, novelData);
              console.log(`소설 ${novelId} isBanned 필드:`, novelData.isBanned);
              console.log(`소설 ${novelId} isBanned 타입:`, typeof novelData.isBanned);
            } else {
              console.error(`소설 ${novelId} 정보를 가져오는데 실패했습니다.`);
              return null;
            }

            // 신고 수 가져오기
            const reportResponse = await fetch(`/api/reports/novels/${novelId}/count`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            let reportCount = 0;

            if (reportResponse.ok) {
              const reportData = await reportResponse.json();
              reportCount = reportData.reportCount || 0;
            }

            return {
              novelId: novelId,
              title: novelData.title || '제목 없음',
              titleImage: novelData.titleImage || '',
              summary: novelData.summary || '',
              userId: novelData.author || '작성자 없음',
              availability: novelData.availability || 'PRIVATE',
              reportCount: reportCount,
              isBanned: novelData.isBanned || false
            };
          } catch (error) {
            console.error(`소설 ${novelId} 처리 중 오류:`, error);
            return null;
          }
        })
      );

      // null 값 제거
      const validNovels = novelsWithReports.filter(novel => novel !== null);

      // 각 소설의 isBanned 상태 로그 출력
      validNovels.forEach(novel => {
        console.log(`소설 ${novel.novelId} (${novel.title}): isBanned = ${novel.isBanned}`);
        console.log(`소설 ${novel.novelId} isBanned 타입:`, typeof novel.isBanned);
        console.log(`소설 ${novel.novelId} 전체 데이터:`, novel);
      });

      setNovels(validNovels);
      console.log('처리된 신고된 작품 목록:', validNovels);

    } catch (error) {
      console.error('신고된 작품 목록을 가져오는데 실패했습니다:', error);
      setNovels([]);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
              const response = await fetch('/api/auth/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('사용자 정보:', data);
        console.log('권한 ID:', data.authorityId);
        console.log('권한이 3인가?', data.authorityId === "3");

        setUserInfo(data);
        
        // 관리자 권한 확인 (authorityId가 3이 아니면 접근 거부)
        if (data.authorityId !== "3") {
          console.error('관리자 권한이 없습니다. 현재 권한:', data.authorityId);
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
  }, [router]);

  useEffect(() => {
    checkAuth();
    fetchNovels();
  }, [checkAuth, fetchNovels]);

  const handleToggleBan = async (novelId: number) => {
    console.log('=== 차단/해제 버튼 클릭됨 ===');
    console.log(`소설 ${novelId} 차단/해제 요청 시작`);

    // 현재 소설의 상태 확인
    const currentNovel = novels.find(novel => novel.novelId === novelId);
    console.log('현재 소설 정보:', currentNovel);
    console.log('현재 isBanned 상태:', currentNovel?.isBanned);

    try {
      // 쿠키에서 토큰 가져오기
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      const token = tokenCookie ? tokenCookie.split('=')[1] : null;

      console.log('토큰 확인:', token ? '토큰 존재' : '토큰 없음');
      console.log('전체 쿠키:', document.cookie);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('요청 헤더:', headers);

              const response = await fetch(`/api/novels/${novelId}/ban`, {
        method: 'PATCH',
        credentials: 'include',
        headers: headers,
      });

      console.log('차단/해제 API 응답 상태:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('차단/해제 성공:', data);
        console.log('새로운 isBanned 상태:', data.isBanned);
        alert(data.message);

        // 목록 새로고침
        console.log('목록 새로고침 시작...');
        await fetchNovels();
        console.log('목록 새로고침 완료');
      } else {
        const errorData = await response.json();
        console.error('차단/해제 실패:', errorData);
        alert(errorData.error || '차단/해제에 실패했습니다.');
      }
    } catch (error) {
      console.error('차단/해제 중 오류:', error);
      alert('차단/해제 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
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
                      <Link href="/admin" className="flex items-center space-x-2 text-xl font-bold hover:text-blue-200 transition-colors">
              <ArrowLeft size={24} />
              <span>관리자 페이지로 이동</span>
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
          <h1 className="text-3xl font-bold text-gray-800">신고된 작품 관리</h1>
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
            <h3 className="text-lg font-semibold text-gray-700">신고된 작품</h3>
            <p className="text-3xl font-bold text-red-600">{novels.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">총 신고 건수</h3>
            <p className="text-3xl font-bold text-orange-600">
              {novels.reduce((total, novel) => total + (novel.reportCount || 0), 0)}
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
                    onClick={() => {
                      console.log('버튼 클릭됨!');
                      handleToggleBan(novel.novelId);
                    }}
                    className={`px-4 py-2 rounded text-white font-medium transition-colors ${
                      novel.isBanned 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {novel.isBanned ? '작품 활성화하기' : '작품 차단하기'}
                  </button>
                  <div className="text-sm text-gray-600 text-center">
                    {novel.isBanned ? 'BANNED' : 'ACTIVE'}
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