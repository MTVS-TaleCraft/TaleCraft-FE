'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowLeft } from 'lucide-react';

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

interface User {
  id: string;
  email: string;
  userName: string;
  authorityId: number;
}

export default function UserManagementPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'reports' | 'users'>('users');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchSettingsOpen, setIsSearchSettingsOpen] = useState(false);
  const [searchType, setSearchType] = useState<'id' | 'name'>('name');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/auth/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        
        // 관리자 권한 확인 (authorityId가 3이 아니면 접근 거부)
        if (data.authorityId !== "3") {
          alert('관리자 권한이 필요합니다.');
          router.push('/');
          return;
        }
        
        // 사용자 목록 가져오기
        fetchUsers();
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('인증 확인 실패:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/profile/users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('사용자 목록 가져오기 실패:', response.status);
        // 임시 더미 데이터
        setUsers([
          {
            id: "user1",
            email: "user1@example.com",
            userName: "사용자1",
            authorityId: 1,
          },
          {
            id: "user2",
            email: "user2@example.com",
            userName: "사용자2",
            authorityId: 1,
          },
          {
            id: "user3",
            email: "user3@example.com",
            userName: "사용자3",
            authorityId: 2,
          },
          {
            id: "user4",
            email: "user4@example.com",
            userName: "사용자4",
            authorityId: 1,
          },
          {
            id: "user5",
            email: "user5@example.com",
            userName: "사용자5",
            authorityId: 1,
          },
        ]);
      }
    } catch (error) {
      console.error('사용자 목록 가져오기 실패:', error);
      // 임시 더미 데이터
      setUsers([
        {
          id: "user1",
          email: "user1@example.com",
          userName: "사용자1",
          authorityId: 1,
        },
        {
          id: "user2",
          email: "user2@example.com",
          userName: "사용자2",
          authorityId: 1,
        },
        {
          id: "user3",
          email: "user3@example.com",
          userName: "사용자3",
          authorityId: 2,
        },
        {
          id: "user4",
          email: "user4@example.com",
          userName: "사용자4",
          authorityId: 1,
        },
        {
          id: "user5",
          email: "user5@example.com",
          userName: "사용자5",
          authorityId: 1,
        },
      ]);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      // 검색창이 활성화될 때 포커스를 검색 입력창에 맞춤
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      (searchType === 'id' && user.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (searchType === 'name' && user.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch && user.authorityId !== 3; // 관리자 계정 제외
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => setIsSearchSettingsOpen(false)}>
             {/* 헤더 */}
       <header className="bg-blue-400 text-white p-4 shadow-md">
         <div className="flex justify-between items-center w-full">
                       <Link href="/admin" className="flex items-center space-x-2 text-xl font-bold hover:text-blue-200 transition-colors">
              <ArrowLeft size={24} />
              <span>관리자 페이지로 이동</span>
            </Link>
           <div className="flex items-center space-x-2">
             <button 
               onClick={handleSearchToggle}
               className="text-white hover:text-gray-200 transition-colors"
             >
               <Search size={20} />
             </button>
           </div>
         </div>
       </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-6">
        {/* 검색/필터 섹션 */}
        <div className="bg-orange-300 border-t-2 border-t-orange-400 border-b-2 border-b-orange-400 p-4 mb-4">
          <div className="bg-gray-200 p-4 rounded">
                         <div className="flex justify-between items-center space-x-4">
               <button 
                 onClick={() => setViewMode('reports')}
                 className={`px-4 py-2 rounded ${viewMode === 'reports' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
               >
                유저 보기
               </button>
                               <div className="relative">
                  <button 
                    className="px-4 py-2 rounded bg-white text-black hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSearchSettingsOpen(!isSearchSettingsOpen);
                    }}
                  >
                    검색설정
                  </button>
                  {isSearchSettingsOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-32">
                      <button
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${searchType === 'id' ? 'bg-blue-100' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchType('id');
                          setIsSearchSettingsOpen(false);
                        }}
                      >
                        아이디
                      </button>
                      <button
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${searchType === 'name' ? 'bg-blue-100' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchType('name');
                          setIsSearchSettingsOpen(false);
                        }}
                      >
                        사용자명
                      </button>
                    </div>
                  )}
                </div>
               <div className="flex items-center space-x-2">
                 <div className="relative">
                   {isSearchActive && (
                     <input
                       id="search-input"
                       type="text"
                                               placeholder={searchType === 'id' ? '아이디로 검색...' : '사용자명으로 검색...'}
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="absolute right-12 px-4 py-2 rounded border transition-all duration-300 ease-in-out w-48"
                       onBlur={() => {
                         // 검색어가 비어있을 때만 검색창을 닫음
                         if (!searchQuery.trim()) {
                           setIsSearchActive(false);
                         }
                       }}
                     />
                   )}
                   <button 
                     onClick={handleSearchToggle}
                     className="px-4 py-2 rounded bg-white text-black hover:bg-gray-100 transition-colors"
                   >
                     <Search size={16} />
                   </button>
                 </div>
               </div>
             </div>
          </div>
        </div>

                 {/* 사용자 목록 */}
         <div className="bg-orange-300 border-t-2 border-t-orange-400 border-b-2 border-b-orange-400 p-4 max-h-96 overflow-y-auto">
          {filteredUsers.map((user, index) => (
            <div 
              key={user.id} 
              className={`bg-yellow-200 p-4 cursor-pointer hover:bg-yellow-300 transition-colors ${index < filteredUsers.length - 1 ? 'border-b border-orange-400' : ''}`}
              onClick={() => handleUserClick(user.id)}
            >
                             <div className="flex justify-between items-center">
                 <span className="text-black font-medium">{user.id}</span>
                 <span className="text-black">{user.userName}</span>
               </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 