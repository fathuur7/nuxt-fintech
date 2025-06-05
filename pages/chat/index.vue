<!-- pages/admin/chat.vue -->
<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar - Admin List -->
    <div class="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-800">Admin Chats</h1>
          <button 
            @click="refreshUsers"
            class="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            :disabled="loading"
          >
            <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
        
        <!-- Search -->
        <div class="mt-3 relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search admins..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <!-- Connection Status -->
        <div class="mt-2 flex items-center text-xs">
          <div 
            class="w-2 h-2 rounded-full mr-2"
            :class="socketConnected ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <span :class="socketConnected ? 'text-green-600' : 'text-red-600'">
            {{ socketConnected ? 'Connected' : 'Disconnected' }}
          </span>
          <span v-if="lastUpdate" class="ml-2 text-gray-500">
            Updated: {{ lastUpdate }}
          </span>
        </div>
      </div>

      <!-- Admin List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading && users.length === 0" class="p-4 text-center text-gray-500">
          Loading admins...
        </div>
        
        <div v-else-if="error" class="p-4 text-center text-red-500">
          {{ error }}
          <button @click="refreshUsers" class="block mt-2 text-blue-500 hover:text-blue-700">
            Try Again
          </button>
        </div>
        
        <div v-else-if="filteredUsers.length === 0" class="p-4 text-center text-gray-500">
          No admins found
        </div>
        
        <div v-else>
          <div 
            v-for="admin in filteredUsers" 
            :key="admin._id"
            @click="handleAdminSelect(admin)"
            class="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
            :class="{ 'bg-blue-50 border-blue-200': selectedUserId === admin._id }"
          >
            <!-- Avatar -->
            <div class="relative">
              <img 
                :src="admin.picture || '/default-avatar.png'" 
                :alt="admin.name"
                class="w-12 h-12 rounded-full object-cover"
                @error="handleImageError"
              >
              <!-- Status indicator -->
              <div 
                class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                :class="{
                  'bg-green-500': admin.status === 'online',
                  'bg-yellow-500': admin.status === 'idle',
                  'bg-gray-400': admin.status === 'offline'
                }"
              ></div>
            </div>
            
            <!-- Admin info -->
            <div class="ml-3 flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ admin.name }}
                  </p>
                  <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ admin.role }}
                  </span>
                </div>
                <span class="text-xs text-gray-500 capitalize">
                  {{ admin.status }}
                </span>
              </div>
              <p class="text-xs text-gray-500 truncate">
                {{ admin.email }}
              </p>
              <!-- Last message preview -->
              <p v-if="getLastMessage(admin._id)" class="text-xs text-gray-400 truncate mt-1">
                {{ getLastMessage(admin._id) }}
              </p>
            </div>
            
            <!-- Unread count -->
            <div 
              v-if="getUnreadCount(admin._id) > 0"
              class="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
            >
              {{ getUnreadCount(admin._id) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Chat Header -->
      <div v-if="selectedUser" class="bg-white border-b border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img 
              :src="selectedUser.picture || '/default-avatar.png'" 
              :alt="selectedUser.name"
              class="w-10 h-10 rounded-full object-cover"
              @error="handleImageError"
            >
            <div class="ml-3">
              <div class="flex items-center">
                <h2 class="text-lg font-semibold text-gray-900">{{ selectedUser.name }}</h2>
                <span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ selectedUser.role }}
                </span>
              </div>
              <p class="text-sm text-gray-500 capitalize flex items-center">
                <span 
                  class="w-2 h-2 rounded-full mr-2"
                  :class="{
                    'bg-green-500': selectedUser.status === 'online',
                    'bg-yellow-500': selectedUser.status === 'idle',
                    'bg-gray-400': selectedUser.status === 'offline'
                  }"
                ></span>
                {{ selectedUser.status }}
              </p>
            </div>
          </div>
          
          <!-- Admin Actions -->
          <div class="flex items-center space-x-2">
            <button 
              @click="clearChat"
              class="text-gray-500 hover:text-red-600 p-1 rounded"
              title="Clear Chat"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!selectedUser" class="flex-1 flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Select an admin to chat</h3>
          <p class="text-gray-500">Choose an admin from the sidebar to start chatting</p>
        </div>
      </div>

      <!-- Messages Area -->
      <div v-else class="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div ref="messagesContainer" class="space-y-4">
          <!-- Loading messages -->
          <div v-if="messagesLoading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p class="text-gray-500 mt-2">Loading messages...</p>
          </div>
          
          <!-- No messages -->
          <div v-else-if="currentMessages.length === 0" class="text-center py-8">
            <p class="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
          
          <!-- Messages -->
          <div v-else>
            <div 
              v-for="message in currentMessages" 
              :key="message._id"
              class="flex"
              :class="{ 'justify-end': message.senderId === currentUser?._id }"
            >
              <div 
                class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                :class="{
                  'bg-blue-500 text-white': message.senderId === currentUser?._id,
                  'bg-white text-gray-900 border border-gray-200': message.senderId !== currentUser?._id
                }"
              >
                <p class="text-sm">{{ message.content }}</p>
                <p 
                  class="text-xs mt-1"
                  :class="{
                    'text-blue-100': message.senderId === currentUser?._id,
                    'text-gray-500': message.senderId !== currentUser?._id
                  }"
                >
                  {{ formatTime(message.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div v-if="selectedUser" class="bg-white border-t border-gray-200 p-4">
        <form @submit.prevent="sendMessage" class="flex items-center space-x-3">
          <input 
            v-model="newMessage"
            type="text" 
            placeholder="Type a message to admin..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="sending"
          >
          <button 
            type="submit"
            :disabled="!newMessage.trim() || sending"
            class="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="sending" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useProfile } from '@/composables/useProfie'
import { useAdminList } from '@/composables/useAdminList'
import { useNuxtApp } from '#app'

// Types
interface Admin {
  _id: string
  name: string
  email: string
  picture: string
  role: string
  status: 'online' | 'offline' | 'idle'
  updatedAt?: string
}

interface Message {
  _id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  isRead: boolean
}

interface ChatData {
  [userId: string]: {
    messages: Message[]
    unreadCount: number
    lastMessage?: string
  }
}

// Composables
const { user: currentUser, fetchUserData, getUserId } = useProfile()
const { 
  users, 
  loading, 
  error,
  socketConnected,
  lastUpdate,
  selectedUserId, 
  selectUser, 
  getUnreadCount: getUnreadCountFromComposable,
  refreshUsers,
  initializeSocket 
} = useAdminList()
const { $socket } = useNuxtApp()

// Reactive data
const newMessage = ref('')
const sending = ref(false)
const messagesLoading = ref(false)
const searchQuery = ref('')
const messagesContainer = ref<HTMLElement>()
const chats = ref<ChatData>({})

// Computed
const selectedUser = computed(() => {
  return users.value.find(user => user._id === selectedUserId.value) || null
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  return users.value.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const currentMessages = computed(() => {
  if (!selectedUser.value) return []
  return chats.value[selectedUser.value._id]?.messages || []
})

// Methods
const handleAdminSelect = async (admin: Admin) => {
  selectUser(admin) // This will update selectedUserId in the composable
  await loadMessages(admin._id)
  markAsRead(admin._id)
  scrollToBottom()
}

const loadMessages = async (userId: string) => {
  try {
    console.log('Loading messages for admin userId:', userId)
    messagesLoading.value = true
    
    const response = await $fetch<{ success: boolean, data: Message[] }>(`/api/message/getMessages`, {
      query: {
        userA: getUserId(),
        userB: userId
      },
      headers: {
        Authorization: `Bearer ${useCookie('token').value}`
      }
    })
    
    console.log('Admin messages response:', response)
    
    if (response.success) {
      if (!chats.value[userId]) {
        chats.value[userId] = { messages: [], unreadCount: 0 }
      }
      chats.value[userId].messages = response.data || []
    }
  } catch (error) {
    console.error('Error loading admin messages:', error)
  } finally {
    messagesLoading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedUser.value || sending.value) return
  
  try {
    sending.value = true
    const messageContent = newMessage.value.trim()
    
    console.log('Sending message to admin:', {
      senderId: getUserId(),
      toUserId: selectedUser.value._id,
      message: messageContent
    })
    
    const response = await $fetch<{ success: boolean, data: Message }>('/api/message/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useCookie('token').value}`
      },
      body: {
        senderId: getUserId(),
        toUserId: selectedUser.value._id,
        message: messageContent,
        messageType: 'text'
      }
    })
    
    console.log('Send message to admin response:', response)
    
    if (response.success) {
      // Add message to local chat
      if (!chats.value[selectedUser.value._id]) {
        chats.value[selectedUser.value._id] = { messages: [], unreadCount: 0 }
      }
      
      chats.value[selectedUser.value._id].messages.push(response.data)
      chats.value[selectedUser.value._id].lastMessage = messageContent
      
      // Emit via socket
      const socketInstance = $socket.get()
      if (socketInstance) {
        socketInstance.emit('send-message', {
          receiverId: selectedUser.value._id,
          content: messageContent,
          message: response.data
        })
      }
      
      newMessage.value = ''
      await nextTick()
      scrollToBottom()
    }
  } catch (error: any) {
    console.error('Error sending message to admin:', error)
    
    // Show user-friendly error message
    if (error.statusCode === 401) {
      console.error('Authentication failed')
    } else if (error.statusCode === 404) {
      console.error('Admin not found')
    } else {
      console.error('Failed to send message to admin')
    }
  } finally {
    sending.value = false
  }
}

const getLastMessage = (userId: string): string => {
  return chats.value[userId]?.lastMessage || ''
}

const getUnreadCount = (userId: string): number => {
  // Use local chat unread count if available, otherwise use composable
  return chats.value[userId]?.unreadCount || getUnreadCountFromComposable(userId)
}

const markAsRead = (userId: string) => {
  if (chats.value[userId]) {
    chats.value[userId].unreadCount = 0
  }
}

const clearChat = () => {
  if (selectedUser.value && confirm('Are you sure you want to clear this chat?')) {
    chats.value[selectedUser.value._id] = { messages: [], unreadCount: 0 }
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString('id-ID')
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-avatar.png'
}

// Socket event handlers
const setupSocketListeners = () => {
  const socket = $socket.get()
  if (!socket) return
  
  // Listen for incoming messages from admins
  socket.on('receive-message', (data: { senderId: string, message: Message }) => {
    const { senderId, message } = data
    
    if (!chats.value[senderId]) {
      chats.value[senderId] = { messages: [], unreadCount: 0 }
    }
    
    chats.value[senderId].messages.push(message)
    chats.value[senderId].lastMessage = message.content
    
    // Increment unread count if not current conversation
    if (!selectedUser.value || selectedUser.value._id !== senderId) {
      chats.value[senderId].unreadCount++
    }
    
    // Auto scroll if viewing this conversation
    if (selectedUser.value?._id === senderId) {
      scrollToBottom()
    }
  })
  
  // Listen for admin typing indicators
  socket.on('admin-typing', (data: { userId: string, isTyping: boolean }) => {
    console.log('Admin typing:', data)
  })
}

const cleanupSocketListeners = () => {
  const socket = $socket.get()
  if (!socket) return
  
  socket.off('receive-message')
  socket.off('admin-typing')
}

// Lifecycle
onMounted(async () => {
  // Ensure user data is fetched
  await fetchUserData()
  
  // Initialize socket (this is handled by the composable)
  await initializeSocket()
  
  // Setup additional socket listeners for chat
  setupSocketListeners()
})

onUnmounted(() => {
  cleanupSocketListeners()
})

// Watch for scroll to bottom when messages change
watch(currentMessages, () => {
  if (selectedUser.value) {
    nextTick(() => scrollToBottom())
  }
}, { deep: true })

// SEO
definePageMeta({
  title: 'Admin Chat',
  middleware: 'auth',
  meta: [
    { name: 'description', content: 'Chat with admins in real-time' },
    { name: 'keywords', content: 'admin, chat, messaging, real-time' }
  ]
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation for new messages */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-4 > div {
  animation: slideIn 0.3s ease-out;
}

/* Status indicator animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.bg-green-500 {
  animation: pulse 2s infinite;
}
</style>