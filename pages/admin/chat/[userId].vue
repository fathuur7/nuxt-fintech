<!-- pages/admin/chat/[userId].vue -->
<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1 class="text-xl font-bold">Chat with User {{ userId }}</h1>
      <div class="connection-status">
        <span :class="isConnected ? 'text-green-500' : 'text-red-500'">
          {{ isConnected ? '🟢 Connected' : '🔴 Disconnected' }}
        </span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center p-4">
      <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="mt-2">Loading chat...</p>
    </div>

    <!-- Error state -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{{ error }}</p>
      <button @click="retryConnection" class="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
        Retry
      </button>
    </div>

    <!-- Messages -->
    <div v-if="!loading" class="messages-container">
      <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
        No messages yet. Start the conversation!
      </div>
      
      <div v-for="message in messages" :key="message._id" class="message-wrapper">
        <!-- Message from current user (Admin) - Right side -->
        <div v-if="message.senderId === currentUser?.id" class="message-item sent">
          <div class="message-bubble sent-bubble">
            <div class="message-header">
              <span class="sender-name">Admin (You)</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">
              {{ formatTime(message.createdAt) }}
            </div>
          </div>
        </div>

        <!-- Message from other user - Left side -->
        <div v-else class="message-item received">
          <div class="message-bubble received-bubble">
            <div class="message-header">
              <span class="sender-name">{{ getUserName(typeof message.senderId === 'string' ? message.senderId : message.senderId._id) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">
              {{ formatTime(message.createdAt) }}
            </div>
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
          placeholder="Type your message..."
          class="message-field"
          :disabled="!isConnected"
        />
        <button
          @click="handleSendMessage"
          :disabled="!newMessage.trim() || !isConnected"
          class="send-button"
        >
          Send
        </button>
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

// const getUserName = (senderId: string) => {
const getUserName = (senderId: string) => {
  if (senderId === userId.value) {
    return `User ${userId.value}`
  }
  // Fallback: show last 4 chars of senderId
  return `User ${senderId.slice(-4)}`
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
})

// Page meta
definePageMeta({
  title: computed(() => `Admin Chat - User ${userId.value}`),
  layout: 'admin',
  middleware: 'auth'
})
</script>

<style scoped>

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f1f5f9;
}

.message-wrapper {
  margin-bottom: 1rem;
}

.message-item {
  display: flex;
  width: 100%;
}

.message-item.sent {
  justify-content: flex-end;
}

.message-item.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sent-bubble {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.received-bubble {
  background: white;
  color: #1f2937;
  border-bottom-left-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}

.message-header {
  margin-bottom: 0.25rem;
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.8;
}

.sent-bubble .sender-name {
  color: #dbeafe;
}

.received-bubble .sender-name {
  color: #6b7280;
}

.message-content {
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  text-align: right;
}

.received-bubble .message-time {
  text-align: left;
}

.message-input {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.input-container {
  display: flex;
  gap: 0.5rem;
  max-width: 100%;
}

.message-field {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s;
}

.message-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-field:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #2563eb;
}

.send-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 640px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .chat-header {
    padding: 0.75rem;
  }
  
  .messages-container {
    padding: 0.75rem;
  }
  
  .message-input {
    padding: 0.75rem;
  }
}
</style>