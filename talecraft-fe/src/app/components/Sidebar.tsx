import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">메뉴</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 메뉴 항목들 */}
        <div className="space-y-4">
          <Link 
            href="/auth-test" 
            className="block w-full text-left px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            로그인 페이지
          </Link>
          
          <Link 
            href="/novel-create" 
            className="block w-full text-left px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={onClose}
          >
            작품생성 페이지
          </Link>
          
          <Link 
            href="/my-novels" 
            className="block w-full text-left px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            onClick={onClose}
          >
            내 작품 목록
          </Link>
          
          <Link 
            href="/novel-list" 
            className="block w-full text-left px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            onClick={onClose}
          >
            작품 목록
          </Link>
          
          <Link 
            href="/" 
            className="block w-full text-left px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 