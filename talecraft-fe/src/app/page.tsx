'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-blue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">TaleCraft</h1>
          <div className="flex space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/mypage">
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                    마이페이지
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/auth/login">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  로그인
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            TaleCraft에 오신 것을 환영합니다!
          </h2>
          
          {isLoggedIn ? (
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-6">
                로그인되었습니다. 마이페이지에서 정보를 확인하고 수정할 수 있습니다.
              </p>
              <div className="space-y-4">
                <Link href="/mypage">
                  <button className="w-full max-w-md px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    마이페이지로 이동
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-6">
                서비스를 이용하려면 로그인이 필요합니다.
              </p>
              <div className="space-y-4">
                <Link href="/auth/login">
                  <button className="w-full max-w-md px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    로그인하기
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="w-full max-w-md px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    회원가입하기
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 서비스 소개 */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">소설 작성</h3>
            <p className="text-gray-600">
              창의적인 이야기를 작성하고 다른 사용자들과 공유하세요.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">커뮤니티</h3>
            <p className="text-gray-600">
              다른 작가들과 소통하고 피드백을 받아보세요.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">독서</h3>
            <p className="text-gray-600">
              다양한 장르의 소설을 읽고 새로운 세계를 탐험하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
