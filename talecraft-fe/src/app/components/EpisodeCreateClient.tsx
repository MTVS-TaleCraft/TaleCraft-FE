'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthToken, removeAuthToken } from '@/utils/cookies';

interface NovelInfo {
  novelId: number;
  title: string;
  userId: string;
  episodeCount: number;
}

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}
interface Episode {
  episodeId: number;
  title: string;
  content: string;
  note: string;
  createDate: string | null;
  novelId: number;
}
const getSessionKey = (novelId: string | null) => `episode-create-draft-${novelId}`;

const EpisodeCreatePage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const novelId = searchParams.get('novelId');
  const episodeId = searchParams.get('episodeId'); // string | null
  const [novelTitle, setNovelTitle] = useState<string>('');
  const [novelTitleLoading, setNovelTitleLoading] = useState(false);
  const [novelInfo, setNovelInfo] = useState<NovelInfo | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeContent, setEpisodeContent] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isNotice, setIsNotice] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [episode, setEpisode] = useState<Episode | null>(null);

  // Fetch novel title from backend
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Fetch novel information when novelId is available
  useEffect(() => {
    const fetchNovelInfo = async () => {
      if (!novelId) return;

      setNovelTitleLoading(true);
      try {
        const response = await fetch(`/api/novels/${novelId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const novelData = await response.json();
          setNovelTitle(novelData.title);
          setNovelInfo({
            novelId: novelData.novelId,
            title: novelData.title,
            userId: novelData.author,
            episodeCount: novelData.episodeCount || 0,
          });
        } else {
          console.error('작품 정보를 가져오는데 실패했습니다.');
          setNovelTitle('');
        }
      } catch (error) {
        console.error('작품 정보 가져오기 오류:', error);
        setNovelTitle('');
      } finally {
        setNovelTitleLoading(false);
      }
    };

    fetchNovelInfo();

    // ✅ episodeId가 있으면 수정 모드로 전환
    if (episodeId) {
      setIsEditMode(true);
    }
  }, [novelId, episodeId]);

  useEffect(() => {
    const fetchEpisode = async () => {
      if (!isEditMode || !episodeId) return;

      try {
        const episodeResponse = await fetch(`/api/novels/1/episodes/${episodeId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (episodeResponse.ok) {
          const episodeData = await episodeResponse.json();
          setEpisodeTitle(episodeData.title || '');
          setEpisodeContent(episodeData.content || '');
          setIsNotice(Boolean(episodeData.isNotice));  // isNotice 필드가 boolean이라고 가정
        } else {
          console.error('에피소드를 불러오는데 실패했습니다.');
          setEpisodeTitle('');
          setEpisodeContent('');
          setIsNotice(false);
        }
      } catch (error) {
        console.error('에피소드 로딩 중 오류 발생:', error);
        setEpisodeTitle('');
        setEpisodeContent('');
        setIsNotice(false);
      }
    };

    fetchEpisode();
  }, [isEditMode, episodeId, novelId]);
  const handleUpdate = async () => {
    if (!novelId || !episodeId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/novels/${novelId}/episodes/${episodeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: episodeTitle,
          content: episodeContent,
          isNotice: isNotice,  // isNotice 같은 추가 필드도 같이 보낼 수 있음
        }),
      });

      if (response.ok) {
        alert('수정이 완료되었습니다.');
        router.push(`/episode-view/${episodeId}`); // 수정 후 읽기 페이지로 이동
      } else {
        alert('수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('수정 중 오류:', error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };


  const handleCreateEpisode = async () => {
    if (!novelId) {
      alert('작품 ID가 없습니다.');
      return;
    }

    if (!episodeTitle.trim() || !episodeContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/novels/${novelId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: episodeTitle,
          content: episodeContent,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`등록 실패: ${error.message || res.status}`);
        return;
      }

      router.push('/my-novels');
    } catch (err) {
      console.error('에피소드 등록 오류:', err);
      alert('에피소드 등록 중 오류가 발생했습니다.');
    }
  };

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

  // 세션 임시저장 불러오기
  useEffect(() => {
    if (novelId) {
      const key = getSessionKey(novelId);
      const saved = sessionStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEpisodeTitle(parsed.title || '');
          setEpisodeContent(parsed.content || '');
          setIsNotice(parsed.isNotice || false);
        } catch {}
      }
    }
  }, [novelId]);

  // 글자수 계산
  useEffect(() => {
    setCharacterCount(episodeContent.length);
  }, [episodeContent]);

  // 자동 높이조절
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [episodeContent]);

  // 임시저장 (sessionStorage)
  const handleTempSave = () => {
    if (!novelId) return;
    const key = getSessionKey(novelId);
    sessionStorage.setItem(key, JSON.stringify({ 
      title: episodeTitle, 
      content: episodeContent, 
      isNotice: isNotice 
    }));
    setMessage('임시 저장 완료! (이 브라우저에서만 유지)');
  };

  // 공개 저장 (API)
  const handleSave = async () => {
    if (!novelId) return;
    
    // 제목과 내용이 비어있으면 저장하지 않음
    if (!episodeTitle.trim() || !episodeContent.trim()) {
      setMessage('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    setSaving(true);
    setMessage(null);
    
    const requestBody = {
      title: episodeTitle.trim(),
      content: episodeContent.trim(),
      isNotice: isNotice,
    };
    
    console.log('Sending request body:', requestBody);
    
    try {
      const response = await fetch(`/api/novels/${novelId}/episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setMessage('공개 저장 완료!');
        setEpisodeTitle('');
        setEpisodeContent('');
        setIsNotice(false);
        // 공개 저장 성공 시 임시저장 삭제
        const key = getSessionKey(novelId);
        sessionStorage.removeItem(key);
        setTimeout(() => {
          window.location.href = '/my-novels';
        }, 1000);
      } else {
        setMessage(data.error || '저장에 실패했습니다.');
      }
    } catch (e) {
      console.error('Error during save:', e);
      setMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setPreview(true);
  };

  const handleClosePreview = () => {
    setPreview(false);
  };

  const toggleChatSidebar = () => {
    setShowChatSidebar(!showChatSidebar);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage,
          context: {
            novelTitle: novelTitle,
            episodeTitle: episodeTitle,
            episodeContent: episodeContent
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // AI 응답에서 \\를 줄바꿈으로 변환
        const formattedResponse = data.response.replace(/\\\\/g, '\n');
        setChatMessages(prev => [...prev, { type: 'assistant', content: formattedResponse }]);
      } else {
        setChatMessages(prev => [...prev, { type: 'assistant', content: '죄송합니다. 응답을 생성할 수 없습니다.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { type: 'assistant', content: '네트워크 오류가 발생했습니다.' }]);
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

  if (novelTitleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">작품 제목을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!novelId || !novelTitle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">작품 정보를 찾을 수 없습니다.</p>
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
              <div className="text-sm text-gray-600 mb-2">{novelTitle}</div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? episodeTitle || '회차 제목 없음' : '새 회차 작성'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isNotice"
                  checked={isNotice}
                  onChange={(e) => setIsNotice(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isNotice" className="text-sm text-gray-600 cursor-pointer">
                  공지
                </label>
              </div>
              <button
                onClick={handleTempSave}
                disabled={saving}
                className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                임시저장
              </button>
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-gray-100 border border-blue-500 rounded text-sm font-medium text-blue-600 hover:bg-gray-200"
              >
                미리보기
              </button>
              {isEditMode ? (
                  <button
                      onClick={handleUpdate}
                      disabled={saving}
                      className="px-6 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    수정하기
                  </button>
              ) : (
                  <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    공개 저장
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '40px 36px', minHeight: 600 }}>
          {message && (
            <div style={{ marginBottom: 16, color: message.includes('완료') ? '#28a745' : '#dc3545', fontWeight: 600 }}>{message}</div>
          )}
          <div style={{ marginBottom: 32 }}>
            <input
              type="text"
              value={episodeTitle}
              onChange={e => setEpisodeTitle(e.target.value)}
              placeholder="회차 제목을 입력하세요"
              style={{
                width: '100%',
                fontSize: 22,
                fontWeight: 600,
                border: 'none',
                borderBottom: '2px solid #e9ecef',
                outline: 'none',
                padding: '8px 0',
                marginBottom: 8,
                background: 'transparent',
              }}
              maxLength={100}
            />
            <div style={{ fontSize: 13, color: '#bbb', textAlign: 'right' }}>{episodeTitle.length}/100</div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <textarea
              ref={contentRef}
              value={episodeContent}
              onChange={e => setEpisodeContent(e.target.value)}
              placeholder="소설 본문을 입력하세요. (엔터로 줄바꿈)"
              style={{
                width: '100%',
                minHeight: 320,
                fontSize: 17,
                lineHeight: 1.8,
                border: 'none',
                outline: 'none',
                resize: 'none',
                background: 'transparent',
                fontFamily: 'inherit',
                color: '#222',
                marginBottom: 8,
              }}
              maxLength={30000}
            />
            <div style={{ fontSize: 13, color: '#bbb', textAlign: 'right' }}>{characterCount}자</div>
          </div>
        </div>

        {/* Right Toolbar */}
        <div style={{ 
          width: 180, 
          minWidth: 140, 
          position: 'fixed', 
          top: 96, 
          right: 'calc(50% - 400px - 220px)', 
          zIndex: isSidebarOpen ? 30 : 100 
        }}>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '24px 16px', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#007bff' }}>툴박스</div>
            <button
              onClick={() => {
                if (confirm('정말로 이 에피소드를 삭제하시겠습니까?')) {
                  // 에피소드 삭제 기능 (현재는 새로 작성 중이므로 임시저장 삭제)
                  if (novelId) {
                    const key = getSessionKey(novelId);
                    sessionStorage.removeItem(key);
                    setEpisodeTitle('');
                    setEpisodeContent('');
                    setIsNotice(false);
                    setMessage('임시저장이 삭제되었습니다.');
                  }
                }
              }}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid #dc3545',
                borderRadius: 6,
                padding: '10px 0',
                fontWeight: 600,
                color: '#dc3545',
                marginBottom: 10,
                cursor: 'pointer',
                fontSize: 15
              }}
            >
              에피소드 삭제
            </button>
            <button
                onClick={handleCreateEpisode}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '1px solid #28a745',
                  borderRadius: 6,
                  padding: '10px 0',
                  fontWeight: 600,
                  color: '#28a745',
                  marginBottom: 10,
                  cursor: 'pointer',
                  fontSize: 15
                }}
            >
              새 에피소드 작성
            </button>
            <button
              onClick={toggleChatSidebar}
              style={{
                width: '100%',
                background: '#fff',
                border: '1px solid #ffc107',
                borderRadius: 6,
                padding: '10px 0',
                fontWeight: 600,
                color: '#ffc107',
                cursor: 'pointer',
                fontSize: 15
              }}
              title="에피소드를 먼저 저장한 후 사용할 수 있습니다"
            >
              창작 도우미 채팅
            </button>
          </div>
        </div>
      </main>

      {/* Chat Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        background: '#fff',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        transform: showChatSidebar ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>창작 도우미</div>
          <button
            onClick={toggleChatSidebar}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              color: '#666',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {chatMessages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', fontSize: 14, marginTop: '20px' }}>
              제목과 이전화를 전부 입력하시면 다음화를 작성해 드립니다.
            </div>
          )}
          {chatMessages.map((msg, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              opacity: 0,
              animation: 'fadeIn 0.3s ease-in-out forwards',
              animationDelay: `${index * 0.1}s`,
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '18px',
                background: msg.type === 'user' ? '#007bff' : '#f8f9fa',
                color: msg.type === 'user' ? '#fff' : '#333',
                fontSize: 14,
                lineHeight: 1.4,
              }}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          gap: '8px',
        }}>
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              outline: 'none',
              fontSize: 14,
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              overflowY: 'auto',
              lineHeight: '1.4',
              fontFamily: 'inherit',
            }}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleChatSend}
            style={{
              padding: '12px 16px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            전송
          </button>
        </div>
      </div>

      {/* Overlay for sidebar */}
      {showChatSidebar && (
        <div 
          onClick={toggleChatSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999,
            opacity: 0,
            animation: 'fadeIn 0.3s ease-in-out forwards',
          }}
        />
      )}

      {/* Preview Modal */}
      {preview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            width: 600,
            maxWidth: '90vw',
            padding: 40,
            position: 'relative',
          }}>
            <button
              onClick={handleClosePreview}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#bbb',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>{episodeTitle || '제목 없음'}</div>
            <div style={{ fontSize: 15, color: '#888', marginBottom: 24 }}>{novelTitle} | </div>
            <div style={{ fontSize: 16, lineHeight: 1.8, color: '#222', whiteSpace: 'pre-line' }}>{episodeContent || '본문이 없습니다.'}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

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

export default EpisodeCreatePage; 