'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
}

export default function ReportDetailPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [report, setReport] = useState<UserReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const reportId = params.reportId as string;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
        
        // 신고 상세 정보 가져오기
        fetchReportDetail();
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

  const fetchReportDetail = async () => {
    try {
      // reportId에서 comment_ 접두사 제거하여 실제 ID 추출
      const actualReportId = reportId.replace('comment_', '');
      
      const response = await fetch(`http://localhost:8081/api/reports/comments/${actualReportId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('신고 상세 데이터:', data);
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        if (data && data.length > 0) {
          const reportData = data[0]; // 첫 번째 신고 데이터 사용
          setReport({
            id: reportId,
            reportTag: reportData.reportTag,
            reportingUser: reportData.reportUser,
            reportedUser: reportData.reportedUser,
            reportDate: reportData.reportDate ? new Date(reportData.reportDate).toLocaleDateString() : "날짜 없음",
            reportContent: reportData.description,
            processingStatus: reportData.isView ? "처리 완료" : "처리 전",
          });
        } else {
          // 더미 데이터 사용
          setReport({
            id: reportId,
            reportTag: "부적절한 언어",
            reportingUser: "user1",
            reportedUser: "user2",
            reportDate: "2024-01-15",
            reportContent: "부적절한 언어를 사용했습니다. 다른 사용자들에게 불쾌감을 주는 표현을 반복적으로 사용하고 있습니다.",
            processingStatus: "처리 전",
          });
        }
      } else {
        console.error('신고 상세 정보 가져오기 실패:', response.status);
        // 임시 더미 데이터
        setReport({
          id: reportId,
          reportTag: "부적절한 언어",
          reportingUser: "user1",
          reportedUser: "user2",
          reportDate: "2024-01-15",
          reportContent: "부적절한 언어를 사용했습니다. 다른 사용자들에게 불쾌감을 주는 표현을 반복적으로 사용하고 있습니다.",
          processingStatus: "처리 전",
        });
      }
    } catch (error) {
      console.error('신고 상세 정보 가져오기 실패:', error);
      // 임시 더미 데이터
      setReport({
        id: reportId,
        reportTag: "부적절한 언어",
        reportingUser: "user1",
        reportedUser: "user2",
        reportDate: "2024-01-15",
        reportContent: "부적절한 언어를 사용했습니다. 다른 사용자들에게 불쾌감을 주는 표현을 반복적으로 사용하고 있습니다.",
        processingStatus: "처리 전",
      });
    }
  };

  const handleProcessReport = async () => {
    try {
      const token = localStorage.getItem('token');
      // reportId에서 comment_ 접두사 제거하여 실제 ID 추출
      const actualReportId = reportId.replace('comment_', '');
      
      const response = await fetch(`http://localhost:8081/api/reports/${actualReportId}/view`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('신고가 처리되었습니다.');
        // 처리 상태 업데이트
        if (report) {
          setReport({
            ...report,
            processingStatus: "처리 완료"
          });
        }
        // 목록 페이지로 이동
        router.push('/admin/reports');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '신고 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('신고 처리 실패:', error);
      alert('신고 처리에 실패했습니다.');
    }
  };

  const handleViewUser = (userId: string) => {
    // 사용자 상세 정보 페이지로 이동
    router.push(`/admin/users/${userId}`);
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

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">신고 정보를 찾을 수 없습니다.</p>
          <button 
            onClick={() => router.push('/admin/reports')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-blue-400 text-white p-4 shadow-md">
        <div className="flex justify-between items-center w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-xl font-bold hover:text-blue-200 transition-colors"
          >
            <ArrowLeft size={24} />
            <span>뒤로가기</span>
          </button>
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
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-orange-300 border-t-2 border-t-orange-400 border-b-2 border-b-orange-400 p-4">
          <div className="space-y-4">
            {/* 신고 태그(사유) */}
            <div className="bg-yellow-200 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-black">신고 태그(사유)</span>
              </div>
              <div className="mt-2 text-black">{report.reportTag}</div>
            </div>

            {/* 신고한 유저 */}
            <div className="bg-yellow-200 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-black">신고한 유저</span>
                <button 
                  className="bg-black text-white px-2 py-1 rounded text-xs hover:bg-gray-800 transition-colors"
                  onClick={() => handleViewUser(report.reportingUser)}
                >
                  더보기
                </button>
              </div>
              <div className="mt-2 text-black">{report.reportingUser}</div>
            </div>

            {/* 신고된 유저 */}
            <div className="bg-yellow-200 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-black">신고된 유저</span>
                <button 
                  className="bg-black text-white px-2 py-1 rounded text-xs hover:bg-gray-800 transition-colors"
                  onClick={() => handleViewUser(report.reportedUser)}
                >
                  더보기
                </button>
              </div>
              <div className="mt-2 text-black">{report.reportedUser}</div>
            </div>

            {/* 신고일 */}
            <div className="bg-yellow-200 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-black">신고일</span>
              </div>
              <div className="mt-2 text-black">{report.reportDate}</div>
            </div>

            {/* 신고 내용 */}
            <div className="bg-yellow-200 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-black">신고 내용</span>
              </div>
              <div className="mt-2 text-black whitespace-pre-wrap">{report.reportContent}</div>
            </div>

            {/* 처리 상태 */}
            <div className="bg-yellow-200 p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-black">처리 상태</span>
                <div className="flex items-center space-x-2">
                  <span className="text-black">{report.processingStatus}</span>
                  {report.processingStatus === "처리 전" && (
                    <button 
                      className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
                      onClick={handleProcessReport}
                    >
                      처리하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="mt-6 flex justify-between">
          <button 
            onClick={() => router.push('/admin/reports')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            목록으로 돌아가기
          </button>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            관리자 페이지로
          </button>
        </div>
      </main>
    </div>
  );
} 