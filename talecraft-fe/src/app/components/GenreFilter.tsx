import React from 'react';

interface GenreFilterProps {
  selectedGenre?: string;
  onGenreSelect: (genre: string) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ selectedGenre, onGenreSelect }) => {
  const genres = ['로맨스', '판타지', '액션', '스릴러', '일상'];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onGenreSelect(genre)}
          className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap ${
            selectedGenre === genre
              ? 'bg-black text-white'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter; 