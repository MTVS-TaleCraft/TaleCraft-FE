'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('로그인 요청:', { userId, password });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      console.log('로그인 응답 상태:', response.status);
      const data = await response.json();
      console.log('로그인 응답 데이터:', data);

      if (response.ok) {
        // 백엔드에서 이미 쿠키를 설정했으므로 프론트엔드에서 중복 설정하지 않음
        // 쿠키가 브라우저에 설정되는 데 시간이 걸리므로 잠시 기다린 후 이동
        console.log('로그인 성공, 인증 상태 확인 중...');
        
        setTimeout(async () => {
          // Next.js API 라우트를 통해 인증 상태 확인
          try {
            const authResponse = await fetch('/api/auth/profile', {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (authResponse.ok) {
              console.log('인증 확인 성공, 페이지 이동');
              router.push(redirectTo);
            } else {
              console.log('인증 확인 실패, 다시 시도');
              setTimeout(() => {
                router.push(redirectTo);
              }, 500);
            }
          } catch (error) {
            console.log('인증 확인 중 에러, 페이지 이동');
            router.push(redirectTo);
          }
        }, 100);
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">로그인</h1>
        </div>

        {/* 사이트 로그인 배너 */}
        <div className="mb-6">
          <Link href="/">
            <div className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white py-4 px-6 rounded-lg text-center cursor-pointer hover:from-blue-500 hover:to-purple-600 transition-colors">
              <h2 className="text-2xl font-bold">TaleCraft</h2>
            </div>
          </Link>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="아이디"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 하단 버튼들 */}
        <div className="mt-6 flex space-x-2">
          <Link href="/auth/find-userid" className="flex-1">
            <button className="w-full h-10 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors text-sm">
              아이디 찾기
            </button>
          </Link>
          
          <Link href="/auth/find-password" className="flex-1">
            <button className="w-full h-10 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors text-sm">
              비밀번호 찾기
            </button>
          </Link>
          
          <Link href="/auth/signup" className="flex-1">
            <button className="w-full h-10 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors text-sm">
              회원가입
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 