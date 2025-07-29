'use client';

import React, { useState } from 'react';
import Header from '../components/Header';

const NovelCreatePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [titleImage, setTitleImage] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [availability, setAvailability] = useState<'PUBLIC' | 'PARTIAL' | 'PRIVATE'>('PUBLIC');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTitleImage(file);
    }
  };

  const handleSubmit = async (type: 'save' | 'saveFirst') => {
    setLoading(true);
    setMessage('');

    try {
      const requestData = {
        title,
        summary,
        availability,
        // titleImage는 현재 파일 업로드 기능이 없으므로 제외
      };

      const response = await fetch('/api/novels/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('작품이 성공적으로 생성되었습니다!');
        // 성공 시 폼 초기화
        setTitle('');
        setTitleImage(null);
        setSummary('');
        setAvailability('PUBLIC');
      } else {
        setMessage(data.error || '작품 생성에 실패했습니다.');
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
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="작품 생성 페이지" />
      
      <main className="p-6 max-w-4xl mx-auto">
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

        {/* 태그 */}
        {/* <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 bg-gray-200 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 판타지, 로맨스, 액션)"
          />
        </div> */}

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
            {loading ? '저장 중...' : '저장'}
          </button>
          
          <button
            onClick={() => handleSubmit('saveFirst')}
            disabled={loading || !title || !summary}
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? '저장 중...' : '1회 저장'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default NovelCreatePage; 