import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: Date
}

export interface ChatSession {
  sessionId: string
  messages: ChatMessage[]
  intent?: string
  status?: string
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/v1/chat',  // Sử dụng đường dẫn tương đối cho proxy
    credentials: 'include' 
  }),
  tagTypes: ['Chat'],
  endpoints: (builder) => ({
    initializeChat: builder.mutation<ChatSession, void>({
      query: () => ({
        url: '/initialize',
        method: 'POST'
      }),
      transformResponse: (response: { success: boolean, data: ChatSession }) => response.data,
      invalidatesTags: ['Chat']
    }),
    
    sendMessage: builder.mutation<ChatSession, { message: string, sessionId: string }>({
      query: (payload) => ({
        url: '/message',
        method: 'POST',
        body: payload
      }),
      transformResponse: (response: { success: boolean, data: ChatSession }) => response.data,
      invalidatesTags: ['Chat']
    }),
    
    getChatHistory: builder.query<ChatSession, string>({
      query: (sessionId) => `/${sessionId}`,
      transformResponse: (response: { success: boolean, data: ChatSession }) => response.data,
      providesTags: ['Chat']
    }),
    
    endChat: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `/${sessionId}/end`,
        method: 'PUT'
      }),
      invalidatesTags: ['Chat']
    })
  })
})

export const { 
  useInitializeChatMutation,
  useSendMessageMutation,
  useGetChatHistoryQuery,
  useEndChatMutation
} = chatApi
