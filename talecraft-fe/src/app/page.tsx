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
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [commonTags, setCommonTags] = useState<string[]>([])
  const [loadingTags, setLoadingTags] = useState(false)

  const navigationItems = [
    { label: "내 작품 목록", value: "my-novels" },
  ]

  useEffect(() => {
    checkLoginStatus()
    fetchNovels()
    fetchDefaultTags()
  }, [])

  // 자동 슬라이드 기능 (사용자 인터랙션 방해를 위해 비활성화)
  useEffect(() => {
    if (novels.length === 0) return

    // 기존 인터벌 정리
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval)
    }

    // 자동 슬라이드 비활성화 (사용자 인터랙션 방해)
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

  const handleNavigation = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating || novels.length === 0) return

      setIsAnimating(true)

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
        setTimeout(() => setIsAnimating(false), 300)
      }, 200)
    },
    [isAnimating, novels.length],
  )

  // Handle direct button navigation with direction-based animation
  const handleButtonClick = (targetIndex: number) => {
    if (isAnimating || targetIndex === currentIndex || novels.length === 0) return

    setIsAnimating(true)

    // 항상 순차적으로 이동하되 순환되게 보이도록 방향 결정
    let direction: "left" | "right"
    
    // 직접 거리 계산
    const directDistance = targetIndex - currentIndex
    
    // 방향 결정 (항상 순차적이지만 순환 고려)
    if (directDistance > 0) {
      direction = "left" // 오른쪽으로 이동 (캐러셀은 왼쪽으로 회전)
    } else {
      direction = "right" // 왼쪽으로 이동 (캐러셀은 오른쪽으로 회전)
    }

    // 건너뛰는 거리에 따라 단계별 애니메이션
    const steps = Math.abs(directDistance)
    
    const animateStep = (step: number) => {
      if (step >= steps) {
        // 최종 위치로 이동
        setCurrentIndex(targetIndex)
        setTimeout(() => setIsAnimating(false), 300)
        return
      }

      // 한 단계씩 이동하면서 순환 효과 생성
      setCarouselItems((prev) =>
        prev.map((item) => {
          let newPosition = direction === "left" ? item.carouselPosition - 1 : item.carouselPosition + 1
          
          // 순환 효과: -2 위치에서 왼쪽으로 가면 2 위치로, 2 위치에서 오른쪽으로 가면 -2 위치로
          if (newPosition < -2) {
            newPosition = 2
          } else if (newPosition > 2) {
            newPosition = -2
          }
          
          return {
            ...item,
            carouselPosition: newPosition,
          }
        }),
      )

      // 다음 단계 애니메이션
      setTimeout(() => {
        animateStep(step + 1)
      }, 200)
    }

    // 애니메이션 시작
    animateStep(0)
  }

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
      } else if (response.status === 401) {
        // 토큰 만료 또는 인증 실패 시에도 로그인 상태 유지
        console.log('토큰이 만료되었지만 로그인 상태를 유지합니다.');
        // removeAuthToken(); // 자동 로그아웃 방지
        // setIsLoggedIn(false); // 로그인 상태 유지
        // setUserInfo(null); // 사용자 정보 유지
      } else {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('로그인 상태 확인 중 오류:', error);
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const fetchDefaultTags = async () => {
    setLoadingTags(true);
    try {
      // 기본 태그만 가져오기
      const response = await fetch('/api/tags/default', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCommonTags(data.tagNames || []);
      } else {
        console.error('기본 태그 로드 실패:', response.status);
        setCommonTags([]);
      }
    } catch (error) {
      console.error('기본 태그 로드 실패:', error);
      setCommonTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  const fetchNovels = async (tag?: string) => {
    try {
      setIsLoading(true)

      let url = '/api/novels';
      if (tag) {
        url = `/api/tags/search/novels?tagName=${encodeURIComponent(tag)}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        if (tag) {
          // 태그 검색 실패 시 기본 소설들로 폴백
          await fetchNovels();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (tag) {
        // 태그 검색 결과
        setNovels(data.novelList || [])
      } else {
        // 기본 랜덤 소설들
        const shuffled = [...data.novelList].sort(() => 0.5 - Math.random())
        const randomNovels = shuffled.slice(0, 5)
        setNovels(randomNovels)
      }
    } catch (error) {
      console.error('소설 목록 로드 실패:', error);
      setNovels([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagClick = async (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
    if (selectedTag === tag) {
      // 같은 태그를 다시 클릭하면 전체 목록으로
      await fetchNovels();
    } else {
      // 새로운 태그를 클릭하면 해당 태그의 소설들
      await fetchNovels(tag);
    }
  };

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
        // 로그아웃 성공
      } else {
        // 로그아웃 실패
      }
    } catch (error) {
      // 로그아웃 중 오류
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
      // 검색 기능 구현 예정
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
        <div className="grid grid-cols-3 items-center w-full gap-4">
          {/* Left: Logo */}
          <h1 className="text-xl font-bold">TaleCraft</h1>

          {/* Center: Navigation Buttons - Perfectly centered */}
          <div className="flex justify-center">
            <div className="flex space-x-4">
              {/* 작품등록하기 버튼 */}
              {isLoggedIn && (
                <Button
                  variant="outline"
                  className="px-4 py-2 bg-transparent text-white border-white hover:bg-white hover:text-blue-600"
                  onClick={() => router.push('/novel-create')}
                >
                  작품등록하기
                </Button>
              )}
              
              {/* 보관함 버튼 */}
              {navigationItems.map((item) => (
                <Button
                  key={item.value}
                  variant={activeTab === item.value ? "default" : "outline"}
                  className={`px-4 py-2 ${
                    activeTab === item.value ? "bg-white text-blue-600" : "bg-transparent text-white border-white hover:bg-white hover:text-blue-600"
                  }`}
                  onClick={() => {
                    if (item.value === 'my-novels') {
                      // 내 작품 목록 버튼 클릭 시 my-novels 페이지로 이동
                      router.push('/my-novels');
                    } else {
                      setActiveTab(item.value);
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Right: Search, User Info, Menu */}
          <div className="flex items-center justify-end space-x-2">
            {/* Search Input - Always Visible with white background */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="검색어를 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 rounded text-black text-sm w-48 focus:outline-none focus:ring-2 focus:ring-white bg-white"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-500"
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">검색</span>
              </Button>
            </form>

            {isLoggedIn && userInfo ? (
              // 로그인한 경우: 프로필 아이콘 (사이드바 열기)
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-500"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {userInfo.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="sr-only">프로필 메뉴</span>
              </Button>
            ) : (
              // 로그인하지 않은 경우: 로그인 버튼
              <Button
                variant="outline"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 px-4 py-2 text-sm"
                onClick={() => router.push("/auth/login")}
              >
                로그인
              </Button>
            )}
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
                const isVisible = Math.abs(position) <= 1 // 3개만 보이도록

                // Calculate transform based on position
                const translateX = position * 320

                let scale = 1
                let zIndex = 1
                let opacity = 1

                if (isCenter) {
                  scale = 1.2
                  zIndex = 10
                } else if (Math.abs(position) === 1) {
                  scale = 0.85
                  zIndex = 5
                  opacity = 0.7
                } else {
                  // 4, 5번째 아이템은 완전히 가림
                  opacity = 0
                  scale = 0.7
                  zIndex = 0
                }

                return (
                  <div
                    key={item.id}
                    className={`absolute top-1/2 left-1/2 transition-all duration-500 ease-out cursor-pointer ${
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
                        const targetIndex = novels.findIndex(novel => novel.novelId === item.novelId)
                        
                        // 현재 중앙 배너를 기준으로 상대적 방향 결정
                        const currentCenterIndex = currentIndex
                        const directDistance = targetIndex - currentCenterIndex
                        
                        // 순환 거리 계산
                        let wrapAroundDistance: number
                        if (directDistance > 0) {
                          wrapAroundDistance = directDistance - novels.length
                        } else {
                          wrapAroundDistance = directDistance + novels.length
                        }
                        
                        // 더 짧은 경로 선택
                        const finalDistance = Math.abs(directDistance) <= Math.abs(wrapAroundDistance) 
                          ? directDistance 
                          : wrapAroundDistance
                        
                        // 방향 결정
                        let direction: "left" | "right"
                        if (finalDistance > 0) {
                          direction = "left" // 오른쪽으로 이동 (캐러셀은 왼쪽으로 회전)
                        } else {
                          direction = "right" // 왼쪽으로 이동 (캐러셀은 오른쪽으로 회전)
                        }
                        
                        // 건너뛰는 거리에 따라 단계별 애니메이션
                        const steps = Math.abs(finalDistance)
                        
                        const animateStep = (step: number) => {
                          if (step >= steps) {
                            // 최종 위치로 이동
                            setCurrentIndex(targetIndex)
                            setTimeout(() => setIsAnimating(false), 300)
                            return
                          }

                          // 한 단계씩 이동
                          setCarouselItems((prev) =>
                            prev.map((carouselItem) => ({
                              ...carouselItem,
                              carouselPosition: direction === "left" ? carouselItem.carouselPosition - 1 : carouselItem.carouselPosition + 1,
                            })),
                          )

                          // 다음 단계 애니메이션
                          setTimeout(() => {
                            animateStep(step + 1)
                          }, 200)
                        }

                        // 애니메이션 시작
                        setIsAnimating(true)
                        animateStep(0)
                      } else if (isCenter) {
                        // 중앙 아이템 클릭 시 해당 소설의 상세 페이지로 이동
                        setTimeout(() => {
                          router.push(`/novel/${item.novelId}`)
                        }, 200)
                      }
                    }}
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg w-full h-full flex flex-col justify-center items-center text-center hover:from-blue-600 hover:to-purple-700 transition-colors shadow-lg border-2 border-white/20 overflow-hidden relative">
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
                        <p className="text-sm opacity-80 text-center line-clamp-3">{item.title}</p>
                      </div>
                      
                      {/* 배너 밑에 항상 보이는 title */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3">
                        <h3 className="font-bold text-sm text-center truncate">{item.title}</h3>
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
                  if (index !== currentIndex) {
                    handleButtonClick(index);
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

        {/* 태그 필터와 소설 목록을 자연스럽게 통합 */}
        <div className="mt-16">
          {/* 태그 필터 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">태그별 필터</h3>
            
            {/* 기본 태그 섹션 */}
            {!loadingTags && commonTags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  기본 태그
                </h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedTag === tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {loadingTags && (
              <div className="flex items-center justify-center w-full py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">태그 로딩 중...</span>
              </div>
            )}
            
            {!loadingTags && commonTags.length === 0 && (
              <div className="text-gray-500 text-sm text-center">사용 가능한 태그가 없습니다.</div>
            )}
            
            {selectedTag && (
              <div className="mt-4 text-center">
                <span className="text-blue-600 font-medium">선택된 태그: {selectedTag}</span>
                <button
                  onClick={() => handleTagClick(selectedTag)}
                  className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  필터 해제
                </button>
              </div>
            )}
          </div>

          {/* 소설 목록 */}
          {novels.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                {selectedTag ? `"${selectedTag}" 태그의 소설들` : '추천 소설들'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {novels.map((novel) => (
                  <div
                    key={novel.novelId}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/novel/${novel.novelId}`)}
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      {novel.titleImage ? (
                        <img
                          src={novel.titleImage}
                          alt={novel.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white text-center p-4">
                          <div className="w-16 h-16 bg-white/20 rounded-lg mb-2 mx-auto"></div>
                          <h4 className="font-semibold">{novel.title}</h4>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{novel.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{novel.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>



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
