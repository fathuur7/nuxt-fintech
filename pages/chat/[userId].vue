<!-- pages/chat/[userId].vue -->
<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1 class="text-xl font-bold">Chat with Admin</h1>
      <div class="connection-status">
        <span :class="isConnected ? 'text-green-500' : 'text-red-500'">
          {{ isConnected ? '🟢 Connected' : '🔴 Disconnected' }}
        </span>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center p-4">
      <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="mt-2">Connecting to chat...</p>
    </div>
    
    <!-- Error state -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{{ error }}</p>
      <button @click="retryConnection" class="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
        Retry Connection
      </button>
    </div>
    
    <!-- Messages -->
    <div v-if="!loading" class="messages-container">
      <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
        <div class="text-4xl mb-2">💬</div>
        <p>Start your conversation with the admin!</p>
      </div>
      
      <div v-for="message in messages" :key="message._id" class="message-item">
        <div :class="[
          'message-bubble',
          message.senderId === currentUser?.id ? 'sent' : 'received'
        ]">
          <div class="message-sender" v-if="message.senderId !== currentUser?.id">
            Admin
          </div>
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">
            {{ formatTime(message.createdAt) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Message input -->
    <div v-if="!loading" class="message-input">
      <div class="input-container">
        <input 
          v-model="newMessage"
          @keyup.enter="handleSendMessage"
          placeholder="Type your message to admin..."
          class="message-field"
          :disabled="!isConnected"
        />
        <button 
          @click="handleSendMessage"
          :disabled="!newMessage.trim() || !isConnected"
          class="send-button"
        >
          <span v-if="!isConnected">Connecting...</span>
          <span v-else>Send</span>
        </button>
      </div>
      
      <div v-if="!isConnected" class="text-xs text-gray-500 mt-1 text-center">
        Waiting for connection to send messages...
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
