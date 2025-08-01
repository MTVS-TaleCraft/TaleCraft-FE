import React from 'react';

interface NovelTitleProps {
  title: string;
}

const NovelTitle: React.FC<NovelTitleProps> = ({ title }) => {
  return (
    <li style={{
      padding: '12px 0',
      borderBottom: '1px solid #eee',
      fontSize: 18,
      fontWeight: 500,
      color: '#222',
      listStyle: 'none',
    }}>
      {title}
    </li>
  );
};

export default NovelTitle;