'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import NovelDetail from '../../components/NovelDetail';
import EpisodeList from '../../components/EpisodeList';
import { API_BASE_URL } from '../../../config/api';

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
  view: number;
  note: string;
  createDate: string | null;
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
        const novelResponse = await fetch(`/api/novels/${novelId}`, {
          credentials: 'include'
        });
        const novelData = await novelResponse.json();
        const episodeResponse = await fetch(`/api/novels/${novelId}/episodes`, {
          credentials: 'include'
        });
        const episodeData = await episodeResponse.json();
        if (novelResponse.ok) {
          setNovel(novelData);
      
          // episodeData가 유효한 에피소드 데이터인지 확인
          if (episodeData && episodeData.episodesList && Array.isArray(episodeData.episodesList)) {
            setEpisodes(episodeData.episodesList);
          } else {
            setEpisodes([]);
          }
        } else if (novelResponse.status === 401||episodeResponse.status === 401) {
          setError('로그인이 필요합니다.');
        } else {
          setError(novelData.message || '작품 정보를 불러오는데 실패했습니다.');
          setError(episodeData.message || '에피소드 정보를 불러오는데 실패했습니다.');
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
    <div className="min-h-screen bg-gray-50">
      <Header title="작품 상세" />
      
      <main className="p-6 max-w-4xl mx-auto">
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
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">에피소드 목록</h2>
          </div>
          <div className="p-6">
            {episodes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">아직 등록된 화가 없습니다.</div>
                <div className="text-gray-400 text-sm">첫 번째 화를 작성해보세요!</div>
              </div>
            ) : (
              <div className="space-y-3">
                {episodes.map((ep) => (
                  <div key={ep.episodeId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{ep.title}</div>
                      <div className="text-sm text-gray-500">
                        조회수: {ep.view} • {ep.createDate ? new Date(ep.createDate).toLocaleDateString() : '날짜 없음'}
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={() => window.location.href = `/episode-view/${ep.episodeId}`}
                    >
                      읽기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NovelPage; 