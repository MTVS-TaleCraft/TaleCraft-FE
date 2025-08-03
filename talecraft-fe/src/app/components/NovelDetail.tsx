import React, { useState, useEffect } from 'react';

interface NovelDetailProps {
  title: string;
  author: string;
  summary: string;
  tags: string[];
  bookmarkCount: number;
  commentCount: number;
  titleImage?: string;
  novelId: number;
}

const NovelDetail: React.FC<NovelDetailProps> = ({
  title,
  author,
  summary,
  tags,
  bookmarkCount,
  commentCount,
  titleImage,
  novelId
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: string, userName: string} | null>(null);
  const [isMyNovel, setIsMyNovel] = useState(false);

  // 북마크 상태 확인
  const checkBookmarkStatus = async () => {
    console.log('북마크 상태 확인 시작:', novelId);
    try {
      const response = await fetch(`/api/novels/bookmarks/check/${novelId}`, {
        credentials: 'include'
      });
      
      console.log('북마크 상태 확인 응답:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('북마크 상태 데이터:', data);
        setIsBookmarked(data.isBookmarked || false);
      } else if (response.status === 401) {
        console.log('로그인 필요');
        setIsBookmarked(false);
      } else {
        console.error('북마크 상태 확인 실패:', response.status);
        setIsBookmarked(false);
      }
    } catch (error) {
      console.error('북마크 상태 확인 실패:', error);
      setIsBookmarked(false);
    }
  };

  // 현재 사용자 정보 가져오기
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('현재 사용자 정보:', userData);
        console.log('작품 저자:', author);
        console.log('사용자 ID:', userData.userId);
        console.log('사용자 이름:', userData.userName);
        console.log('저자와 일치하는가 (userId):', userData.userId === author);
        console.log('저자와 일치하는가 (userName):', userData.userName === author);
        
        setCurrentUser(userData);
        // 현재 사용자가 작품의 저자인지 확인 (userName으로 비교)
        const isMyNovelValue = userData.userName === author;
        console.log('isMyNovel 설정:', isMyNovelValue);
        setIsMyNovel(isMyNovelValue);
      } else {
        console.log('사용자 정보 가져오기 실패 - 응답 상태:', response.status);
        setCurrentUser(null);
        setIsMyNovel(false);
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      setCurrentUser(null);
      setIsMyNovel(false);
    }
  };

  useEffect(() => {
    if (novelId) {
      setIsLoading(false); // 로딩 상태 초기화
      checkBookmarkStatus();
      fetchCurrentUser();
    }
  }, [novelId, author]);

  // 북마크 토글 함수
  const handleBookmarkToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const previousState = isBookmarked;
    
    try {
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/novels/bookmarks/${novelId}`, {
        method,
        credentials: 'include'
      });
      
      if (response.ok) {
        // 성공 시 즉시 상태 변경
        setIsBookmarked(!isBookmarked);
        // 성공 메시지 표시
        alert(isBookmarked ? '북마크가 해제되었습니다.' : '북마크가 추가되었습니다.');
      } else if (response.status === 401) {
        alert('로그인이 필요합니다.');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '북마크 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      alert('북마크 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 신고 함수
  const handleReportNovel = async () => {
    const description = prompt('신고 사유를 입력해주세요:');
    if (!description) return;

    // 신고 태그 선택
    const reportTags = ['욕설/비방', '스팸', '부적절한 내용', '저작권 침해', '기타'];
    const reportTag = prompt(`신고 유형을 선택해주세요:\n${reportTags.map((tag, index) => `${index + 1}. ${tag}`).join('\n')}\n\n번호를 입력하세요 (1-${reportTags.length}):`);
    
    if (!reportTag) return;
    
    const selectedTagIndex = parseInt(reportTag) - 1;
    if (isNaN(selectedTagIndex) || selectedTagIndex < 0 || selectedTagIndex >= reportTags.length) {
      alert('올바른 번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/reports/novels', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          novelId: novelId,
          reportedUser: author, // 작품의 저자를 신고 대상으로 설정
          reportTag: reportTags[selectedTagIndex],
          description: description
        })
      });
      
      if (response.ok) {
        alert('신고가 접수되었습니다.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '신고 접수에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error reporting novel:', error);
      alert('신고 접수 중 오류가 발생했습니다.');
    }
  };

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
            {/* 디버깅 정보 */}
            <div style={{display: 'none'}}>
              isMyNovel: {isMyNovel.toString()}, 
              currentUser: {currentUser ? currentUser.userId : 'null'}, 
              author: {author}
            </div>
            {/* 북마크 버튼 - 자신의 작품이 아닐 때만 표시 */}
            {!isMyNovel && (
              <button 
                onClick={handleBookmarkToggle}
                disabled={isLoading}
                className={`${
                  isBookmarked 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                } px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {isBookmarked ? '북마크됨' : `북마크${bookmarkCount !== undefined ? ` (${bookmarkCount})` : ''}`}
              </button>
            )}
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
            {/* 신고 버튼 - 자신의 작품이 아닐 때만 표시 */}
            {!isMyNovel && (
              <button 
                onClick={handleReportNovel}
                disabled={isLoading}
                className={`${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10h-1.26A8 8 0 109 21v-2.257A7 7 0 006 13c0-2.821 1.79-5.14 4.35-6.003A8 8 0 1018 10z" />
                </svg>
                신고
              </button>
            )}
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