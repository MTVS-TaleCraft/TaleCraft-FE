import React from 'react';
import Link from 'next/link';

interface NovelCardProps {
  id: number;
  title: string;
  author: string;
  genre: string;
  summary?: string;
  coverImage?: string;
}

const NovelCard: React.FC<NovelCardProps> = ({ id, title, author, genre, summary, coverImage }) => {
  // summary를 50자로 제한하고 말줄임표 추가
  const truncatedSummary = summary && summary.length > 50 
    ? summary.substring(0, 50) + '...' 
    : summary;

  return (
    <Link href={`/novel/${id}`} className="block">
      <div className="flex gap-2 mb-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
        {/* 작품 배너 */}
        <div className="w-24 h-32 bg-purple-400 rounded flex items-center justify-center text-white text-xs font-semibold overflow-hidden flex-shrink-0">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`${coverImage ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
            작품 배너
          </div>
        </div>
        {/* 작품 정보 */}
        <div className="flex-1 bg-yellow-200 p-3 rounded">
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-xs text-gray-600 mb-1">{author}</p>
          <p className="text-xs text-gray-500 mb-2">{genre}</p>
          {truncatedSummary && (
            <p className="text-xs text-gray-700 line-clamp-2">{truncatedSummary}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NovelCard; 