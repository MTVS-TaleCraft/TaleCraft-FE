import React from 'react';

interface Episode {
  id: number;
  title: string;
  episodeNumber: number;
  date: string;
}

interface EpisodeListProps {
  episodes: Episode[];
  totalEpisodes: number;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, totalEpisodes }) => {
  return (
    <div className="mt-6">
      {/* 에피소드 헤더 */}
      <div className="bg-black text-white p-3 rounded mb-4">
        <h2 className="text-lg font-semibold">작품 회차 ({totalEpisodes}화)</h2>
      </div>
      
      {/* 정렬 옵션 */}
      <div className="mb-4">
        <span className="text-sm text-gray-600">최신순 / 1화부터</span>
      </div>
      
      {/* 에피소드 목록 */}
      <div className="space-y-3">
        {episodes.map((episode) => (
          <div key={episode.id} className="flex gap-3">
            {/* 에피소드 표지 */}
            <div className="w-16 h-20 bg-purple-400 rounded flex items-center justify-center text-white text-xs font-semibold">
              표지
            </div>
            {/* 에피소드 정보 */}
            <div className="flex-1 bg-yellow-200 p-3 rounded">
              <h3 className="font-semibold text-sm">{episode.title}</h3>
              <p className="text-xs text-gray-600">{episode.episodeNumber}화</p>
              <p className="text-xs text-gray-500">{episode.date}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* 첫 회보기 버튼 */}
      <button className="w-full bg-black text-white py-3 rounded mt-4 font-semibold">
        첫 회보기
      </button>
    </div>
  );
};

export default EpisodeList; 