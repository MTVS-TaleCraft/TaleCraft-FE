'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthToken, removeAuthToken } from '@/utils/cookies';
import NovelDetail from '../../components/NovelDetail';
import EpisodeList from '../../components/EpisodeList';
import { API_BASE_URL } from '../../../config/api';

interface Novel {
  novelId: number;
  title: string;
  author: string;
  summary: string;
  tags: string[];
  bookmarkCount: number;
  commentCount: number;
  titleImage?: string;
}

interface Episode {
  episodeId: number;
  title: string;
  view: number;
  note: string;
  createDate: string | null;
}

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

const NovelPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

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

  useEffect(() => {
    const fetchNovelDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const novelResponse = await fetch(`/api/novels/${novelId}`, {
          credentials: 'include'
        });
        const novelData = await novelResponse.json();
        const episodeResponse = await fetch(`/api/novels/${novelId}/episodes`, {
          credentials: 'include'
        });
        const episodeData = await episodeResponse.json();
        if (novelResponse.ok) {
          setNovel(novelData);
      
          // episodeData가 유효한 에피소드 데이터인지 확인
          if (episodeData && episodeData.episodesList && Array.isArray(episodeData.episodesList)) {
            setEpisodes(episodeData.episodesList);
          } else {
            setEpisodes([]);
          }
        } else if (novelResponse.status === 401||episodeResponse.status === 401) {
          setError('로그인이 필요합니다.');
        } else {
          setError(novelData.message || '작품 정보를 불러오는데 실패했습니다.');
          setError(episodeData.message || '에피소드 정보를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (novelId) {
      fetchNovelDetail();
    }
  }, [novelId]);

  const handleLogout = () => {
    removeAuthToken();
    setIsLoggedIn(false);
    setUserInfo(null);
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

  const handleLogout2 = () => {
    handleLogout();
    setIsSidebarOpen(false);
    router.push("/");
  };

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

  if (!novel) {
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
            <div className="text-gray-600">작품을 찾을 수 없습니다.</div>
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
      <main className="p-6 max-w-4xl mx-auto pt-8 pb-24">
        {/* 작품 상세 정보 */}
        <NovelDetail
          title={novel.title}
          author={novel.author}
          summary={novel.summary}
          tags={novel.tags}
          bookmarkCount={novel.bookmarkCount}
          commentCount={novel.commentCount}
          titleImage={novel.titleImage}
          novelId={novel.novelId}
        />
        
        {/* 에피소드 목록 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">에피소드 목록</h2>
          </div>
          <div className="p-6">
            {episodes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">아직 등록된 화가 없습니다.</div>
                <div className="text-gray-400 text-sm">첫 번째 화를 작성해보세요!</div>
              </div>
            ) : (
              <div className="space-y-3">
                {episodes.map((ep) => (
                  <div key={ep.episodeId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{ep.title}</div>
                      <div className="text-sm text-gray-500">
                        조회수: {ep.view} • {ep.createDate ? new Date(ep.createDate).toLocaleDateString() : '날짜 없음'}
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={() => window.location.href = `/episode-view/${ep.episodeId}`}
                    >
                      읽기
                    </button>
                  </div>
                ))}
              </div>
            )}
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

export default NovelPage; 