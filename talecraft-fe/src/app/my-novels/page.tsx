'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

interface MyNovel {
  novelId: number;
  title: string;
  userId: string;
  titleImage?: string;
  episodeCount: number;
  lastUpdated: string;
  // 필요하다면 아래 필드도 추가
  summary?: string;
  availability?: string;
  isFinished?: boolean;
  isDeleted?: boolean;
  isBanned?: boolean;
}

const MyNovelsPage: React.FC = () => {
  const [novels, setNovels] = useState<MyNovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'bookmarked' | 'my'>('my');

  const fetchMyNovelsFromApi = async () => {
    const res = await fetch('/api/novels/my', { method: 'GET', cache: 'no-store' });
    if (!res.ok) throw new Error('작품 목록을 불러오는데 실패했습니다.');
    return res.json();
  };

  useEffect(() => {
    const fetchMyNovels = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchMyNovelsFromApi();
        // data.novelList를 MyNovel[] 형태로 변환
        const novels: MyNovel[] = data.novelList.map((novel: any) => ({
          novelId: novel.novelId,
          title: novel.title,
          userId: novel.userId,
          titleImage: novel.titleImage,
          episodeCount: 0, // API에 없으면 0 또는 별도 처리
          lastUpdated: '', // API에 없으면 빈 값 또는 별도 처리
        }));
        setNovels(novels);
      } catch (error) {
        setError('작품 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyNovels();
  }, []);

  const handleSearch = () => {
    // 검색 기능 구현 (필터링)
    console.log('검색:', searchTerm);
  };

  const handleEditNovel = (novelId: number) => {
    // 작품 수정 페이지로 이동
    console.log('작품 수정:', novelId);
  };

  const handleWriteEpisode = (novelId: number) => {
    // 화 쓰기 페이지로 이동
    console.log('화 쓰기:', novelId);
  };

  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    novel.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header title="마이 작품 목록 페이지" />
        <main className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">작품 목록을 불러오는 중...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header title="마이 작품 목록 페이지" />
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
    <div className="min-h-screen bg-gray-100">
      <Header title="마이 작품 목록 페이지" />
      
      <main className="p-4">
        {/* 검색 및 필터 섹션 */}
        <div className="bg-orange-200 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* 필터 버튼들 */}
            <button
              onClick={() => setFilterType('bookmarked')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'bookmarked' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              북마크
            </button>
            <button
              onClick={() => setFilterType('my')}
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
                onClick={handleSearch}
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
        <div className="bg-orange-200 p-4 rounded-lg">
          <div className="space-y-4">
            {filteredNovels.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 작품이 없습니다.'}
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
                    <h3 className="font-semibold text-lg mb-2">{novel.title}</h3>
                    <p className="text-sm text-gray-600">{novel.userId}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {novel.episodeCount}화 • {novel.lastUpdated}
                    </p>
                  </div>
                  
                  {/* 액션 버튼들 */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
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
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* 스크롤 화살표 */}
          {filteredNovels.length > 3 && (
            <div className="text-center mt-6">
              <svg className="w-8 h-8 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyNovelsPage; 