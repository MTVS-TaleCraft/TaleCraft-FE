import React from 'react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "헤더 (flex)" }) => {
  return (
    <header className="bg-blue-200 p-4 flex items-center justify-between">
      <div className="text-lg font-semibold">제목</div>
      <div className="text-lg font-semibold">{title}</div>
      <div className="flex items-center gap-2">
        <span className="text-sm">검색아이콘</span>
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div className="w-4 h-0.5 bg-black mb-0.5"></div>
          <div className="w-4 h-0.5 bg-black mb-0.5"></div>
          <div className="w-4 h-0.5 bg-black"></div>
        </div>
      </div>
    </header>
  );
};

export default Header; 