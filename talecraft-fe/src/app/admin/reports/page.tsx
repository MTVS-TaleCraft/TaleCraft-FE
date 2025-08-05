'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const fetchReports = useCallback(async () => {
    try {
              const response = await fetch('/api/reports/unviewed', {
        credentials: 'include',
        headers: {
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
        console.error('신고 목록을 가져오는데 실패했습니다.');
        setReports([]);
      }
    } catch (error) {
      console.error('신고 목록을 가져오는데 실패했습니다:', error);
      setReports([]);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include',
        headers: {
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
  }, [router, fetchReports]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleReportClick = (reportId: string) => {
    router.push(`/admin/reports/${reportId}`);
  };

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
  };

  const handleSearchSettingsToggle = () => {
    setIsSearchSettingsOpen(!isSearchSettingsOpen);
  };

  const filteredReports = reports.filter(report => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    switch (searchType) {
      case 'reason':
        return report.reportTag.toLowerCase().includes(query);
      case 'reporter':
        return report.reportingUser.toLowerCase().includes(query);
      case 'reported':
        return report.reportedUser.toLowerCase().includes(query);
      default:
        return report.reportTag.toLowerCase().includes(query) ||
               report.reportingUser.toLowerCase().includes(query) ||
               report.reportedUser.toLowerCase().includes(query);
    }
  });

  const handleLogout = () => {
    router.push('/auth/login');
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-blue-400 text-white p-4 shadow-md">
        <div className="flex justify-between items-center w-full">
          <Link href="/admin" className="flex items-center space-x-2 text-xl font-bold hover:text-blue-200 transition-colors">
            <ArrowLeft size={24} />
            <span>관리자 페이지로 이동</span>
          </Link>
          <div className="flex items-center space-x-2">
            {isSearchActive ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1 rounded text-black text-sm w-48 focus:outline-none focus:ring-2 focus:ring-white"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-blue-500"
                  onClick={() => {
                    setIsSearchActive(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">검색 닫기</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-blue-500"
                onClick={handleSearchToggle}
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">검색</span>
              </Button>
            )}
            {userInfo && (
              <span className="text-sm font-medium">
                관리자: {userInfo.userName}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-blue-500"
              onClick={handleSearchSettingsToggle}
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">메뉴</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-6 pt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">신고 관리</h1>
          <Link 
            href="/admin"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            뒤로 가기
          </Link>
        </div>
        
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">총 신고 건수</h3>
            <p className="text-3xl font-bold text-red-600">{reports.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">처리 대기</h3>
            <p className="text-3xl font-bold text-orange-600">
              {reports.filter(report => report.processingStatus === "처리 전").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">처리 완료</h3>
            <p className="text-3xl font-bold text-green-600">
              {reports.filter(report => report.processingStatus === "처리 완료").length}
            </p>
          </div>
        </div>

        {/* 검색 설정 */}
        {isSearchSettingsOpen && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">검색 설정</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="reason"
                  checked={searchType === 'reason'}
                  onChange={(e) => setSearchType(e.target.value as 'reason' | 'reporter' | 'reported')}
                  className="mr-2"
                />
                신고 사유
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="reporter"
                  checked={searchType === 'reporter'}
                  onChange={(e) => setSearchType(e.target.value as 'reason' | 'reporter' | 'reported')}
                  className="mr-2"
                />
                신고자
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="reported"
                  checked={searchType === 'reported'}
                  onChange={(e) => setSearchType(e.target.value as 'reason' | 'reporter' | 'reported')}
                  className="mr-2"
                />
                신고 대상
              </label>
            </div>
          </div>
        )}

        {/* 신고 목록 */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div 
              key={report.id} 
              className="bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-300 transition-all cursor-pointer"
              onClick={() => handleReportClick(report.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      report.processingStatus === "처리 완료" 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {report.processingStatus}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {report.reportTag}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    신고자: {report.reportingUser} → 대상: {report.reportedUser}
                  </h3>
                  <p className="text-gray-600 mb-2">{report.reportContent}</p>
                  <p className="text-sm text-gray-500">신고일: {report.reportDate}</p>
                </div>
                <div className="text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    상세 보기 →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">신고 내역이 없습니다.</p>
          </div>
        )}
      </main>

      {/* 사이드바 */}
      <div className={`fixed right-0 top-0 h-full w-80 z-50 transition-transform duration-300 ease-in-out ${isSearchSettingsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-b from-purple-400 to-pink-400 p-6 shadow-lg">
          {/* 사용자 섹션 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
            </div>
            {userInfo ? (
              <div className="text-center">
                <p className="text-black font-semibold text-lg">{userInfo.userName}</p>
                <p className="text-black text-sm">{userInfo.email}</p>
              </div>
            ) : (
              <p className="text-black font-semibold text-lg">관리자</p>
            )}
          </div>

          {/* 메뉴 버튼들 */}
          <div className="space-y-4">
            <Link 
              href="/admin"
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors block text-center"
              onClick={() => setIsSearchSettingsOpen(false)}
            >
              관리자 홈
            </Link>
            <Link 
              href="/admin/users"
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors block text-center"
              onClick={() => setIsSearchSettingsOpen(false)}
            >
              사용자 관리
            </Link>
            <Link 
              href="/admin/novels"
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors block text-center"
              onClick={() => setIsSearchSettingsOpen(false)}
            >
              작품 관리
            </Link>
            <button 
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
              onClick={() => {
                handleLogout();
                setIsSearchSettingsOpen(false);
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 오버레이 */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isSearchSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSearchSettingsOpen(false)}
      />
    </div>
  );
} 