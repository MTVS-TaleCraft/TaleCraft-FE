"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Menu, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Novel {
  novelId: number
  title: string
  titleImage: string
  summary: string
  userId: string
  availability: string
}

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [novels, setNovels] = useState<Novel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<{userId: string, userName: string, email: string, authorityId: string} | null>(null)

  useEffect(() => {
    checkLoginStatus()
    fetchNovels()
  }, [])

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token")
    const isLoggedInStatus = !!token
    setIsLoggedIn(isLoggedInStatus)
    setIsLoading(false)
    
    // 로그인 상태가 변경되면 사용자 정보 가져오기
    if (isLoggedInStatus) {
      fetchUserInfo()
    }
  }

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.log("토큰이 없습니다.")
        return
      }

      console.log("사용자 정보를 가져오는 중... 토큰:", token.substring(0, 20) + "...")
      
      const response = await fetch("http://localhost:8081/api/auth/profile", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log("응답 상태:", response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log("받은 사용자 정보:", data)
        console.log("authorityId:", data.authorityId, "타입:", typeof data.authorityId)
        setUserInfo(data)
      } else {
        const errorText = await response.text()
        console.error("서버 오류:", response.status, errorText)
      }
    } catch (error) {
      console.error("사용자 정보를 가져오는데 실패했습니다:", error)
    }
  }

  const fetchNovels = async () => {
    try {
      console.log("소설 데이터를 가져오는 중...")
      const response = await fetch("http://localhost:8081/api/novels")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("받은 데이터:", data)

      // 전체 소설 중에서 랜덤으로 5개 선택
      const shuffled = [...data.novelList].sort(() => 0.5 - Math.random())
      const randomNovels = shuffled.slice(0, 5)
      setNovels(randomNovels)
    } catch (error) {
      console.error("소설 데이터를 가져오는데 실패했습니다:", error)
      // 테스트용 더미 데이터
      setNovels([
        {
          novelId: 1,
          title: "달빛 아래의 비밀",
          titleImage: "/placeholder.svg?height=200&width=150",
          summary: "달빛이 비추는 밤, 숨겨진 비밀이 드러난다",
          userId: "user1",
          availability: "PUBLIC",
        },
        {
          novelId: 2,
          title: "시간을 달리는 소녀",
          titleImage: "/placeholder.svg?height=200&width=150",
          summary: "시간을 넘나드는 모험이 시작된다",
          userId: "user2",
          availability: "PUBLIC",
        },
        {
          novelId: 3,
          title: "마법사의 제자",
          titleImage: "/placeholder.svg?height=200&width=150",
          summary: "마법의 세계로 떠나는 환상적인 여행",
          userId: "user3",
          availability: "PUBLIC",
        },
        {
          novelId: 4,
          title: "별이 빛나는 밤에",
          titleImage: "/placeholder.svg?height=200&width=150",
          summary: "별빛 아래에서 피어나는 사랑 이야기",
          userId: "user4",
          availability: "PUBLIC",
        },
        {
          novelId: 5,
          title: "용사의 귀환",
          titleImage: "/placeholder.svg?height=200&width=150",
          summary: "전설의 용사가 돌아온다",
          userId: "user5",
          availability: "PUBLIC",
        },
      ])
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    router.push("/auth/login")
  }

  const getDisplayedNovels = () => {
    if (novels.length === 0) return []

    const displayed = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % novels.length
      displayed.push(novels[index])
    }
    return displayed
  }

  const handleNavigation = (direction: "left" | "right") => {
    if (direction === "left") {
      setCurrentIndex((prev) => (prev + 1) % novels.length)
    } else {
      setCurrentIndex((prev) => (prev - 1 + novels.length) % novels.length)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <div className="transition-all duration-300 relative">
        {/* 헤더 */}
        <header className="bg-blue-400 text-white p-4 shadow-md">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-xl font-bold">TaleCraft</h1>
            <div className="flex items-center space-x-2">
              {isSearchOpen ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="검색어를 입력하세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1 rounded text-black text-sm w-48 focus:outline-none focus:ring-2 focus:ring-white"
                    autoFocus
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-blue-500"
                    onClick={() => {
                      setIsSearchOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    <X className="w-5 h-5" />
                    <span className="sr-only">검색 닫기</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-blue-500"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="w-5 h-5" />
                  <span className="sr-only">검색</span>
                </Button>
              )}
              {isLoggedIn && userInfo && (
                <span className="text-sm font-medium">
                  안녕하세요, {userInfo.userName}님!
                </span>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-blue-500"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">메뉴</span>
              </Button>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="max-w-6xl mx-auto p-6 pt-16 pb-24">
          <h2 className="text-2xl font-bold text-gray-800 mb-16 text-center">당신을 위한 팡팡 터지는 소설들</h2>

          {/* 작품 배너 캐러셀 */}
          <div className="relative mb-8">
            <div className="flex justify-center items-center space-x-12">
              {getDisplayedNovels().map((novel, index) => (
                <div
                  key={`banner-${novel.novelId}-${index}`}
                  className={`banner-item transition-all duration-500 ease-in-out ${
                    index === 1 ? "scale-150 shadow-xl" : "shadow-md"
                  }`}
                >
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-10 rounded-lg w-72 h-48 flex flex-col justify-center items-center text-center">
                    <h3 className="font-bold text-2xl mb-2">작품 배너</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 인디케이터 (5개 점) */}
          <div className="flex justify-center space-x-2 mb-8 mt-20 relative z-10">
            {Array.from({ length: 5 }, (_, index) => (
              <button
                key={`indicator-${index}`}
                className={`w-4 h-4 rounded-full transition-colors cursor-pointer ${
                  index === currentIndex ? "bg-purple-500" : "bg-gray-300"
                }`}
                onClick={() => {
                  setCurrentIndex(index)
                }}
              />
            ))}
          </div>

          {/* 드래그 힌트 */}
          <div className="text-center text-gray-600">
            <p className="text-sm">좌우 버튼을 클릭하거나 배너를 클릭하여 작품을 확인하세요</p>
          </div>
        </main>

        {/* 하단 네비게이션 */}
        <nav className="fixed bottom-48 left-0 right-0 bg-gray-50 p-4 pb-6 z-40">
          <div className="flex justify-around items-center max-w-4xl mx-auto">
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">베스트</button>
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">최신</button>
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">완결</button>
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">보관함</button>
          </div>
        </nav>
      </div>

      {/* 사이드바 */}
      <div className={`fixed right-0 top-0 h-full w-80 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-b from-purple-400 to-pink-400 p-6 shadow-lg">
          {/* 사용자 섹션 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
            </div>
            {isLoggedIn && userInfo ? (
              <div className="text-center">
                <p className="text-black font-semibold text-lg">{userInfo.userName}</p>
                <p className="text-black text-sm">{userInfo.email}</p>
              </div>
            ) : (
              <button 
                className="text-black font-semibold text-lg"
                onClick={() => {
                  setIsSidebarOpen(false)
                  router.push('/auth/login')
                }}
              >
                로그인
              </button>
            )}
          </div>

          {/* 메뉴 버튼들 */}
          <div className="space-y-4">
            {isLoggedIn ? (
              <>
                <button className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                  작품등록
                </button>
                <button className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                  내 작품 목록
                </button>
                <button 
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsSidebarOpen(false)
                    router.push('/mypage')
                  }}
                >
                  마이페이지
                </button>
                {userInfo?.authorityId === "3" && (
                  <button 
                    className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      setIsSidebarOpen(false)
                      router.push('/admin')
                    }}
                  >
                    관리자 페이지
                  </button>
                )}
                {/* 디버깅용 로그 */}
                {console.log("사이드바 - userInfo:", userInfo, "authorityId:", userInfo?.authorityId, "isAdmin:", userInfo?.authorityId === "3")}
                <button 
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  onClick={() => {
                    localStorage.removeItem('token')
                    setIsLoggedIn(false)
                    setUserInfo(null)
                    setIsSidebarOpen(false)
                    router.push('/')
                  }}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button 
                className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => {
                  setIsSidebarOpen(false)
                  router.push('/auth/login')
                }}
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 오버레이 */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  )
}
