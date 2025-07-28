'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GenreFilter from '../components/GenreFilter';
import NovelCard from '../components/NovelCard';
import Link from 'next/link';

interface Novel {
  id: number;
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

const NovelListPage: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchNovels = async (page: number = 0) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/novels?page=${page}&pageSize=12`);
      const data: NovelListResponse = await response.json();

      if (response.ok) {
        setNovels(data.novelList);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setIsLoggedIn(true);
      } else if (response.status === 401) {
        setError('로그인이 필요합니다.');
        setIsLoggedIn(false);
      } else {
        setError('작품 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchNovels(page);
  };

  const filteredNovels = selectedGenre
    ? novels.filter(novel => novel.genre === selectedGenre)
    : novels;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="작품 목록" />
        <main className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">작품 목록을 불러오는 중...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="작품 목록" />
        <main className="p-4">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Link href="/auth-test">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                로그인하기
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="작품 목록" />
        <main className="p-4">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => fetchNovels()}
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
    <div className="min-h-screen bg-white">
      <Header title="작품 목록" />
      
      <main className="p-4">
        <GenreFilter 
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
        />
        
        {filteredNovels.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">표시할 작품이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredNovels.map((novel) => (
                <NovelCard
                  key={novel.id}
                  id={novel.id}
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
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default NovelListPage; 