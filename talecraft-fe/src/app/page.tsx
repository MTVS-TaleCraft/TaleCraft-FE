"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { removeAuthToken } from "@/utils/cookies"

interface Novel {
  novelId: number
  title: string
  titleImage: string | null
  summary: string
  userId: string
  availability: string
}

interface CarouselItem extends Novel {
  carouselPosition: number
  id: string
}

interface UserInfo {
  userId: string
  userName: string
  email: string
  authorityId: string
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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState("best")
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragCurrentX, setDragCurrentX] = useState(0)
  const [autoSlideInterval, setAutoSlideInterval] = useState<NodeJS.Timeout | null>(null)

  const navigationItems = [
    { label: "베스트", value: "best" },
    { label: "최신", value: "latest" },
    { label: "완결", value: "completed" },
    { label: "보관함", value: "library" },
  ]

  useEffect(() => {
    checkLoginStatus()
    fetchNovels()
  }, [])

  // 자동 슬라이드 기능 (사용자 인터랙션 방해 방지를 위해 비활성화)
  useEffect(() => {
    if (novels.length === 0) return

    // 기존 인터벌 정리
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval)
    }

    // 자동 슬라이드 비활성화 (사용자 인터랙션 방해 방지)
    // const interval = setInterval(() => {
    //   if (!isAnimating && !isDragging) {
    //     handleNavigation("left")
    //   }
    // }, 10000)

    // setAutoSlideInterval(interval)

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval)
      }
    }
  }, [novels.length, isAnimating, isDragging])

  const handleNavigation = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating || novels.length === 0) return

      setIsAnimating(true)

      // 자동 슬라이드 일시정지
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval)
        setAutoSlideInterval(null)
      }

      // Update positions immediately for smooth animation
      setCarouselItems((prev) =>
        prev.map((item) => ({
          ...item,
          carouselPosition: direction === "left" ? item.carouselPosition - 1 : item.carouselPosition + 1,
        })),
      )

      // Update the actual index after animation starts
      setTimeout(() => {
        if (direction === "left") {
          setCurrentIndex((prev) => (prev + 1) % novels.length)
        } else {
          setCurrentIndex((prev) => (prev - 1 + novels.length) % novels.length)
        }
        setTimeout(() => setIsAnimating(false), 200)
      }, 100)
    },
    [isAnimating, novels.length, autoSlideInterval],
  )

  // Initialize carousel items with stable IDs
  useEffect(() => {
    if (novels.length === 0) return

    const items = []
    for (let i = -2; i <= 2; i++) {
      const novelIndex = (currentIndex + i + novels.length) % novels.length
      items.push({
        ...novels[novelIndex],
        carouselPosition: i,
        id: `carousel-${novelIndex}-${i}`,
      })
    }
    setCarouselItems(items)
  }, [novels, currentIndex])

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const fetchNovels = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/novels`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const shuffled = [...data.novelList].sort(() => 0.5 - Math.random())
      const randomNovels = shuffled.slice(0, 5)
      setNovels(randomNovels)
    } catch (error) {
      console.error("Failed to fetch novels:", error)
      setNovels([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleIndicatorClick = (index: number) => {
    if (isAnimating || index === currentIndex || novels.length === 0) return

    setIsAnimating(true)

    // 자동 슬라이드 일시정지
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval)
      setAutoSlideInterval(null)
    }

    // 모든 경우에 동일한 애니메이션 적용
    setCarouselItems((prev) =>
      prev.map((item) => ({
        ...item,
        carouselPosition: index > currentIndex ? item.carouselPosition + 1 : item.carouselPosition - 1,
      })),
    )

    // 인덱스 업데이트
    setTimeout(() => {
      setCurrentIndex(index)
      setTimeout(() => setIsAnimating(false), 200)
    }, 300)
  }



  const handleLogout = async () => {
    try {
      // 백엔드에 로그아웃 요청
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('로그아웃 성공');
      } else {
        console.error('로그아웃 실패');
      }
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      // 프론트엔드 상태 정리
      removeAuthToken();
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery)
    }
  }

  const handleNavigation2 = (path: string) => {
    setIsSidebarOpen(false)
    router.push(path)
  }

  const handleLogout2 = async () => {
    await handleLogout()
    setIsSidebarOpen(false)
    router.push("/")
  }

  // 드래그 이벤트 핸들러들
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating || novels.length === 0) return

    // 자동 슬라이드 일시정지
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval)
      setAutoSlideInterval(null)
    }

    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragCurrentX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setDragCurrentX(e.clientX)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    const dragDistance = dragCurrentX - dragStartX
    const threshold = 50 // 드래그 임계값

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        // 오른쪽으로 드래그 - 이전 아이템
        handleNavigation("right")
      } else {
        // 왼쪽으로 드래그 - 다음 아이템
        handleNavigation("left")
      }
    }

    setIsDragging(false)
    setDragStartX(0)
    setDragCurrentX(0)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating || novels.length === 0) return

    // 자동 슬라이드 일시정지
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval)
      setAutoSlideInterval(null)
    }

    setIsDragging(true)
    setDragStartX(e.touches[0].clientX)
    setDragCurrentX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setDragCurrentX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const dragDistance = dragCurrentX - dragStartX
    const threshold = 50

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        handleNavigation("right")
      } else {
        handleNavigation("left")
      }
    }

    setIsDragging(false)
    setDragStartX(0)
    setDragCurrentX(0)
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
      {/* Header */}
      <header className="bg-blue-400 text-white p-4 shadow-md">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-xl font-bold">TaleCraft</h1>

          <div className="flex items-center space-x-2">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1 rounded text-black text-sm w-48 focus:outline-none focus:ring-2 focus:ring-white"
                  autoFocus
                />
                <Button
                  type="button"
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
              </form>
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
              <span className="text-sm font-medium hidden sm:inline">안녕하세요, {userInfo.userName}님!</span>
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 pt-8 pb-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 md:mb-16 text-center">당신을 위한 팡팡 터지는 소설들</h2>

        {/* Novel Carousel */}
        <div className="relative">
          {/* Carousel Content */}
          <div 
            className="relative h-96 flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="relative w-full max-w-6xl mx-auto">
              {carouselItems.map((item) => {
                const position = item.carouselPosition
                const isCenter = position === 0
                const isVisible = Math.abs(position) <= 1

                // Calculate transform based on position
                const translateX = position * 320

                let scale = 1
                let zIndex = 1
                let opacity = 1

                if (isCenter) {
                  scale = 1.25
                  zIndex = 10
                } else if (Math.abs(position) === 1) {
                  scale = 0.9
                  zIndex = 5
                } else {
                  opacity = 0
                  scale = 0.8
                }

                return (
                  <div
                    key={item.id}
                    className={`absolute top-1/2 left-1/2 transition-all duration-700 ease-in-out cursor-pointer ${
                      isVisible ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                    style={{
                      transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                      zIndex,
                      opacity,
                      width: "300px",
                      height: "300px",
                    }}
                    onClick={() => {
                      if (isDragging) return // 드래그 중일 때는 클릭 무시
                      if (!isCenter && isVisible) {
                        // Click on side banner to move it to center
                        handleNavigation(position > 0 ? "right" : "left")
                      } else if (isCenter) {
                        // 중앙 아이템 클릭 시 해당 소설의 상세 페이지로 이동
                        // 애니메이션 완료 후 페이지 이동
                        setTimeout(() => {
                          router.push(`/novel/${item.novelId}`)
                        }, 300)
                      }
                    }}
                  >
                                         <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg w-full h-full flex flex-col justify-center items-center text-center hover:from-blue-600 hover:to-purple-700 transition-colors shadow-lg border-2 border-white/20 overflow-hidden">
                       {item.titleImage ? (
                         <img
                           src={item.titleImage}
                           alt={item.title}
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.style.display = 'none';
                             target.nextElementSibling?.classList.remove('hidden');
                           }}
                         />
                       ) : (
                         <img
                           src="/Default.jpg"
                           alt="기본 소설 커버"
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.style.display = 'none';
                             target.nextElementSibling?.classList.remove('hidden');
                           }}
                         />
                       )}
                       <div className={`w-full h-full flex flex-col justify-center items-center p-6 ${item.titleImage || true ? 'hidden' : ''}`}>
                         <div className="w-16 h-16 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
                           <div className="w-8 h-8 bg-white/40 rounded"></div>
                         </div>
                         <h3 className="font-bold text-lg mb-2 text-center">{item.title}</h3>
                         <p className="text-sm opacity-80 text-center line-clamp-3">{item.summary}</p>
                       </div>
                     </div>
                  </div>
                )
              })}
            </div>
          </div>



          {/* Indicators */}
          <div className="flex justify-center space-x-2 mb-8 mt-8">
            {novels.slice(0, Math.min(novels.length, 5)).map((_, index) => (
              <button
                key={`indicator-${index}`}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  index === currentIndex ? "bg-purple-500 scale-110" : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => {
                  // 클릭 시 해당 인덱스로 캐러셀 이동
                  if (index !== currentIndex) {
                    handleIndicatorClick(index);
                  }
                }}
                aria-label={`소설 ${index + 1}로 이동`}
                disabled={isAnimating}
                style={{ pointerEvents: isAnimating ? 'none' : 'auto' }}
              />
            ))}
          </div>

          {/* Navigation Hint */}
          <div className="text-center text-gray-600">
            <p className="text-sm">드래그하거나 사이드 배너를 클릭하거나 하단 점을 클릭하여 작품을 확인하세요</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex justify-around items-center max-w-4xl mx-auto">
          {navigationItems.map((item) => (
            <Button
              key={item.value}
              variant={activeTab === item.value ? "default" : "outline"}
              className={`px-4 py-2 ${
                activeTab === item.value ? "bg-black text-white" : "bg-white text-black border-black hover:bg-gray-100"
              }`}
              onClick={() => {
                if (item.value === 'library') {
                  // 보관함 버튼 클릭 시 북마크 필터가 활성화된 상태로 my-novels 페이지로 이동
                  router.push('/my-novels?filter=bookmarked');
                } else if (item.value === 'best') {
                  // 베스트 버튼 클릭 시 novel-list 페이지로 이동
                  router.push('/novel-list');
                } else if (item.value === 'latest') {
                  // 최신 버튼 클릭 시 novel-list 페이지로 이동
                  router.push('/novel-list');
                } else if (item.value === 'completed') {
                  // 완결 버튼 클릭 시 novel-list 페이지로 이동
                  router.push('/novel-list');
                } else {
                  setActiveTab(item.value);
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-80 z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-b from-purple-400 to-pink-400 p-6 shadow-lg">
          {/* User Section */}
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
                  router.push("/auth/login")
                }}
              >
                로그인
              </button>
            )}
          </div>

          {/* Menu Buttons */}
          <div className="space-y-4">
            {isLoggedIn ? (
              <>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => handleNavigation2("/novel-create")}
                >
                  작품등록
                </button>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => handleNavigation2("/my-novels")}
                >
                  내 작품 목록
                </button>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => handleNavigation2("/mypage")}
                >
                  마이페이지
                </button>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => handleNavigation2("/messages")}
                >
                  쪽지함
                </button>
                {userInfo?.authorityId === "3" && (
                  <button
                    className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => handleNavigation2("/admin")}
                  >
                    관리자 페이지
                  </button>
                )}
                {userInfo?.authorityId === "1" && (
                  <button
                    className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                    onClick={() => handleNavigation2("/admin/inquiry")}
                  >
                    관리자 문의
                  </button>
                )}
                <button
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  onClick={handleLogout2}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => handleNavigation2("/auth/login")}
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  )
}
