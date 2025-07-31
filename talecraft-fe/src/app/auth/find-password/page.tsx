'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FindPasswordPage() {
  const [formData, setFormData] = useState({
    email: '',
    userId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.email || !formData.userId) {
      setError('이메일과 아이디를 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/auth/find-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('임시 비밀번호가 이메일로 발송되었습니다. 이메일을 확인해주세요.');
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(data.error || '비밀번호 찾기에 실패했습니다.');
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
          <h1 className="text-2xl font-bold text-gray-800">비밀번호 찾기</h1>
        </div>

        {/* 사이트 로고 버튼 */}
        <div className="mb-6">
          <Link href="/auth/login">
            <button className="w-full bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500 transition-colors">
              사이트 로고
            </button>
          </Link>
        </div>

        {/* 비밀번호 찾기 폼 */}
        <form onSubmit={handleFindPassword} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              name="userId"
              placeholder="아이디"
              value={formData.userId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm">{success}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                확인 중...
              </>
            ) : (
              '확인'
            )}
          </button>
        </form>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>안내사항:</strong>
          </p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1">
            <li>• 가입 시 등록한 이메일과 아이디를 입력해주세요.</li>
            <li>• 임시 비밀번호가 이메일로 발송됩니다.</li>
            <li>• 임시 비밀번호로 로그인 후 반드시 비밀번호를 변경해주세요.</li>
          </ul>
        </div>

        {/* 아이디 찾기 링크 */}
        <div className="mt-4 text-center">
          <Link href="/auth/find-userid" className="text-blue-600 hover:text-blue-800 text-sm">
            아이디 찾기
          </Link>
        </div>

        {/* 로그인 페이지로 돌아가기 */}
        <div className="mt-4 text-center">
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 text-sm">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 