'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';

interface NovelInfo {
  novelId: number;
  title: string;
  userId: string;
  episodeCount: number;
}

const EpisodeCreatePage: React.FC = () => {
  const searchParams = useSearchParams();
  const novelId = searchParams.get('novelId');
  
  const [novelInfo, setNovelInfo] = useState<NovelInfo | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeContent, setEpisodeContent] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [currentScene, setCurrentScene] = useState(1);
  const [scenes, setScenes] = useState<string[]>(['']);

  // 작품 정보 가져오기
  useEffect(() => {
    if (novelId) {
      // 실제로는 API에서 작품 정보를 가져와야 함
      setNovelInfo({
        novelId: parseInt(novelId),
        title: '트위터 더 블루 버드',
        userId: '김메타',
        episodeCount: 1
      });
    }
  }, [novelId]);

  // 글자수 계산
  useEffect(() => {
    setCharacterCount(episodeContent.length);
  }, [episodeContent]);

  const handleSavePrivate = () => {
    console.log('비공개 저장');
  };

  const handleSavePublic = () => {
    console.log('공개 저장');
  };

  const handleCreateNewEpisode = () => {
    console.log('새 회차 생성');
  };

  const handleGenerateIllustration = () => {
    console.log('소설 삽화 생성');
  };

  const handleDirectInput = () => {
    console.log('글 직접입력');
  };

  const handleGenerateNextScene = () => {
    console.log('다음 씬 생성');
  };

  const handleGenerateStory = () => {
    console.log('스토리 생성');
  };

  if (!novelInfo) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header title="회차 작성" />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">작품 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="회차 작성" />
      
      <div className="flex h-screen">
        {/* 왼쪽 사이드바 */}
        <div className="w-80 bg-gray-800 text-white p-4 flex flex-col">
          {/* 상단 정보 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-semibold">Qizac</span>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">Lv.1 김메타</div>
              <div className="text-sm text-red-400">보유코인: 0c</div>
              <div className="text-sm">보유포인트: 3950p</div>
            </div>
          </div>

          {/* 등장인물 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <span className="text-sm font-medium">등장인물</span>
            </div>
            <div className="ml-6">
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <span>▶</span>
                <span>김트윗</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 회차 리스트 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">회차 리스트</span>
            </div>
            <div className="ml-6 space-y-2">
              <div className="text-sm text-gray-300">작품 정보 수정</div>
              <div className="text-sm text-gray-300">작품 삭제</div>
              <div className="text-sm text-gray-300">+ 새로운 회차쓰기</div>
              <div className="text-sm text-gray-300">1화</div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 bg-white flex flex-col">
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{novelInfo.title}</h1>
                <p className="text-lg text-gray-600">{novelInfo.episodeCount + 1}화</p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">글자수({characterCount}자)</span>
                <button
                  onClick={handleCreateNewEpisode}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  새 회차 생성
                </button>
                <button
                  onClick={handleSavePrivate}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  비공개 저장
                </button>
                <button
                  onClick={handleSavePublic}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  공개 저장
                </button>
              </div>
            </div>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                회차 제목
              </label>
              <input
                type="text"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                placeholder="회차 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <textarea
                value={episodeContent}
                onChange={(e) => setEpisodeContent(e.target.value)}
                placeholder="내용을 입력하세요"
                className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* 씬 표시 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">#씬{currentScene}</div>
              <div className="text-sm text-gray-600">
                우측 메뉴에서 다음 씬을 생성해주세요.
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드바 */}
        <div className="w-80 bg-gray-800 text-white p-4 flex flex-col">
          {/* 삽화 생성 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">삽화 생성</span>
            </div>
            <button
              onClick={handleGenerateIllustration}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
            >
              소설 삽화 생성하기+
            </button>
          </div>

          {/* 씬 생성 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">씬 생성</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleDirectInput}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                글 직접입력하기+
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateNextScene}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                >
                  다음 씬 생성하기+
                </button>
                <button
                  onClick={handleDirectInput}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
                >
                  직접 입력
                </button>
              </div>
            </div>
          </div>

          {/* 스토리 생성 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">스토리 생성</span>
            </div>
            <button
              onClick={handleGenerateStory}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
            >
              스토리 생성하기+
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCreatePage; 