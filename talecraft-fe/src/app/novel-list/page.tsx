'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeAuthToken } from '@/utils/cookies';
import NovelCard from '../components/NovelCard';

interface Novel {
  novelId: number;
  title: string;
  author: string;
  genre: string;
  summary?: string;
  titleImage?: string;
  availability: string;
}

interface NovelListResponse {
  novelList: Novel[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

const NovelListPage: React.FC = () => {
  const router = useRouter();

  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [commonTags, setCommonTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      // 로그인 상태 확인 추가
      checkLoginStatus();
      fetchDefaultTags();
      fetchNovels();
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

  const fetchDefaultTags = async () => {
    setLoadingTags(true);
    try {
      // 기본 태그만 가져오기
      const response = await fetch('/api/tags/default', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCommonTags(data.tagNames || []);
      } else {
        console.error('기본 태그 로드 실패:', response.status);
        setCommonTags([]);
      }
    } catch (error) {
      console.error('기본 태그 로드 실패:', error);
      setCommonTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  const fetchNovels = async (tag?: string) => {
    setLoading(true);

    try {
      let url = '/api/novels';
      if (tag) {
        url = `/api/tags/search/novels?tagName=${encodeURIComponent(tag)}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: NovelListResponse = await response.json();

      if (response.ok) {
        console.log('소설 목록:', data.novelList);
        setNovels(data.novelList || []);
        setCurrentPage(data.page || 0);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        console.error('작품 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = async (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
    if (selectedTag === tag) {
      // 같은 태그를 다시 클릭하면 전체 목록으로
      await fetchNovels();
    } else {
      // 새로운 태그를 클릭하면 해당 태그의 소설들
      await fetchNovels(tag);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchNovels(selectedTag);
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
  }

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

  // 사이드바를 열 때 로그인 상태 확인
  const handleSidebarToggle = () => {
    if (!isLoggedIn) {
      // 로그인 상태가 확인되지 않은 경우에만 확인
      checkLoginStatus();
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredNovels = selectedGenre
    ? novels.filter(novel => novel.genre === selectedGenre)
    : novels;

  if (loading) {
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

            {isLoggedIn && userInfo ? (
              // 로그인한 경우: 프로필 아이콘 (사이드바 열기)
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-500"
                onClick={handleSidebarToggle}
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {userInfo.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="sr-only">프로필 메뉴</span>
              </Button>
            ) : (
              // 로그인하지 않은 경우: 로그인 버튼
              <Button
                variant="outline"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 px-4 py-2 text-sm"
                onClick={() => router.push("/auth/login")}
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 pt-8 pb-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">작품 목록</h2>
        
        {/* 태그 필터 버튼들 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">태그별 필터</h3>
          
          {/* 기본 태그 섹션 */}
          {!loadingTags && commonTags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                기본 태그
              </h4>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {loadingTags && (
            <div className="flex items-center justify-center w-full py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">태그 로딩 중...</span>
            </div>
          )}
          
          {!loadingTags && commonTags.length === 0 && (
            <div className="text-gray-500 text-sm">사용 가능한 태그가 없습니다.</div>
          )}
          
          {selectedTag && (
            <div className="mt-4 text-center">
              <span className="text-blue-600 font-medium">선택된 태그: {selectedTag}</span>
              <button
                onClick={() => handleTagClick(selectedTag)}
                className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                필터 해제
              </button>
            </div>
          )}
        </div>
       
        {filteredNovels.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {selectedTag ? `"${selectedTag}" 태그가 할당된 작품이 없습니다.` : '표시할 작품이 없습니다.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredNovels.map((novel) => (
                <NovelCard
                  key={novel.novelId}
                  id={novel.novelId}
                  title={novel.title}
                  author={novel.author}
                  genre={novel.genre}
                  summary={novel.summary}
                  coverImage={novel.titleImage}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mb-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 border rounded-md ${
                      currentPage === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              총 {totalElements}개의 작품 중 {filteredNovels.length}개 표시
              {selectedTag && ` (${selectedTag} 태그)`}
            </div>
          </>
        )}
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

export default NovelListPage; 