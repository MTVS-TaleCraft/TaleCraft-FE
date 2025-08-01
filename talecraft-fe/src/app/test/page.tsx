'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

export default function TestPage() {
  const [showForm, setShowForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleImage: '',
    summary: '',
    availability: 'PUBLIC'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`/api/novels/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: 'test', summary: 'test' }),
        });
        
        if (response.status !== 401) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        // 에러 무시 (로그인되지 않은 상태)
      }
    };

    checkLoginStatus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/novels/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('작품이 성공적으로 생성되었습니다!');
        setFormData({
          title: '',
          titleImage: '',
          summary: '',
          availability: 'PUBLIC'
        });
        setShowForm(false);
      } else {
        setMessage(data.error || '작품 생성에 실패했습니다.');
      }
    } catch (error) {
      setMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">TaleCraft - Test 페이지</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 작품목록페이지 링크 */}
          <Link href="/novel-list">
            <div className="bg-blue-100 p-6 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer">
              <h2 className="text-2xl font-semibold mb-4">작품 목록 페이지</h2>
              <p className="text-gray-600 mb-4">
                다양한 작품들을 장르별로 필터링하여 볼 수 있는 페이지입니다.
              </p>
              <div className="text-sm text-blue-600">클릭하여 이동 →</div>
            </div>
          </Link>
          
          {/* 작품페이지 링크 */}
          <Link href="/novel/1">
            <div className="bg-purple-100 p-6 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer">
              <h2 className="text-2xl font-semibold mb-4">작품 상세 페이지</h2>
              <p className="text-gray-600 mb-4">
                개별 작품의 상세 정보와 에피소드 목록을 확인할 수 있는 페이지입니다.
              </p>
              <div className="text-sm text-purple-600">클릭하여 이동 →</div>
            </div>
          </Link>
        </div>

        {/* 작품 생성 섹션 */}
        <div className="bg-green-50 p-6 rounded-lg mb-8">
          <h3 className="text-2xl font-semibold mb-4">작품 생성 테스트</h3>
          
          {!isLoggedIn ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">작품을 생성하려면 먼저 로그인이 필요합니다.</p>
              <Link href="/auth-test">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  로그인하기
                </button>
              </Link>
            </div>
          ) : (
            <>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  새 작품 생성하기
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목 *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="작품 제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      표지 이미지 URL
                    </label>
                    <input
                      type="url"
                      name="titleImage"
                      value={formData.titleImage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      줄거리 *
                    </label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="작품의 줄거리를 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      공개 설정
                    </label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="PUBLIC">공개</option>
                      <option value="PRIVATE">비공개</option>
                    </select>
                  </div>

                  {message && (
                    <div className={`p-3 rounded-md ${
                      message.includes('성공') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      {isLoading ? '생성 중...' : '작품 생성'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setMessage('');
                        setFormData({
                          title: '',
                          titleImage: '',
                          summary: '',
                          availability: 'PUBLIC'
                        });
                      }}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">구현된 기능</h3>
          <ul className="text-gray-600 space-y-2">
            <li>• 공통 헤더 컴포넌트 (검색 아이콘, 햄버거 메뉴 포함)</li>
            <li>• 장르별 필터링 기능</li>
            <li>• 2열 그리드 레이아웃의 작품 목록</li>
            <li>• 작품 상세 정보 (표지, 제목, 줄거리, 태그)</li>
            <li>• 북마크, 댓글, 공유 기능 UI</li>
            <li>• 에피소드 목록 및 첫 회보기 버튼</li>
            <li>• 작품 생성 API (/api/novels/add)</li>
            <li>• 작품 생성 폼 (제목, 표지이미지, 줄거리, 공개설정)</li>
            <li>• JWT 토큰 기반 인증</li>
            <li>• 로그인 상태 확인 및 안내</li>
          </ul>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 