'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import { API_BASE_URL } from '../../config/api';

interface NovelData {
  novelId: number;
  title: string;
  summary: string;
  availability: 'PUBLIC' | 'PARTIAL' | 'PRIVATE';
  titleImage?: string;
}

const NovelCreatePage: React.FC = () => {
  const searchParams = useSearchParams();
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
        })
        .catch(() => {
          setMessage('작품 정보를 불러오는데 실패했습니다.');
        })
        .finally(() => {
          setLoadingNovel(false);
        });
    }
  }, [novelId]);

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
        // 성공 시 폼 초기화 (수정 모드가 아닌 경우에만)
        if (!isEditMode) {
          setTitle('');
          setTitleImage(null);
          setSummary('');
          setAvailability('PUBLIC');
          setExistingTitleImage('');
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
  };

  if (loadingNovel) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="작품 생성 페이지" />
        <main className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">작품 정보를 불러오는 중...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title={isEditMode ? "작품 수정 페이지" : "작품 생성 페이지"} />
      
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
    </div>
  );
};

export default NovelCreatePage; 