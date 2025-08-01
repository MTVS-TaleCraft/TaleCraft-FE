"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserInfo {
  userId: string;
  userName: string;
  email: string;
  authorityId: string;
}

export default function ComposeMessagePage() {
  const router = useRouter()
  const [receiver, setReceiver] = useState("")
  const [messageTitle, setMessageTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    checkLoginStatus()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!receiver.trim() || !messageTitle.trim() || !description.trim()) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/messages/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver: receiver.trim(),
          messageTitle: messageTitle.trim(),
          description: description.trim(),
        }),
      })

      if (response.ok) {
        alert("쪽지가 성공적으로 전송되었습니다.")
        router.push("/messages")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "쪽지 전송에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("쪽지 전송에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
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
              onClick={() => router.push("/messages")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">쪽지 쓰기</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-500"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 md:p-6 pt-8 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 받는 사람 */}
          <div>
            <label htmlFor="receiver" className="block text-sm font-medium text-gray-700 mb-2">
              받는 사람 *
            </label>
            <input
              type="text"
              id="receiver"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="받는 사람의 아이디를 입력하세요"
              maxLength={20}
              required
            />
            <p className="text-xs text-gray-500 mt-1">최대 20자까지 입력 가능합니다.</p>
          </div>

          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              id="title"
              value={messageTitle}
              onChange={(e) => setMessageTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="쪽지 제목을 입력하세요"
              maxLength={255}
              required
            />
            <p className="text-xs text-gray-500 mt-1">최대 255자까지 입력 가능합니다.</p>
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="쪽지 내용을 입력하세요"
              rows={10}
              required
            />
          </div>

          {/* 버튼 */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/messages")}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !receiver.trim() || !messageTitle.trim() || !description.trim()}
            >
              {isLoading ? "전송 중..." : "쪽지 보내기"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
} 