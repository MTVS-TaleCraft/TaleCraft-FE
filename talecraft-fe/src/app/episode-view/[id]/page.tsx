'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthToken, removeAuthToken } from '@/utils/cookies';
import { checkAuthAndRedirect } from '@/utils/auth';

interface Episode {
  episodeId: number;
  title: string;
  content: string;
  note: string;
  createDate: string | null;
  novelId: number;
}

interface Comment {
  commentId: number;
  content: string;
  userName: string;
  createdDate: string;
  userId?: string; // 댓글 작성자 ID 추가
}

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

const EpisodeViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [comment, setComment] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null); // 현재 로그인한 사용자 정보
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const initPage = async () => {
      const isAuthenticated = await checkAuthAndRedirect(router);
      if (isAuthenticated) {
        checkLoginStatus();
      }
    };
    
    initPage();
  }, [router]);

  // 에피소드 데이터 가져오기
  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        
        // 에피소드 정보 가져오기
        const episodeResponse = await fetch(`/api/novels/1/episodes/${episodeId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (episodeResponse.ok) {
          const episodeData = await episodeResponse.json();
          setEpisode(episodeData);
        } else {
          console.error('에피소드를 불러오는데 실패했습니다.');
          setEpisode(null);
        }

        // 댓글 목록 가져오기
        const commentsResponse = await fetch(`/api/novels/1/episodes/${episodeId}/comments`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData.comments || []);
        } else {
          console.error('댓글을 불러오는데 실패했습니다.');
          setComments([]);
        }

        // 현재 사용자 정보 가져오기 (댓글 신고 기능용)
        const userResponse = await fetch('/api/auth/profile', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
        }

      } catch (error) {
        console.error('데이터 가져오기 오류:', error);
        setEpisode(null);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    if (episodeId) {
      fetchEpisodeData();
    }
  }, [episodeId]);

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

  const handleFontSizeChange = (increase: boolean) => {
    setFontSize(prev => {
      const newSize = increase ? prev + 1 : prev - 1;
      return Math.max(12, Math.min(24, newSize));
    });
  };

  const handleCommentSubmit = async () => {
    if (comment.trim()) {
      try {
        const response = await fetch(`/api/novels/1/episodes/${episodeId}/comments`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: comment.trim()
          })
        });
        
        if (response.ok) {
          setComment('');
          // 댓글 목록 새로고침
          const commentsResponse = await fetch(`/api/novels/1/episodes/${episodeId}/comments`, {
            credentials: 'include'
          });
          
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            setComments(commentsData.comments || []);
          }
        } else {
          console.error('Failed to post comment:', response.status);
        }
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };

  const handleReportComment = async (commentId: number, commentUserId: string, commentUserName: string) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 자신의 댓글은 신고할 수 없음
    if (currentUser.userId === commentUserId) {
      alert('자신의 댓글은 신고할 수 없습니다.');
      return;
    }

    const reportTag = prompt('신고 사유를 선택하세요:\n1. 스팸\n2. 부적절한 내용\n3. 욕설/비방\n4. 기타');
    if (!reportTag) return;

    const description = prompt('신고 상세 내용을 입력하세요:');
    if (!description) return;

    try {
      const response = await fetch('/api/reports/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          commentId,
          reportedUser: commentUserName,
          reportTag,
          description
        }),
      });

      if (response.ok) {
        alert('댓글이 신고되었습니다.');
      } else {
        alert('신고에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      alert('신고 중 오류가 발생했습니다.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">에피소드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">에피소드를 찾을 수 없습니다.</p>
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
      <main className="max-w-4xl mx-auto p-6 pt-8 pb-24">
        {/* Episode Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-2">
                {episode.novelId} - {episode.title}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{episode.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleFontSizeChange(false)}
                className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200"
              >
                A-
              </button>
              <span className="text-sm text-gray-600">{fontSize}px</span>
              <button 
                onClick={() => handleFontSizeChange(true)}
                className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200"
              >
                A+
              </button>
            </div>
          </div>
        </div>

          {/* Episode Content */}
          <div style={{ 
            whiteSpace: 'pre-line',
            marginBottom: 40,
            color: '#333'
          }}>
            {episode.content}
          </div>

          {/* Author's Note */}
          {episode.note && (
            <div style={{ 
              background: '#f8f9fa', 
              borderLeft: '4px solid #007bff',
              padding: '20px',
              marginBottom: 40,
              borderRadius: '0 8px 8px 0'
            }}>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#007bff',
                marginBottom: 8 
              }}>
                작가의 말
              </div>
              <div style={{ 
                fontSize: 14, 
                color: '#666',
                lineHeight: 1.6
              }}>
                {episode.note}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 30,
            padding: '20px 0',
            borderTop: '1px solid #e9ecef'
          }}>
            <button style={{ 
              background: '#007bff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}>
              👍 추천
            </button>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ 
                background: '#6c757d', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: 14
              }}>
                이전화
              </button>
              <button style={{ 
                background: '#28a745', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600
              }}>
                다음화
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ 
            borderTop: '1px solid #e9ecef',
            paddingTop: 30
          }}>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 600, 
              marginBottom: 20,
              color: '#333'
            }}>
              댓글 ({comments.length})
            </div>
            
            {/* Comment Input */}
            <div style={{ 
              background: '#f8f9fa', 
              borderRadius: 8, 
              padding: '16px',
              marginBottom: 20
            }}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 작성해주세요..."
                style={{ 
                  width: '100%', 
                  border: 'none', 
                  background: 'transparent', 
                  outline: 'none', 
                  fontSize: 14,
                  resize: 'none',
                  minHeight: 60,
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button 
                  onClick={handleCommentSubmit}
                  style={{ 
                    background: '#007bff', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 4, 
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  댓글 작성
                </button>
              </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#666',
                fontSize: 14
              }}>
                아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
              </div>
            ) : (
              <div>
                {comments.map((comment) => (
                  <div key={comment.commentId} style={{ 
                    padding: '16px',
                    borderBottom: '1px solid #e9ecef',
                    background: '#fff',
                    marginBottom: '16px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: '#333'
                      }}>
                        {comment.userName}
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{ 
                          fontSize: 12, 
                          color: '#666'
                        }}>
                          {new Date(comment.createdDate).toLocaleDateString()}
                        </div>
                        {currentUser && comment.userId && currentUser.userId !== comment.userId && (
                          <button
                            onClick={() => handleReportComment(comment.commentId, comment.userId!, comment.userName)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #dc3545',
                              color: '#dc3545',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              marginLeft: '8px'
                            }}
                          >
                            신고
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: 14, 
                      color: '#333',
                      lineHeight: 1.5
                    }}>
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default EpisodeViewPage;