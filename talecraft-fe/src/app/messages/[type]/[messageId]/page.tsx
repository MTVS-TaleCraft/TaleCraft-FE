"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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

export default function MessageDetailPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as "received" | "sent"
  const messageId = params.messageId as string
  
  const [message, setMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    checkLoginStatus()
    fetchMessage()
  }, [messageId, type])

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

  const fetchMessage = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/messages/${type}/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(data)
      } else {
        alert("쪽지를 찾을 수 없습니다.")
        router.replace("/messages")
      }
    } catch (error) {
      console.error("Failed to fetch message:", error)
      alert("쪽지 조회에 실패했습니다.")
      router.replace("/messages")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMessage = async () => {
    if (!confirm("정말로 이 쪽지를 삭제하시겠습니까?")) return

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
        alert("쪽지가 삭제되었습니다.")
        // 삭제 후 쪽지함으로 이동
        router.replace("/messages")
      } else {
        alert("쪽지 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
      alert("쪽지 삭제에 실패했습니다.")
    }
  }

  const handleGoBack = () => {
    // 뒤로가기 시 쪽지함으로 이동
    router.push("/messages")
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

  if (!message) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">쪽지를 찾을 수 없습니다.</p>
          <Button className="mt-4" onClick={() => router.replace("/messages")}>
            쪽지함으로 돌아가기
          </Button>
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
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">
              {type === "received" ? "받은 쪽지" : "보낸 쪽지"}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-red-500"
            onClick={handleDeleteMessage}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 md:p-6 pt-8 pb-24">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 제목 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {message.messageTitle}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                {type === "received" ? "보낸 사람" : "받는 사람"}: 
                <span className="font-medium ml-1">
                  {type === "received" ? message.sender : message.receiver}
                </span>
              </span>
            </div>
          </div>

          {/* 내용 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">내용</h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {message.description}
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.replace("/messages")}
            >
              목록으로
            </Button>
            {type === "received" && (
              <Button
                className="flex-1"
                onClick={() => router.push(`/messages/compose?replyTo=${message.sender}`)}
              >
                답장하기
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 