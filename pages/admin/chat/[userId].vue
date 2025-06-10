<!-- pages/admin/chat/[userId].vue -->
<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Header dengan glassmorphism effect -->
    <div class="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg sticky top-0 z-10">
      <div class="px-6 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Chat with User {{ userId }}
            </h1>
            <p class="text-sm text-gray-500">Admin Dashboard</p>
          </div>
        </div>
        
        <!-- Connection Status -->
        <div class="flex items-center space-x-2">
          <div class="relative">
            <div :class="[
              'w-3 h-3 rounded-full transition-all duration-300',
              isConnected ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
            ]">
              <div v-if="isConnected" class="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
          <span :class="[
            'text-sm font-medium transition-colors duration-300',
            isConnected ? 'text-green-600' : 'text-red-600'
          ]">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div class="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-500 rounded-full animate-spin mx-auto" style="animation-delay: -0.15s;"></div>
        </div>
        <p class="mt-4 text-gray-600 font-medium">Loading conversation...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mx-6 mt-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-lg">
      <div class="flex items-start space-x-3">
        <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-red-800 font-medium">{{ error }}</p>
          <button @click="retryConnection" 
                  class="mt-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Retry Connection
          </button>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div v-if="!loading" class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        
        <!-- Empty State -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center">
          <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No messages yet</h3>
          <p class="text-gray-500 max-w-md">Start the conversation by sending a message below. Your messages will appear here in real-time.</p>
        </div>
        
        <!-- Messages -->
        <div v-for="message in messages" :key="message._id" class="flex" 
             :class="message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'">
          
          <!-- Admin Messages (Right) -->
          <div v-if="message.senderId === currentUser?.id" 
               class="flex items-end space-x-2 max-w-xs sm:max-w-md lg:max-w-lg">
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg transform hover:scale-105 transition-all duration-200 group">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium opacity-90">Admin (You)</span>
                <div class="w-2 h-2 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors"></div>
              </div>
              <p class="text-sm leading-relaxed">{{ message.content }}</p>
              <p class="text-xs opacity-75 mt-2 text-right">{{ formatTime(message.createdAt) }}</p>
            </div>
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-xs font-bold text-white">A</span>
            </div>
          </div>

          <!-- User Messages (Left) -->
          <div v-else class="flex items-end space-x-2 max-w-xs sm:max-w-md lg:max-w-lg">
            <div class="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-xs font-bold text-white">U</span>
            </div>
            <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg transform hover:scale-105 transition-all duration-200 group">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-gray-600">{{ getUserName(typeof message.senderId === 'string' ? message.senderId : message.senderId._id) }}</span>
                <div class="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors"></div>
              </div>
              <p class="text-sm text-gray-800 leading-relaxed">{{ message.content }}</p>
              <p class="text-xs text-gray-500 mt-2">{{ formatTime(message.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div v-if="!loading" class="bg-white/90 backdrop-blur-lg border-t border-white/20 p-4 sticky bottom-0">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-end space-x-3">
          <div class="flex-1 relative">
            <input
              v-model="newMessage"
              @keyup.enter="handleSendMessage"
              placeholder="Type your message..."
              :disabled="!isConnected"
              class="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-400"
            />
            <!-- Character count or status indicator -->
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div v-if="!isConnected" class="text-red-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                </svg>
              </div>
            </div>
          </div>
          
          <button
            @click="handleSendMessage"
            :disabled="!newMessage.trim() || !isConnected"
            class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
        
        <!-- Connection status indicator -->
        <div v-if="!isConnected" class="mt-2 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
            </svg>
            Connection lost - messages cannot be sent
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

// Get route params
const route = useRoute()
const userId = computed(() => route.params.userId as string)

// Validate userId
if (!userId.value) {
  throw createError({
    statusCode: 400,
    statusMessage: 'User ID is required'
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
  if (!newMessage.value.trim()) return
  
  const content = newMessage.value.trim()
  newMessage.value = '' // Clear input immediately
  
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
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getUserName = (senderId: string) => {
  if (senderId === userId.value) {
    return `User ${userId.value}`
  }
  // Fallback: show last 4 chars of senderId
  return `User ${senderId.slice(-4)}`
}

const scrollToBottom = () => {
  const container = document.querySelector('.overflow-y-auto')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// Auto-scroll on new messages
watch(messages, () => {
  nextTick(() => scrollToBottom())
})

// Page meta
definePageMeta({
  title: computed(() => `Admin Chat - User ${userId.value}`),
  layout: 'admin',
  middleware: 'auth'
})
</script>

<style scoped>
/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}

/* Smooth animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-enter-active {
  animation: fadeInUp 0.3s ease-out;
}

/* Glassmorphism effect */
.backdrop-blur-lg {
  backdrop-filter: blur(16px);
}

/* Gradient text */
.bg-clip-text {
  background-clip: text;
  -webkit-background-clip: text;
}

/* Hover effects */
.transform:hover {
  transition: all 0.2s ease-in-out;
}

/* Focus states */
input:focus {
  outline: none;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .max-w-xs {
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .max-w-xs {
    max-width: 240px;
  }
}
</style>