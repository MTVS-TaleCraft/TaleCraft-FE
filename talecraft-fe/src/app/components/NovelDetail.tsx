import React from 'react';

interface NovelDetailProps {
  title: string;
  author: string;
  summary: string;
  tags: string[];
  bookmarkCount: number;
  commentCount: number;
  titleImage?: string;
}

const NovelDetail: React.FC<NovelDetailProps> = ({
  title,
  author,
  summary,
  tags,
  bookmarkCount,
  commentCount,
  titleImage
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex gap-6">
        {/* 표지 */}
        <div className="w-32 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0">
          {titleImage ? (
            <img 
              src={titleImage} 
              alt={title}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`${titleImage ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
            표지
          </div>
        </div>
        
        {/* 작품 정보 */}
        <div className="flex-1">
          {/* 소설 제목 */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-lg text-gray-600">{author}</p>
          </div>
          
          {/* 북마크, 댓글, 공유 버튼 */}
          <div className="flex gap-3 mb-4">
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              북마크 ({bookmarkCount})
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              댓글 ({commentCount})
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              공유
            </button>
          </div>
          
          {/* 소설 줄거리 */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">줄거리</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 transition-colors">
              더보기
            </button>
          </div>
          
          {/* 태그 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">태그</h3>
              
            </div>
            <div className="flex flex-wrap gap-2">
              {tags && tags.length > 0 ? (
                tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">태그가 없습니다.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelDetail; 