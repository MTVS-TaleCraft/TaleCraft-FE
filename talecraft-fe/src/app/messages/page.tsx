"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { checkAuthAndRedirect } from '@/utils/auth'

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

interface Message {
  messageId: number
  sender: string
  receiver: string
  messageTitle: string
  description: string
  isSenderDeleted: boolean
  isReceiverDeleted: boolean
}

export default function MessagesPage() {
  const router = useRouter()

  const [sentMessages, setSentMessages] = useState<Message[]>([])
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)


  useEffect(() => {
    const initPage = async () => {
      const isAuthenticated = await checkAuthAndRedirect(router);
      if (isAuthenticated) {
        checkLoginStatus();
        fetchMessages();
      }
    };

    initPage();
  }, [router])

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
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
      router.push("/auth/login");
    }
  }

  const fetchMessages = async () => {
    try {
      setIsLoading(true)

      // 받은 쪽지 조회
      const receivedResponse = await fetch('/api/messages/received', {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json()
        setReceivedMessages(receivedData)
      }

      // 보낸 쪽지 조회
      const sentResponse = await fetch('/api/messages/sent', {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (sentResponse.ok) {
        const sentData = await sentResponse.json()
        setSentMessages(sentData)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: number, type: "received" | "sent") => {
    try {
      const response = await fetch(`/api/messages/${type}/${messageId}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // 삭제 후 목록 새로고침
        fetchMessages()
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    }
  }

  const handleViewMessage = (messageId: number, type: "received" | "sent") => {
    router.push(`/messages/${type}/${messageId}`)
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-blue-500 text-xl font-bold"
              onClick={() => router.push("/")}
            >
              TaleCraft
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              className="bg-transparent border border-white text-white px-4 py-2 rounded-md hover:bg-white hover:text-blue-500 transition-colors"
              onClick={() => router.push("/messages/compose")}
            >
              쪽지 쓰기
            </button>
            
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
      <main className="max-w-4xl mx-auto p-4 md:p-6 pt-8 pb-24">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "received"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("received")}
          >
            받은 쪽지 ({receivedMessages.length})
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === "sent"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("sent")}
          >
            보낸 쪽지 ({sentMessages.length})
          </button>
        </div>

        {/* Message List */}
        <div className="space-y-4">
          {activeTab === "received" ? (
            receivedMessages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">받은 쪽지가 없습니다.</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/messages/compose")}
                >
                  쪽지 쓰기
                </Button>
              </div>
            ) : (
              receivedMessages.map((message) => (
                <div
                  key={message.messageId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {message.messageTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        보낸 사람: {message.sender}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {message.description}
                      </p>
                    </div>
                                         <div className="flex space-x-2 ml-4">
                       <Button
                         variant="outline"
                         size="sm"
                         className="text-blue-600 hover:bg-blue-50"
                         onClick={() => handleViewMessage(message.messageId, "received")}
                       >
                         읽기
                       </Button>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="text-red-600 hover:bg-red-50"
                         onClick={() => handleDeleteMessage(message.messageId, "received")}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                  </div>
                </div>
              ))
            )
          ) : (
            sentMessages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">보낸 쪽지가 없습니다.</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/messages/compose")}
                >
                  쪽지 쓰기
                </Button>
              </div>
            ) : (
              sentMessages.map((message) => (
                <div
                  key={message.messageId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {message.messageTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        받는 사람: {message.receiver}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {message.description}
                      </p>
                    </div>
                                         <div className="flex space-x-2 ml-4">
                       <Button
                         variant="outline"
                         size="sm"
                         className="text-blue-600 hover:bg-blue-50"
                         onClick={() => handleViewMessage(message.messageId, "sent")}
                       >
                         읽기
                       </Button>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="text-red-600 hover:bg-red-50"
                         onClick={() => handleDeleteMessage(message.messageId, "sent")}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                  </div>
                </div>
              ))
            )
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
                  setIsSidebarOpen(false);
                  router.push("/auth/login");
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
                  onClick={() => {
                    setIsSidebarOpen(false);
                    router.push("/my-novels");
                  }}
                >
                  내 작품 목록
                </button>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    router.push("/mypage");
                  }}
                >
                  마이페이지
                </button>
                <button
                  className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    router.push("/messages");
                  }}
                >
                  쪽지함
                </button>
                {userInfo?.authorityId === "3" && (
                  <button
                    className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      router.push("/admin");
                    }}
                  >
                    관리자 페이지
                  </button>
                )}
                {userInfo?.authorityId === "1" && (
                  <button
                    className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                    onClick={() => {
                      setIsSidebarOpen(false);
                      router.push("/admin/inquiry");
                    }}
                  >
                    관리자 문의
                  </button>
                )}
                <button
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    router.push("/");
                  }}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <button
                className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => {
                  setIsSidebarOpen(false);
                  router.push("/auth/login");
                }}
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
          isSidebarOpen ? "opacity-100" : "pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
    </div>
  )
} 