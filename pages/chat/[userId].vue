<!-- pages/chat/[userId].vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div class="h-screen flex flex-col">
      
      <!-- Chat Header -->
      <div class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <!-- Back Button -->
              <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <!-- User Avatar & Info -->
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div>
                  <h1 class="text-xl font-bold text-gray-800">Chat with Admin</h1>
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-2 h-2 rounded-full',
                      isConnected ? 'bg-green-400' : 'bg-red-400'
                    ]"></div>
                    <span :class="[
                      'text-sm font-medium',
                      isConnected ? 'text-green-600' : 'text-red-600'
                    ]">
                      {{ isConnected ? 'Online' : 'Offline' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Connection Status -->
            <div class="flex items-center space-x-2">
              <div :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                isConnected 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              ]">
                {{ isConnected ? 'Connected' : 'Disconnected' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-600 font-medium">Connecting to chat...</p>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="flex-1 flex items-center justify-center p-6">
        <div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button 
            @click="retryConnection" 
            class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
      
      <!-- Messages Container -->
      <div v-else class="flex-1 overflow-y-auto">
        <div class="messages-container p-6 space-y-4">
          
          <!-- Empty State -->
          <div v-if="messages.length === 0" class="text-center py-16">
            <div class="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Start Your Conversation</h3>
            <p class="text-gray-500">Send a message to begin chatting with the admin</p>
          </div>
          
          <!-- Messages -->
          <div v-for="message in messages" :key="message._id" class="message-wrapper">
            
            <!-- Received Message (Admin) -->
            <div v-if="message.senderId !== currentUser?.id" class="flex items-start space-x-3 mb-4">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
              </div>
              <div class="flex-1 max-w-xs sm:max-w-md">
                <div class="bg-white rounded-2xl rounded-tl-md shadow-sm border border-gray-200 p-4">
                  <div class="text-xs text-gray-500 mb-1 font-medium">Admin</div>
                  <div class="text-gray-800 leading-relaxed">{{ message.content }}</div>
                </div>
                <div class="text-xs text-gray-400 mt-1 ml-2">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
            </div>
            
            <!-- Sent Message (User) -->
            <div v-else class="flex items-start justify-end space-x-3 mb-4">
              <div class="flex-1 max-w-xs sm:max-w-md">
                <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl rounded-tr-md shadow-sm p-4">
                  <div class="text-blue-100 leading-relaxed">{{ message.content }}</div>
                </div>
                <div class="text-xs text-gray-400 mt-1 mr-2 text-right">
                  {{ formatTime(message.createdAt) }}
                  <span class="ml-1 text-blue-500">✓</span>
                </div>
              </div>
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {{ currentUser?.name?.charAt(0).toUpperCase() || 'U' }}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <!-- Message Input -->
      <div v-if="!loading" class="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <div v-if="!isConnected" class="text-center mb-3">
          <div class="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Waiting for connection...
          </div>
        </div>
        
        <div class="flex items-end space-x-3">
          <div class="flex-1">
            <div class="relative">
              <input 
                v-model="newMessage"
                @keyup.enter="handleSendMessage"
                placeholder="Type your message..."
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                :disabled="!isConnected"
              />
              <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <button 
            @click="handleSendMessage"
            :disabled="!newMessage.trim() || !isConnected"
            class="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'

// Get route params (admin ID in this case)
const route = useRoute()
const userId = computed(() => route.params.userId as string)

// Validate userId
if (!userId.value) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Admin ID is required'
  })
}

// Use chat composable
const {
  messages,
  loading,
  error,
  isConnected,
  currentUser,
  sendMessage,
  retryConnection
} = useChat(userId.value)

// Local state
const newMessage = ref('')

// Send message handler
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !isConnected.value) return
  
  const content = newMessage.value.trim()
  newMessage.value = '' // Clear input immediately for better UX
  
  const success = await sendMessage(content)
  
  if (!success) {
    // Restore message if failed
    newMessage.value = content
  } else {
    // Scroll to bottom after sending
    await nextTick()
    scrollToBottom()
  }
}

// Utility functions
const formatTime = (dateString?: string) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const scrollToBottom = () => {
  const container = document.querySelector('.messages-container')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// Auto-scroll on new messages
watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })

// Page meta
definePageMeta({
  title: 'Chat with Admin',
  middleware: 'auth'
})
</script>