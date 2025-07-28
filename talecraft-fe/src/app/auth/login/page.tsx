'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 성공 시 토큰 저장
        localStorage.setItem('token', data.token);
        router.push('/'); // 메인 페이지로 이동
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
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

        {/* 사이트 로그인 버튼 */}
        <div className="mb-6">
          <button className="w-full bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500 transition-colors">
            사이트 로그인
          </button>
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
            <button className="w-full bg-black text-white py-2 px-4 rounded border-2 border-purple-500 hover:bg-gray-800 transition-colors">
              아이디 찾기
            </button>
          </Link>
          
          <Link href="/auth/find-password" className="flex-1">
            <button className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors">
              비밀번호 찾기
            </button>
          </Link>
          
          <Link href="/auth/signup" className="flex-1">
            <button className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors">
              회원가입
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 