'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    console.log('에러 페이지에 접근됨 - 접근 권한 없음');
    console.log('현재 URL:', window.location.href);
    console.log('이전 페이지:', document.referrer);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShouldRedirect(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      console.log('메인 페이지로 리다이렉트');
      router.push('/');
    }
  }, [shouldRedirect, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-500 mb-4">ERROR</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-8">
            로그인이 필요한 페이지입니다.<br />
            {countdown}초 후 메인 페이지로 이동합니다.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors mr-4"
          >
            로그인하기
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            메인으로 바로가기
          </button>
        </div>
      </div>
    </div>
  );
} 