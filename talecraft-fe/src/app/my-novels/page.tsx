'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthToken, removeAuthToken } from '@/utils/cookies';
import { checkAuthAndRedirect } from '@/utils/auth';
import { API_BASE_URL } from '../../config/api';

interface MyNovel {
  novelId: number;
  title: string;
  userId: string;
  titleImage?: string;
  episodeCount: number;
  lastUpdated: string;
  summary?: string;
  availability?: string;
  isFinished?: boolean;
  isDeleted?: boolean;
  isBanned?: boolean;
}

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

const MyNovelsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [novels, setNovels] = useState<MyNovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'bookmarked' | 'my'>('bookmarked');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // URL 파라미터에서 필터 타입 읽기
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'bookmarked') {
      setFilterType('bookmarked');
    }
  }, [searchParams]);

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
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const fetchMyNovelsFromApi = async () => {
    const res = await fetch(`/api/novels/my`, { 
      method: 'GET', 
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) throw new Error('작품 목록을 불러오는데 실패했습니다.');
    return res.json();
  };

  const fetchBookmarkedNovelsFromApi = async () => {
    const res = await fetch(`/api/novels/bookmarks`, { 
      method: 'GET', 
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) throw new Error('북마크 목록을 불러오는데 실패했습니다.');
    return res.json();
  };

  useEffect(() => {
    console.log('filterType 변경됨:', filterType);
    const fetchNovels = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        
        // 북마크를 우선적으로 처리
        if (filterType === 'bookmarked') {
          console.log('북마크된 소설 데이터 가져오는 중...');
          data = await fetchBookmarkedNovelsFromApi();
          console.log('북마크 데이터 받음:', data);
          // 북마크된 소설 데이터 변환
          const novels: MyNovel[] = data.bookmarkList.map((bookmark: {
            bookmarkId: number;
            novelInfo: {
              novelId: number;
              title: string;
              titleImage?: string;
              summary: string;
            };
          }) => ({
            novelId: bookmark.novelInfo.novelId,
            title: bookmark.novelInfo.title,
            userId: '', // 북마크에서는 저자 정보가 없을 수 있음
            titleImage: bookmark.novelInfo.titleImage,
            episodeCount: 0, // API에 없으면 0 또는 별도 처리
            lastUpdated: '', // API에 없으면 빈 값 또는 별도 처리
            summary: bookmark.novelInfo.summary,
          }));
          console.log('변환된 북마크 소설:', novels);
          setNovels(novels);
        } else if (filterType === 'my') {
          console.log('내 작품 데이터 가져오는 중...');
          data = await fetchMyNovelsFromApi();
          console.log('내 작품 데이터 받음:', data);
          // 내 작품 데이터 변환
          const novels: MyNovel[] = data.novelList.map((novel: {
            novelId: number;
            title: string;
            userId: string;
            titleImage?: string;
          }) => ({
            novelId: novel.novelId,
            title: novel.title,
            userId: novel.userId,
            titleImage: novel.titleImage,
            episodeCount: 0, // API에 없으면 0 또는 별도 처리
            lastUpdated: '', // API에 없으면 빈 값 또는 별도 처리
          }));
          console.log('변환된 내 작품:', novels);
          setNovels(novels);
        }
      } catch (error) {
        console.error('데이터 가져오기 오류:', error);
        setError(filterType === 'bookmarked' ? '북마크 목록을 불러오는데 실패했습니다.' : '작품 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchNovels();
  }, [filterType]);

  const handleRemoveBookmark = async (novelId: number) => {
    try {
      const response = await fetch(`/api/novels/${novelId}/bookmark`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 북마크 제거 후 목록 새로고침
        await handleFilterChange('bookmarked');
      } else {
        console.error('북마크 제거 실패');
      }
    } catch (error) {
      console.error('북마크 제거 중 오류:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // 백엔드에 로그아웃 요청
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('로그아웃 성공');
      } else {
        console.error('로그아웃 실패');
      }
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      // 프론트엔드 상태 정리
      removeAuthToken();
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  const handleNavigation2 = (path: string) => {
    setIsSidebarOpen(false);
    router.push(path);
  };

  const handleLogout2 = async () => {
    await handleLogout();
    setIsSidebarOpen(false);
    router.push("/");
  };

  const handleFilterChange = (newFilterType: 'bookmarked' | 'my') => {
    console.log('필터 변경:', newFilterType);
    setFilterType(newFilterType);
    setSearchTerm(''); // 필터 변경 시 검색어 초기화
    
    // 즉시 데이터 새로고침
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        
        // 북마크를 우선적으로 처리
        if (newFilterType === 'bookmarked') {
          console.log('북마크된 소설 데이터 가져오는 중...');
          data = await fetchBookmarkedNovelsFromApi();
          console.log('북마크 데이터 받음:', data);
          // 북마크된 소설 데이터 변환
          const novels: MyNovel[] = data.bookmarkList.map((bookmark: {
            bookmarkId: number;
            novelInfo: {
              novelId: number;
              title: string;
              titleImage?: string;
              summary: string;
            };
          }) => ({
            novelId: bookmark.novelInfo.novelId,
            title: bookmark.novelInfo.title,
            userId: '', // 북마크에서는 저자 정보가 없을 수 있음
            titleImage: bookmark.novelInfo.titleImage,
            episodeCount: 0, // API에 없으면 0 또는 별도 처리
            lastUpdated: '', // API에 없으면 빈 값 또는 별도 처리
            summary: bookmark.novelInfo.summary,
          }));
          console.log('변환된 북마크 소설:', novels);
          setNovels(novels);
        } else if (newFilterType === 'my') {
          console.log('내 작품 데이터 가져오는 중...');
          data = await fetchMyNovelsFromApi();
          console.log('내 작품 데이터 받음:', data);
          // 내 작품 데이터 변환
          const novels: MyNovel[] = data.novelList.map((novel: {
            novelId: number;
            title: string;
            userId: string;
            titleImage?: string;
          }) => ({
            novelId: novel.novelId,
            title: novel.title,
            userId: novel.userId,
            titleImage: novel.titleImage,
            episodeCount: 0, // API에 없으면 0 또는 별도 처리
            lastUpdated: '', // API에 없으면 빈 값 또는 별도 처리
          }));
          console.log('변환된 내 작품:', novels);
          setNovels(novels);
        }
      } catch (error) {
        console.error('데이터 가져오기 오류:', error);
        setError(newFilterType === 'bookmarked' ? '북마크 목록을 불러오는데 실패했습니다.' : '작품 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  };

  const handleEditNovel = (novelId: number) => {
    // 작품 수정 페이지로 이동
    window.location.href = `/novel-create?novelId=${novelId}`;
  };

  const handleWriteEpisode = (novelId: number) => {
    // 화 쓰기 페이지로 이동
    window.location.href = `/episode-create?novelId=${novelId}`;
  };

  const filteredNovels = novels.filter(novel => {
    const titleMatch = novel.title.toLowerCase().includes(searchTerm.toLowerCase());
    const userIdMatch = novel.userId && novel.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const summaryMatch = novel.summary && novel.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    return titleMatch || userIdMatch || summaryMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {filterType === 'bookmarked' ? '북마크 목록을 불러오는 중...' : '작품 목록을 불러오는 중...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-400 text-white p-4 shadow-md">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-xl font-bold">TaleCraft</h1>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-500"
              onClick={() => router.push('/')}
            >
              홈으로
            </Button>
          </div>
        </header>
        <main className="p-4">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-400 text-white p-4 shadow-md">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-xl font-bold cursor-pointer hover:text-blue-200 transition-colors" onClick={() => router.push('/')}>
            TaleCraft
          </h1>

          <div className="flex items-center space-x-2">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1 rounded text-black text-sm w-48 focus:outline-none focus:ring-2 focus:ring-white"
                  autoFocus
                />
                <Button
                  type="button"
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
              </form>
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

            {isLoggedIn && userInfo && (
              <span className="text-sm font-medium hidden sm:inline">안녕하세요, {userInfo.userName}님!</span>
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 pt-8 pb-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          {filterType === 'bookmarked' ? "보관함" : "마이 작품 목록 페이지"}
        </h2>
        
        {/* 검색 및 필터 섹션 */}
        <div className="bg-orange-200 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* 필터 버튼들 */}
            <button
              onClick={() => handleFilterChange('bookmarked')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'bookmarked' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              북마크
            </button>
            <button
              onClick={() => handleFilterChange('my')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'my' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              내 작품
            </button>
            
            {/* 검색 설정 버튼 */}
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              검색설정
            </button>
            
            {/* 검색창 */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="검색창"
                className="flex-1 px-3 py-2 bg-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSearch}
                className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 작품 목록 섹션 */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="space-y-4">
            {filteredNovels.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                {searchTerm ? '검색 결과가 없습니다.' : 
                  filterType === 'bookmarked' ? '북마크된 작품이 없습니다.' : '등록된 작품이 없습니다.'}
              </div>
            ) : (
              filteredNovels.map((novel) => (
                <div key={novel.novelId} className="flex gap-4 items-center">
                  {/* 표지 */}
                  <div className="w-24 h-32 bg-purple-400 rounded flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {novel.titleImage ? (
                      <img
                        src={novel.titleImage}
                        alt={novel.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      '표지'
                    )}
                  </div>
                  
                  {/* 작품 정보 */}
                  <div className="flex-1 bg-yellow-200 p-4 rounded">
                    <h3 className="font-semibold text-lg mb-2">
                      <button
                        onClick={() => window.location.href = `/novel/${novel.novelId}`}
                        style={{ background: 'none', border: 'none', padding: 0, margin: 0, color: '#1d4ed8', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}
                      >
                        {novel.title}
                      </button>
                    </h3>
                    {filterType === 'bookmarked' ? (
                      // 북마크된 소설의 경우
                      <>
                        {novel.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2">{novel.summary}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          북마크된 작품
                        </p>
                      </>
                    ) : (
                      // 내 작품의 경우
                      <>
                        <p className="text-sm text-gray-600">{novel.userId}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {novel.episodeCount}화 • {novel.lastUpdated}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* 액션 버튼들 */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {filterType === 'bookmarked' ? (
                      // 북마크된 소설의 경우
                      <button
                        onClick={() => handleRemoveBookmark(novel.novelId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        북마크 해제
                      </button>
                    ) : (
                      // 내 작품의 경우
                      <>
                        <button
                          onClick={() => handleEditNovel(novel.novelId)}
                          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          작품 정보 수정
                        </button>
                        <button
                          onClick={() => handleWriteEpisode(novel.novelId)}
                          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          화 쓰기
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* 스크롤 화살표 */}
          <div className="text-center mt-6">
            <div className="text-gray-400 text-sm">스크롤 화살표</div>
          </div>
        </div>
      </main>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-80 z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-b from-purple-400 to-pink-400 p-6 shadow-lg">
          {/* User Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
            </div>
            {isLoggedIn && userInfo ? (
              <div className="text-center">
                <p className="text-black font-semibold text-lg">{userInfo.userName}</p>
                <p className="text-black text-sm">{userInfo.email}</p>
              </div>
            ) : (
              <button
                className="text-black font-semibold text-lg"
                onClick={() => {
                  setIsSidebarOpen(false);
                  router.push("/auth/login");
                }}
              >
                로그인
              </button>
            )}
          </div>

          {/* Menu Buttons */}
          <div className="space-y-4">
            {isLoggedIn ? (
              <>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => handleNavigation2("/novel-create")}
                >
                  작품등록
                </button>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => handleNavigation2("/my-novels")}
                >
                  내 작품 목록
                </button>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => handleNavigation2("/mypage")}
                >
                  마이페이지
                </button>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => handleNavigation2("/messages")}
                >
                  쪽지함
                </button>
                {userInfo?.authorityId === "3" && (
                  <button
                    className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => handleNavigation2("/admin")}
                  >
                    관리자 페이지
                  </button>
                )}
                {userInfo?.authorityId === "1" && (
                  <button
                    className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                    onClick={() => handleNavigation2("/admin/inquiry")}
                  >
                    관리자 문의
                  </button>
                )}
                <button
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  onClick={handleLogout2}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => handleNavigation2("/auth/login")}
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default MyNovelsPage; 