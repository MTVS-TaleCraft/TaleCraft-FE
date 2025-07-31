'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../config/api';

export default function AuthTestPage() {
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [signupData, setSignupData] = useState({
    userId: '',
    password: '',
    nickname: '',
  });

  const [loginData, setLoginData] = useState({
    userId: '',
    password: '',
  });

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('회원가입이 성공적으로 완료되었습니다!');
        setSignupData({ userId: '', password: '', nickname: '' });
      } else {
        setMessage(data.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      setMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('로그인이 성공적으로 완료되었습니다!');
        setLoginData({ userId: '', password: '' });
        // 로그인 성공 후 작품 생성 페이지로 이동
        setTimeout(() => {
          window.location.href = '/test';
        }, 2000);
      } else {
        setMessage(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">TaleCraft 인증 테스트</h1>
        
        {/* 탭 버튼 */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 px-4 rounded-l-lg font-semibold transition-colors ${
              activeTab === 'signup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            회원가입
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-4 rounded-r-lg font-semibold transition-colors ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            로그인
          </button>
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            message.includes('성공') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* 회원가입 폼 */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이디 *
              </label>
              <input
                type="text"
                value={signupData.userId}
                onChange={(e) => setSignupData(prev => ({ ...prev, userId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 *
              </label>
              <input
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임 *
              </label>
              <input
                type="text"
                value={signupData.nickname}
                onChange={(e) => setSignupData(prev => ({ ...prev, nickname: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="닉네임을 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </button>
          </form>
        )}

        {/* 로그인 폼 */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이디 *
              </label>
              <input
                type="text"
                value={loginData.userId}
                onChange={(e) => setLoginData(prev => ({ ...prev, userId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 *
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : '로그인'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 