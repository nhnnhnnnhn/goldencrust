"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, User, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your Pizza Liêm Khiết assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sample responses for the AI
  const sampleResponses = [
    "Our restaurant is open from 11:00 AM to 10:00 PM every day.",
    "You can make a reservation through our website or by calling us at +84 123 456 789.",
    "Our most popular pizza is the Tartufo Nero, featuring truffle cream and wild mushrooms.",
    "Yes, we offer vegetarian and vegan options on our menu.",
    "We have locations in Ho Chi Minh City, Hanoi, Da Nang, Nha Trang, and Phu Quoc.",
    "Our loyalty program offers points for every purchase that can be redeemed for free items.",
    "All of our ingredients are sourced locally whenever possible, supporting Vietnamese farmers.",
    "We received our Michelin star in 2022 for our innovative approach to traditional pizza making.",
  ]

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)]
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
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
            <h3 className="text-sm font-medium text-gray-900">Pizza Liêm Khiết Assistant</h3>
            <p className="text-xs text-gray-500">Ask me anything</p>
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
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex max-w-[85%] items-start rounded-lg px-3 py-2 ${
                message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.sender === "ai" && <Bot className="mr-1.5 mt-0.5 h-3 w-3 shrink-0" />}
              <div>
                <p className="text-xs">{message.content}</p>
                <p className="mt-1 text-right text-[10px] opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {message.sender === "user" && <User className="ml-1.5 mt-0.5 h-3 w-3 shrink-0" />}
            </div>
          </div>
        ))}
        {isTyping && (
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
            placeholder="Type your message..."
            className="flex-1 text-xs h-8"
          />
          <Button type="submit" size="sm" className="h-8 w-8 p-0" disabled={!input.trim() || isTyping}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
