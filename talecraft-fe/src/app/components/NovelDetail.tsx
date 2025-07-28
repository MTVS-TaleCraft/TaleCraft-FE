import React from 'react';

interface NovelDetailProps {
  title: string;
  author: string;
  synopsis: string;
  tags: string[];
  bookmarkCount: number;
  commentCount: number;
}

const NovelDetail: React.FC<NovelDetailProps> = ({
  title,
  author,
  synopsis,
  tags,
  bookmarkCount,
  commentCount
}) => {
  return (
    <div className="flex gap-4 mb-6">
      {/* 표지 */}
      <div className="w-32 h-48 bg-purple-400 rounded flex items-center justify-center text-white text-sm font-semibold">
        표지
      </div>
      
      {/* 작품 정보 */}
      <div className="flex-1">
        {/* 소설 제목 */}
        <div className="bg-yellow-200 p-3 rounded mb-3">
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-sm text-gray-600">{author}</p>
        </div>
        
        {/* 북마크, 댓글, 공유 버튼 */}
        <div className="flex gap-2 mb-3">
          <div className="bg-yellow-200 px-3 py-2 rounded text-sm">
            북마크 및 북마크 수 ({bookmarkCount})
          </div>
          <div className="bg-yellow-200 px-3 py-2 rounded text-sm">
            댓글 수 ({commentCount})
          </div>
          <div className="bg-yellow-200 px-3 py-2 rounded text-sm">
            공유
          </div>
        </div>
        
        {/* 소설 줄거리 */}
        <div className="bg-yellow-200 p-3 rounded mb-3">
          <p className="text-sm">{synopsis}</p>
          <button className="text-xs text-blue-600 mt-2">더보기</button>
        </div>
        
        {/* 태그 */}
        <div className="bg-yellow-200 p-3 rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm">태그</span>
            <button className="text-xs text-blue-600">더보기</button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, index) => (
              <span key={index} className="bg-gray-200 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelDetail; 