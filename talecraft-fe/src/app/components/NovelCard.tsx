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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group">
        <div className="flex gap-4">
          {/* 작품 배너 */}
          <div className="w-20 h-28 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-semibold overflow-hidden flex-shrink-0 group-hover:shadow-md transition-shadow">
            {coverImage ? (
              <img 
                src={coverImage} 
                alt={title}
                className="w-full h-full object-cover rounded-lg"
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
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                {title}
              </h3>
              <p className="text-xs text-gray-600 mb-1">{author}</p>
            </div>
            
            
            
            {truncatedSummary && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                  {truncatedSummary}
                </p>
              </div>
            )}
            
            {/* 추가 정보 (예: 조회수, 평점 등) */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/*평점 <div></div>*/}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {/*북마크  <div></div>*/}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
               {/*조회수 <div></div>*/}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NovelCard; 