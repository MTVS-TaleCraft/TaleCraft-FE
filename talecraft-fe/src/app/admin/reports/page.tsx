'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

interface UserReport {
  id: string;
  reportTag: string;
  reportingUser: string;
  reportedUser: string;
  reportDate: string;
  reportContent: string;
  processingStatus: string;
  type?: string;
}

export default function ReportManagementPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'reports' | 'users'>('reports');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchSettingsOpen, setIsSearchSettingsOpen] = useState(false);
  const [searchType, setSearchType] = useState<'reason' | 'reporter' | 'reported'>('reason');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:8081/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        
        // 관리자 권한 확인 (authorityId가 3이 아니면 접근 거부)
        if (data.authorityId !== "3") {
          alert('관리자 권한이 필요합니다.');
          router.push('/');
          return;
        }
        
        // 신고 목록 가져오기
        fetchReports();
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/reports/unviewed', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('백엔드에서 받은 신고 데이터:', data);
        
        // 백엔드에서 빈 배열이 오거나 데이터가 없으면 더미 데이터 사용
        if (!data || data.length === 0) {
          console.log('백엔드에서 빈 데이터가 와서 더미 데이터를 사용합니다.');
          setReports([
            {
              id: "report1",
              reportTag: "부적절한 언어",
              reportingUser: "user1",
              reportedUser: "user2",
              reportDate: "2024-01-15",
              reportContent: "부적절한 언어를 사용했습니다.",
              processingStatus: "처리 전",
            },
            {
              id: "report2",
              reportTag: "스팸",
              reportingUser: "user3",
              reportedUser: "user4",
              reportDate: "2024-01-14",
              reportContent: "스팸성 댓글을 반복적으로 작성했습니다.",
              processingStatus: "처리 전",
            },
            {
              id: "report3",
              reportTag: "저작권 침해",
              reportingUser: "user5",
              reportedUser: "user6",
              reportDate: "2024-01-13",
              reportContent: "타인의 저작물을 무단으로 사용했습니다.",
              processingStatus: "처리 완료",
            },
            {
              id: "report4",
              reportTag: "폭력적 내용",
              reportingUser: "user7",
              reportedUser: "user8",
              reportDate: "2024-01-12",
              reportContent: "폭력적인 내용을 포함한 게시물을 작성했습니다.",
              processingStatus: "처리 전",
            },
            {
              id: "report5",
              reportTag: "개인정보 유출",
              reportingUser: "user9",
              reportedUser: "user10",
              reportDate: "2024-01-11",
              reportContent: "타인의 개인정보를 무단으로 공개했습니다.",
              processingStatus: "처리 전",
            },
          ]);
        } else {
          // 백엔드 데이터를 프론트엔드 형식으로 변환
          const formattedReports = data.map((report: {
            commentReportId: number;
            reportTag: string;
            reportUser: string;
            reportedUser: string;
            reportDate?: string | Date;
            description: string;
            isView: boolean;
          }) => ({
            id: `comment_${report.commentReportId}`,
            reportTag: report.reportTag,
            reportingUser: report.reportUser,
            reportedUser: report.reportedUser,
            reportDate: report.reportDate ? new Date(report.reportDate).toLocaleDateString() : "날짜 없음",
            reportContent: report.description,
            processingStatus: report.isView ? "처리 완료" : "처리 전",
            type: "comment"
          }));
          setReports(formattedReports);
        }
      } else {
        console.error('신고 목록 가져오기 실패:', response.status);
        // 백엔드 API가 없거나 실패할 때 더미 데이터 사용
        console.log('더미 데이터를 사용합니다.');
        setReports([
          {
            id: "report1",
            reportTag: "부적절한 언어",
            reportingUser: "user1",
            reportedUser: "user2",
            reportDate: "2024-01-15",
            reportContent: "부적절한 언어를 사용했습니다.",
            processingStatus: "처리 전",
          },
          {
            id: "report2",
            reportTag: "스팸",
            reportingUser: "user3",
            reportedUser: "user4",
            reportDate: "2024-01-14",
            reportContent: "스팸성 댓글을 반복적으로 작성했습니다.",
            processingStatus: "처리 전",
          },
          {
            id: "report3",
            reportTag: "저작권 침해",
            reportingUser: "user5",
            reportedUser: "user6",
            reportDate: "2024-01-13",
            reportContent: "타인의 저작물을 무단으로 사용했습니다.",
            processingStatus: "처리 완료",
          },
          {
            id: "report4",
            reportTag: "폭력적 내용",
            reportingUser: "user7",
            reportedUser: "user8",
            reportDate: "2024-01-12",
            reportContent: "폭력적인 내용을 포함한 게시물을 작성했습니다.",
            processingStatus: "처리 전",
          },
          {
            id: "report5",
            reportTag: "개인정보 유출",
            reportingUser: "user9",
            reportedUser: "user10",
            reportDate: "2024-01-11",
            reportContent: "타인의 개인정보를 무단으로 공개했습니다.",
            processingStatus: "처리 전",
          },
        ]);
      }
    } catch (error) {
      console.error('신고 목록 가져오기 실패:', error);
      // 네트워크 오류나 기타 예외 발생 시 더미 데이터 사용
      console.log('네트워크 오류로 더미 데이터를 사용합니다.');
      setReports([
        {
          id: "report1",
          reportTag: "부적절한 언어",
          reportingUser: "user1",
          reportedUser: "user2",
          reportDate: "2024-01-15",
          reportContent: "부적절한 언어를 사용했습니다.",
          processingStatus: "처리 전",
        },
        {
          id: "report2",
          reportTag: "스팸",
          reportingUser: "user3",
          reportedUser: "user4",
          reportDate: "2024-01-14",
          reportContent: "스팸성 댓글을 반복적으로 작성했습니다.",
          processingStatus: "처리 전",
        },
        {
          id: "report3",
          reportTag: "저작권 침해",
          reportingUser: "user5",
          reportedUser: "user6",
          reportDate: "2024-01-13",
          reportContent: "타인의 저작물을 무단으로 사용했습니다.",
          processingStatus: "처리 완료",
        },
        {
          id: "report4",
          reportTag: "폭력적 내용",
          reportingUser: "user7",
          reportedUser: "user8",
          reportDate: "2024-01-12",
          reportContent: "폭력적인 내용을 포함한 게시물을 작성했습니다.",
          processingStatus: "처리 전",
        },
        {
          id: "report5",
          reportTag: "개인정보 유출",
          reportingUser: "user9",
          reportedUser: "user10",
          reportDate: "2024-01-11",
          reportContent: "타인의 개인정보를 무단으로 공개했습니다.",
          processingStatus: "처리 전",
        },
      ]);
    }
  };

  const handleReportClick = (reportId: string) => {
    router.push(`/admin/reports/${reportId}`);
  };

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      // 검색창이 활성화될 때 포커스를 검색 입력창에 맞춤
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery === '' || 
      (searchType === 'reason' && report.reportTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (searchType === 'reporter' && report.reportingUser.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (searchType === 'reported' && report.reportedUser.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // 디버깅용 로그
  console.log('전체 신고 데이터:', reports);
  console.log('필터링된 신고 데이터:', filteredReports);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => setIsSearchSettingsOpen(false)}>
      {/* 헤더 */}
      <header className="bg-blue-400 text-white p-4 shadow-md">
        <div className="flex justify-between items-center w-full">
          <Link href="/admin" className="text-xl font-bold hover:text-blue-200 transition-colors">
            TaleCraft
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm">관리자: {userInfo?.userName}</span>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/auth/login');
              }}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-6">
        {/* 검색/필터 섹션 */}
        <div className="bg-orange-300 border-t-2 border-t-orange-400 border-b-2 border-b-orange-400 p-4 mb-4">
          <div className="bg-gray-200 p-4 rounded">
            <div className="flex justify-between items-center space-x-4">
              <button 
                onClick={() => setViewMode('reports')}
                className={`px-4 py-2 rounded ${viewMode === 'reports' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
              >
                신고 보기
              </button>
              <div className="relative">
                <button 
                  className="px-4 py-2 rounded bg-white text-black hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchSettingsOpen(!isSearchSettingsOpen);
                  }}
                >
                  검색설정
                </button>
                {isSearchSettingsOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-32">
                    <button
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${searchType === 'reason' ? 'bg-blue-100' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchType('reason');
                        setIsSearchSettingsOpen(false);
                      }}
                    >
                      신고사유
                    </button>
                    <button
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${searchType === 'reporter' ? 'bg-blue-100' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchType('reporter');
                        setIsSearchSettingsOpen(false);
                      }}
                    >
                      신고자
                    </button>
                    <button
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${searchType === 'reported' ? 'bg-blue-100' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchType('reported');
                        setIsSearchSettingsOpen(false);
                      }}
                    >
                      신고된 유저
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  {isSearchActive && (
                    <input
                      id="search-input"
                      type="text"
                                             placeholder={
                         searchType === 'reason' ? '신고사유로 검색...' :
                         searchType === 'reporter' ? '신고자로 검색...' :
                         '신고된 유저로 검색...'
                       }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="absolute right-12 px-4 py-2 rounded border transition-all duration-300 ease-in-out w-48"
                      onBlur={() => {
                        // 검색어가 비어있을 때만 검색창을 닫음
                        if (!searchQuery.trim()) {
                          setIsSearchActive(false);
                        }
                      }}
                    />
                  )}
                  <button 
                    onClick={handleSearchToggle}
                    className="px-4 py-2 rounded bg-white text-black hover:bg-gray-100 transition-colors"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 신고 목록 */}
        <div className="bg-orange-300 border-t-2 border-t-orange-400 border-b-2 border-b-orange-400 p-4 max-h-96 overflow-y-auto">
          {filteredReports.map((report, index) => (
            <div 
              key={report.id} 
              className={`bg-yellow-200 p-4 cursor-pointer hover:bg-yellow-300 transition-colors ${index < filteredReports.length - 1 ? 'border-b border-orange-400' : ''}`}
              onClick={() => handleReportClick(report.id)}
            >
                             <div className="grid grid-cols-4 gap-4 text-black">
                 <div className="col-span-1">
                   <span className="font-medium">신고사유:</span>
                   <div>{report.reportTag}</div>
                 </div>
                 <div className="col-span-1">
                   <span className="font-medium">신고한 유저:</span>
                   <div>{report.reportingUser}</div>
                 </div>
                 <div className="col-span-1">
                   <span className="font-medium">신고된 유저:</span>
                   <div>{report.reportedUser}</div>
                 </div>
                 <div className="col-span-1">
                   <span className="font-medium">신고일:</span>
                   <div>{report.reportDate}</div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 