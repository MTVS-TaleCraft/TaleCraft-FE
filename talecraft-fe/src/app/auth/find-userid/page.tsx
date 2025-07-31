'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FindUserIdPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [foundUserId, setFoundUserId] = useState('');
  const router = useRouter();

  const handleFindUserId = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setFoundUserId('');

    if (!email) {
      setError('이메일을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/auth/find-userid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Find userid response:', data); // 디버깅용
        console.log('Response keys:', Object.keys(data)); // 응답 키들 확인
        console.log('userId field:', data.userId); // userId 필드 값 확인
        console.log('success field:', data.success); // success 필드 값 확인
        console.log('message field:', data.message); // message 필드 값 확인
        
        // 백엔드 응답 구조: { success: boolean, message: string, userId: string }
        if (data.success && data.userId) {
          setFoundUserId(data.userId);
          setSuccess(`아이디를 찾았습니다.`);
        } else {
          setError('아이디를 찾을 수 없습니다.');
        }
      } else {
        setError(data.error || '아이디 찾기에 실패했습니다.');
      }
    } catch {
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
          <h1 className="text-2xl font-bold text-gray-800">아이디 찾기</h1>
        </div>

        {/* 사이트 로고 버튼 */}
        <div className="mb-6">
          <Link href="/auth/login">
            <button className="w-full bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500 transition-colors">
              사이트 로고
            </button>
          </Link>
        </div>

        {/* 아이디 찾기 폼 */}
        <form onSubmit={handleFindUserId} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        {/* 찾은 아이디 표시 */}
        {foundUserId && (
          <div className="mt-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
            <div className="text-center">
              <p className="text-lg text-green-800 font-semibold mb-3">찾은 아이디</p>
              <div className="bg-white p-4 rounded border border-green-200">
                <p className="text-2xl font-bold text-green-900 break-all">{foundUserId}</p>
              </div>
              <p className="text-sm text-green-600 mt-2">위 아이디로 로그인해주세요.</p>
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>안내사항:</strong>
          </p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1">
            <li>• 가입 시 등록한 이메일 주소를 입력해주세요.</li>
            <li>• 아이디가 즉시 화면에 표시됩니다.</li>
            <li>• 아이디를 확인한 후 로그인해주세요.</li>
          </ul>
        </div>

        {/* 비밀번호 찾기 링크 */}
        <div className="mt-4 text-center">
          <Link href="/auth/find-password" className="text-blue-600 hover:text-blue-800 text-sm">
            비밀번호 찾기
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