"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, User, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInitializeChatMutation, useSendMessageMutation, useEndChatMutation } from "@/redux/api/chatApi"
import { io, Socket } from "socket.io-client"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isTyping?: boolean
}

// Kiểu tin nhắn nhận được từ socket
interface AssistantMessageEvent {
  type: 'thinking' | 'typing' | 'complete' | 'error'
  content: string
  isComplete: boolean
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Xin chào! Tôi là trợ lý ảo của nhà hàng Golden Crust. Tôi có thể giúp gì cho bạn?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [sessionId, setSessionId] = useState<string>("") 
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  // Redux Toolkit hooks
  const [initializeChat, { isLoading: isInitializing }] = useInitializeChatMutation()
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [endChat] = useEndChatMutation()

  // Khởi tạo chat session và kết nối socket khi component mount
  useEffect(() => {
    if (isOpen && !sessionId) {
      handleInitializeChat()
    }
    
    // Khởi tạo kết nối Socket.IO khi có sessionId
    if (isOpen && sessionId && !socketRef.current) {
      // Khởi tạo kết nối với server
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        withCredentials: true
      })
      
      // Lưu socket vào ref
      socketRef.current = socket
      
      // Tham gia vào phòng chat dựa trên sessionId
      socket.emit('join', sessionId)
      
      // Xử lý tin nhắn từ assistant
      socket.on('assistant_message', (data: AssistantMessageEvent) => {
        console.log('Nhận tin nhắn từ assistant:', data)
        
        // Xử lý các trạng thái tin nhắn khác nhau
        switch (data.type) {
          case 'thinking':
            // Hiển thị trạng thái đang suy nghĩ
            setIsTyping(true)
            break
            
          case 'typing':
            // Hiển thị tin nhắn đang gõ dần từng từ một
            setIsTyping(true)
            
            // Tìm hoặc tạo mới tin nhắn với hiệu ứng gõ từng từ
            setMessages(prevMessages => {
              // Tìm tin nhắn đang được gõ (nếu có)
              const typingMessageIndex = prevMessages.findIndex(
                msg => msg.isTyping === true && msg.sender === 'ai'
              )
              
              let updatedContent = data.content
              
              // Một số thay đổi để tái sử dụng tin nhắn trước đó
              if (typingMessageIndex >= 0) {
                // Tin nhắn đang gõ đã tồn tại
                const updatedMessages = [...prevMessages]
                
                // Chỉ cập nhật trực tiếp mà không tạo mới
                updatedMessages[typingMessageIndex] = {
                  ...updatedMessages[typingMessageIndex],
                  content: updatedContent,
                  isTyping: !data.isComplete
                }
                return updatedMessages
              } else {
                // Tạo tin nhắn mới, bắt đầu với văn bản ban đầu
                return [...prevMessages, {
                  id: Date.now().toString(), 
                  content: updatedContent,
                  sender: 'ai',
                  timestamp: new Date(),
                  isTyping: !data.isComplete
                }]
              }
            })
            break
            
          case 'complete':
            // Hoàn tất tin nhắn
            setIsTyping(false)
            setMessages(prevMessages => {
              // Tìm tin nhắn đang được gõ và hoàn thành nó
              const typingMessageIndex = prevMessages.findIndex(msg => msg.isTyping === true && msg.sender === 'ai')
              
              if (typingMessageIndex >= 0) {
                // Cập nhật nội dung tin nhắn và đánh dấu đã hoàn thành
                const updatedMessages = [...prevMessages]
                updatedMessages[typingMessageIndex] = {
                  ...updatedMessages[typingMessageIndex],
                  content: data.content,
                  isTyping: false
                }
                return updatedMessages
              } else {
                // Nếu không tìm thấy tin nhắn đang gõ, thêm tin nhắn mới
                return [...prevMessages, {
                  id: Date.now().toString(),
                  content: data.content,
                  sender: 'ai',
                  timestamp: new Date(),
                  isTyping: false
                }]
              }
            })
            break
            
          case 'error':
            // Hiển thị lỗi
            setIsTyping(false)
            setError(data.content)
            break
        }
      })
      
      // Xử lý lỗi kết nối
      socket.on('connect_error', (error) => {
        console.error('Lỗi kết nối socket:', error)
        setError('Không thể kết nối với trợ lý ảo. Vui lòng thử lại sau.')
      })
    }
    
    // Dọn dẹp khi component unmount hoặc đóng chat
    return () => {
      if (sessionId && !isOpen) {
        // Kết thúc phiên chat
        endChat(sessionId).catch(console.error)
      }
      
      // Đóng socket nếu đang mở
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [isOpen, sessionId, endChat])
  
  // Đảm bảo socket được kết nối lại nếu cần
  useEffect(() => {
    if (isOpen && sessionId && !socketRef.current) {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        withCredentials: true
      })
      socketRef.current = socket
      socket.emit('join', sessionId)
    }
  }, [isOpen, sessionId])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Khởi tạo phiên chat mới
  const handleInitializeChat = async () => {
    try {
      setIsTyping(true)
      const session = await initializeChat().unwrap()
      
      if (session) {
        setSessionId(session.sessionId)
        
        if (session.messages && session.messages.length > 0) {
          setMessages(session.messages.map((msg, index) => ({
            id: index.toString(),
            content: msg.content,
            sender: msg.role === "user" ? "user" : "ai", 
            timestamp: new Date()
          })))
        }
      }
    } catch (err) {
      console.error("Lỗi khi khởi tạo chat:", err)
      setError("Không thể kết nối tới trợ lý ảo. Vui lòng thử lại sau.")
    } finally {
      setIsTyping(false)  
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !sessionId) return

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: "user" as const,
      timestamp: new Date(),
    }
    
    // Cập nhật UI ngay lập tức với tin nhắn của người dùng
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)
    
    try {
      // Gọi API để gửi tin nhắn và khởi động stream
      await sendMessage({
        sessionId,
        message: userMessage.content
      }).unwrap()
      
      // Không cần thêm tin nhắn của trợ lý vào đây
      // Vì socket.io sẽ gửi từng phần tin nhắn ngay real-time
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err)
      setError("Không thể gửi tin nhắn. Vui lòng thử lại sau.")
      setIsTyping(false) // Chỉ tắt typing khi có lỗi
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed bottom-20 right-6 z-50 flex flex-col bg-white shadow-xl rounded-lg transition-all duration-300 ease-in-out ${
        isExpanded ? "w-full max-w-md h-[70vh]" : "w-80 h-96"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Bot className="h-4 w-4" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">Trợ lý Golden Crust</h3>
            <p className="text-xs text-gray-500">Hỏi tôi về mọi thứ</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {error && (
          <div className="bg-red-50 text-red-500 p-2 rounded-md text-xs border border-red-200 mb-3">
            {error}
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex max-w-[85%] items-start rounded-lg px-3 py-2 ${
                message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.sender === "ai" && <Bot className="mr-1.5 mt-0.5 h-3 w-3 shrink-0" />}
              <div>
                <p className={`text-xs ${message.isTyping ? "after:inline-block after:h-2 after:w-1 after:bg-current after:animate-blink after:ml-0.5" : ""}`}>
                  {message.content}
                </p>
                <p className="mt-1 text-right text-[10px] opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {message.sender === "user" && <User className="ml-1.5 mt-0.5 h-3 w-3 shrink-0" />}
            </div>
          </div>
        ))}
        {isTyping && !messages.some(m => m.isTyping) && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] items-center rounded-lg bg-gray-100 px-3 py-2 text-gray-800">
              <Bot className="mr-1.5 h-3 w-3 shrink-0" />
              <div className="flex space-x-1">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></div>
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
            className="flex-1 text-xs h-8"
          />
          <Button type="submit" size="sm" className="h-8 w-8 p-0" disabled={!input.trim() || isTyping || isSending || isInitializing}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
