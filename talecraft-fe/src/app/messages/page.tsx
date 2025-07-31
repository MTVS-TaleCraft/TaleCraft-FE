"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [messages, setMessages] = useState<Message[]>([])
  const [sentMessages, setSentMessages] = useState<Message[]>([])
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<Record<string, string | number | boolean> | null>(null)

  useEffect(() => {
    checkLoginStatus()
    fetchMessages()
  }, [])

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchUserInfo()
  }

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserInfo(data)
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      // 받은 쪽지 조회
      const receivedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/messages/received`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json()
        setReceivedMessages(receivedData)
      }

      // 보낸 쪽지 조회
      const sentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/messages/sent`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/messages/${type}/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
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
              size="icon"
              className="text-white hover:bg-blue-500"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">쪽지함</h1>
          </div>
                                                                                       <button
               className="bg-transparent border border-white text-white px-4 py-2 rounded-md hover:bg-white hover:text-blue-500 transition-colors"
               onClick={() => router.push("/messages/compose")}
             >
               쪽지 쓰기
             </button>
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
    </div>
  )
} 