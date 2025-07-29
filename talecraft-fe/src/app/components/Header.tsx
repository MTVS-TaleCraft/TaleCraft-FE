'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "헤더 (flex)" }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className="bg-blue-200 p-4 flex items-center justify-between">
        <div className="text-lg font-semibold">제목</div>
        <div className="text-lg font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button 
            onClick={toggleSidebar}
            className="w-6 h-6 flex flex-col justify-center items-center hover:opacity-70 transition-opacity"
          >
            <div className="w-4 h-0.5 bg-black mb-0.5"></div>
            <div className="w-4 h-0.5 bg-black mb-0.5"></div>
            <div className="w-4 h-0.5 bg-black"></div>
          </button>
        </div>
      </header>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  );
};

export default Header; 