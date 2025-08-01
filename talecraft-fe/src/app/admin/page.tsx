'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken, removeAuthToken } from '@/utils/cookies';

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

export default function AdminPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/profile', {
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
          <Link href="/" className="text-xl font-bold hover:text-blue-200 transition-colors">
            TaleCraft
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm">관리자: {userInfo?.userName}</span>
            <button 
              onClick={() => {
                removeAuthToken();
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
      <main className="max-w-6xl mx-auto p-6 pt-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">관리자 페이지</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 사용자 관리 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">사용자 관리</h2>
            <p className="text-gray-600 mb-4">전체 사용자 목록 및 권한 관리</p>
            <button 
              onClick={() => router.push('/admin/users')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              사용자 목록 보기
            </button>
          </div>

          {/* 작품 관리 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">작품 관리</h2>
            <p className="text-gray-600 mb-4">전체 작품 목록 및 신고 처리</p>
            <button 
              onClick={() => router.push('/admin/novels')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              작품 목록 보기
            </button>
          </div>

          {/* 유저 신고보기 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">유저 신고보기</h2>
            <p className="text-gray-600 mb-4">사용자 신고 내역 확인 및 처리</p>
            <button 
              onClick={() => router.push('/admin/reports')}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              신고 내역 보기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 