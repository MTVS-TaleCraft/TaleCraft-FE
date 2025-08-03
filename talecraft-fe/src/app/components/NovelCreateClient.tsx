'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthToken, removeAuthToken } from '@/utils/cookies';
import { API_BASE_URL } from '../../config/api';

interface NovelData {
  novelId: number;
  title: string;
  summary: string;
  availability: 'PUBLIC' | 'PARTIAL' | 'PRIVATE';
  titleImage?: string;
  tags?: string[];
}

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

const NovelCreatePage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const novelId = searchParams.get('novelId');
  const isEditMode = !!novelId;

  const [title, setTitle] = useState('');
  const [titleImage, setTitleImage] = useState<File | null>(null);
  const [existingTitleImage, setExistingTitleImage] = useState<string>('');
  const [summary, setSummary] = useState('');
  const [availability, setAvailability] = useState<'PUBLIC' | 'PARTIAL' | 'PRIVATE'>('PUBLIC');
  const [loading, setLoading] = useState(false);
  const [loadingNovel, setLoadingNovel] = useState(false);
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [commonTags, setCommonTags] = useState<string[]>([]);
  const [loadingCommonTags, setLoadingCommonTags] = useState(false);
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

  // 기존 작품 데이터 불러오기
  useEffect(() => {
    if (novelId) {
      setLoadingNovel(true);
      fetch(`/api/novels/${novelId}`, { credentials: 'include' })
        .then(res => res.json())
        .then((data: NovelData) => {
          setTitle(data.title || '');
          setSummary(data.summary || '');
          setAvailability(data.availability || 'PUBLIC');
          setExistingTitleImage(data.titleImage || '');
          setTags(data.tags || []);
        })
        .catch(() => {
          setMessage('작품 정보를 불러오는데 실패했습니다.');
        })
        .finally(() => {
          setLoadingNovel(false);
        });
    }
  }, [novelId]);

  // 기본 태그 불러오기
  useEffect(() => {
    setLoadingCommonTags(true);
    fetch('/api/tags/common', { credentials: 'include' })
      .then(res => res.json())
      .then((data) => {
        if (data.commonTags && Array.isArray(data.commonTags)) {
          setCommonTags(data.commonTags);
        }
      })
      .catch(() => {
        console.log('기본 태그 정보를 불러오는데 실패했습니다.');
      })
      .finally(() => {
        setLoadingCommonTags(false);
      });
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTitleImage(file);
      setExistingTitleImage(''); // 새 이미지 선택 시 기존 이미지 제거
    }
  };

  const handleSubmit = async (type: 'save' | 'saveFirst') => {
    setLoading(true);
    setMessage('');

    try {
      let imageUrl = existingTitleImage; // 기존 이미지 URL 사용

      // 새 이미지가 선택된 경우에만 S3 업로드
      if (titleImage) {
        const selectedFile = titleImage;
        // 1. 백엔드에서 presigned URL 및 public URL 받기
        const res = await fetch(`/api/s3/presigned-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ fileName: selectedFile.name }),
        });
        const { presignedUrl, publicUrl } = await res.json(); 
        
        // 2. presignedUrl에 PUT 요청으로 이미지 S3에 업로드
        const uploadRes = await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type,
          },
          body: selectedFile,
        });
        
        if (!uploadRes.ok) {
          alert('S3 업로드 실패');
          return;
        }
        
        imageUrl = publicUrl;
      }

      const requestData = {
        title,
        summary,
        availability,
        titleImage: imageUrl
      };

      // 수정 모드인지 생성 모드인지에 따라 다른 API 호출
      const apiUrl = isEditMode ? `/api/novels/${novelId}` : `/api/novels/add`;
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

             if (response.ok) {
         setMessage(isEditMode ? '작품이 성공적으로 수정되었습니다!' : '작품이 성공적으로 생성되었습니다!');
         
         // 태그 저장 (수정 모드인 경우)
         if (isEditMode && novelId) {
           await saveTagsToBackend(novelId, tags);
         }
         // 새 작품 생성 시 태그 저장
         else if (!isEditMode && data.novelId) {
           await saveTagsToBackend(data.novelId.toString(), tags);
         }
         
         // 성공 시 폼 초기화 (수정 모드가 아닌 경우에만)
         if (!isEditMode) {
           setTitle('');
           setTitleImage(null);
           setSummary('');
           setAvailability('PUBLIC');
           setExistingTitleImage('');
           setTags([]);
           setTagInput('');
           setShowTagInput(false);
         }
       } else {
         setMessage(data.error || (isEditMode ? '작품 수정에 실패했습니다.' : '작품 생성에 실패했습니다.'));
       }
    } catch (error) {
      setMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // 취소 시 폼 초기화
    setTitle('');
    setTitleImage(null);
    setSummary('');
    setAvailability('PUBLIC');
    setMessage('');
    setExistingTitleImage('');
    setTags([]);
    setTagInput('');
    setShowTagInput(false);
  };

  // 태그 추가 함수
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
      setShowTagInput(false);
    }
  };

  // 태그 삭제 함수
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 태그 입력 키 이벤트 처리
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setTagInput('');
    }
  };

  // 태그를 백엔드에 저장하는 함수
  const saveTagsToBackend = async (novelId: string, tags: string[]) => {
    try {
      // 기존 태그 모두 삭제
      await fetch(`/api/tags/novels/${novelId}/all`, {
        method: 'DELETE',
        credentials: 'include'
      });

      // 새 태그들 추가
      if (tags.length > 0) {
        await fetch(`/api/tags/novels/${novelId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ tagNames: tags })
        });
      }
    } catch (error) {
      console.error('태그 저장 중 오류:', error);
    }
  };

  // 기본 태그 추가 함수
  const handleAddCommonTag = async (tagName: string) => {
    if (tags.includes(tagName)) {
      alert('이미 추가된 태그입니다.');
      return;
    }

    try {
      if (isEditMode && novelId) {
        // 수정 모드: 바로 작품에 추가
        const response = await fetch(`/api/tags/novels/${novelId}/common/${encodeURIComponent(tagName)}`, {
          method: 'POST',
          credentials: 'include'
        });
        
        if (response.ok) {
          setTags([...tags, tagName]);
        } else {
          alert('기본 태그 추가에 실패했습니다.');
        }
      } else {
        // 생성 모드: 임시로 상태에만 추가
        setTags([...tags, tagName]);
      }
    } catch (error) {
      console.error('기본 태그 추가 중 오류:', error);
      alert('기본 태그 추가 중 오류가 발생했습니다.');
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

  if (loadingNovel) {
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
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          {isEditMode ? "작품 수정 페이지" : "작품 생성 페이지"}
        </h2>
        
        {/* 제목 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-gray-200 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="작품 제목을 입력하세요"
          />
        </div>

        {/* 표지 이미지 등록 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            표지 이미지
          </label>
          <div className="flex gap-4">
            <div className="w-48 h-48 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-white text-center">
              {titleImage ? (
                <div className="w-full h-full relative">
                  <img
                    src={URL.createObjectURL(titleImage)}
                    alt="표지 미리보기"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setTitleImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : existingTitleImage ? (
                <div className="w-full h-full relative">
                  <img
                    src={existingTitleImage}
                    alt="기존 표지"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setExistingTitleImage('')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm mb-2 text-black">표지 이미지</div>
                  <div className="text-sm text-black">등록</div>
                </div>
              )}
            </div>
            <div className="flex-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="title-image"
              />
              <label
                htmlFor="title-image"
                className="bg-gray-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
              >
                이미지 선택
              </label>
            </div>
          </div>
        </div>

        {/* 작품 소개 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            작품 소개
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full h-48 p-3 bg-gray-200 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="작품의 줄거리나 소개를 입력하세요"
          />
        </div>

        {/* 태그 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그
          </label>
          <div className="space-y-3">
            {/* 기본 태그 목록 */}
            {!loadingCommonTags && commonTags.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">기본 태그</div>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddCommonTag(tag)}
                      disabled={tags.includes(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        tags.includes(tag)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 태그 목록 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-500 hover:text-blue-700 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* 태그 입력 영역 */}
            {showTagInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="flex-1 p-2 bg-gray-200 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="태그를 입력하고 엔터를 누르세요"
                  autoFocus
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setShowTagInput(false);
                    setTagInput('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                태그 추가
              </button>
            )}
          </div>
        </div>

        {/* 공개 설정 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            공개 설정
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="PUBLIC"
                checked={availability === 'PUBLIC'}
                onChange={(e) => setAvailability(e.target.value as 'PUBLIC' | 'PARTIAL' | 'PRIVATE')}
                className="mr-2"
              />
              <span className="text-sm">PUBLIC - 모든 사용자에게 공개</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="PARTIAL"
                checked={availability === 'PARTIAL'}
                onChange={(e) => setAvailability(e.target.value as 'PUBLIC' | 'PARTIAL' | 'PRIVATE')}
                className="mr-2"
              />
              <span className="text-sm">PARTIAL - 일부 사용자에게만 공개</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="PRIVATE"
                checked={availability === 'PRIVATE'}
                onChange={(e) => setAvailability(e.target.value as 'PUBLIC' | 'PARTIAL' | 'PRIVATE')}
                className="mr-2"
              />
              <span className="text-sm">PRIVATE - 비공개</span>
            </label>
          </div>
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes('성공') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* 하단 액션 버튼들 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          
          <button
            onClick={() => handleSubmit('save')}
            disabled={loading || !title || !summary}
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? '저장 중...' : (isEditMode ? '수정' : '저장')}
          </button>
          
          {!isEditMode && (
            <button
              onClick={() => handleSubmit('saveFirst')}
              disabled={loading || !title || !summary}
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : '1회 저장'}
            </button>
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

export default NovelCreatePage; 