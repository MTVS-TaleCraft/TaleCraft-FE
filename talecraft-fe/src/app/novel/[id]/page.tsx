'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import NovelDetail from '../../components/NovelDetail';
import EpisodeList from '../../components/EpisodeList';

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
  episodeNumber: number;
  date: string;
}

const NovelPage: React.FC = () => {
  const params = useParams();
  const novelId = params.id as string;
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchNovelDetail = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/novels/${novelId}`);
        const data = await response.json();

        if (response.ok) {
          setNovel(data);
          // 에피소드 데이터는 별도로 가져와야 할 수도 있음
          // 임시로 더미 데이터 사용
          setEpisodes([
            { episodeId: 1, title: '첫 번째 에피소드', episodeNumber: 1, date: '2024-01-01' },
            { episodeId: 2, title: '두 번째 에피소드', episodeNumber: 2, date: '2024-01-08' },
            { episodeId: 3, title: '세 번째 에피소드', episodeNumber: 3, date: '2024-01-15' },
          ]);
        } else if (response.status === 401) {
          setError('로그인이 필요합니다.');
        } else {
          setError(data.message || '작품 정보를 불러오는데 실패했습니다.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="작품 상세" />
        <main className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">작품 정보를 불러오는 중...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="작품 상세" />
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
      <div className="min-h-screen bg-white">
        <Header title="작품 상세" />
        <main className="p-4">
          <div className="text-center">
            <div className="text-gray-600">작품을 찾을 수 없습니다.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="작품 상세" />
      
      <main className="p-4">
        {/* 작품 상세 정보 */}
        <NovelDetail
          title={novel.title}
          author={novel.author}
          summary={novel.summary}
          tags={novel.tags}
          bookmarkCount={novel.bookmarkCount}
          commentCount={novel.commentCount}
          titleImage={novel.titleImage}
        />
        
        {/* 에피소드 목록 */}
        <EpisodeList
          episodes={episodes}
          totalEpisodes={episodes.length}
        />
      </main>
    </div>
  );
};

export default NovelPage; 