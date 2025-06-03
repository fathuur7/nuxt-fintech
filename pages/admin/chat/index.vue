<!-- pages/chat.vue -->
<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar - User List -->
    <div class="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-800">Chats</h1>
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
            placeholder="Search users..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <!-- User List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading && users.length === 0" class="p-4 text-center text-gray-500">
          Loading users...
        </div>
        
        <div v-else-if="filteredUsers.length === 0" class="p-4 text-center text-gray-500">
          No users found
        </div>
        
        <div v-else>
          <div 
            v-for="chatUser in filteredUsers" 
            :key="chatUser._id"
            @click="selectUser(chatUser)"
            class="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
            :class="{ 'bg-blue-50 border-blue-200': selectedUser?._id === chatUser._id }"
          >
            <!-- Avatar -->
            <div class="relative">
              <img 
                :src="chatUser.picture || '/default-avatar.png'" 
                :alt="chatUser.name"
                class="w-12 h-12 rounded-full object-cover"
                @error="handleImageError"
              >
              <!-- Status indicator -->
              <div 
                class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                :class="{
                  'bg-green-500': chatUser.status === 'online',
                  'bg-yellow-500': chatUser.status === 'idle',
                  'bg-gray-400': chatUser.status === 'offline'
                }"
              ></div>
            </div>
            
            <!-- User info -->
            <div class="ml-3 flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ chatUser.name }}
                </p>
                <span class="text-xs text-gray-500 capitalize">
                  {{ chatUser.status }}
                </span>
              </div>
              <p class="text-xs text-gray-500 truncate">
                {{ chatUser.email }}
              </p>
              <!-- Last message preview -->
              <p v-if="getLastMessage(chatUser._id)" class="text-xs text-gray-400 truncate mt-1">
                {{ getLastMessage(chatUser._id) }}
              </p>
            </div>
            
            <!-- Unread count -->
            <div 
              v-if="getUnreadCount(chatUser._id) > 0"
              class="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
            >
              {{ getUnreadCount(chatUser._id) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Chat Header -->
      <div v-if="selectedUser" class="bg-white border-b border-gray-200 p-4">
        <div class="flex items-center">
          <img 
            :src="selectedUser.picture || '/default-avatar.png'" 
            :alt="selectedUser.name"
            class="w-10 h-10 rounded-full object-cover"
            @error="handleImageError"
          >
          <div class="ml-3">
            <h2 class="text-lg font-semibold text-gray-900">{{ selectedUser.name }}</h2>
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
      </div>

      <!-- Empty state -->
      <div v-if="!selectedUser" class="flex-1 flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p class="text-gray-500">Choose a user from the sidebar to start chatting</p>
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
            placeholder="Type a message..."
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
import { useUsers } from '@/composables/useUsers'
import { useNuxtApp } from '#app'
import type { User } from '~/types/user'

// Types
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

const {
  selectedUserId,
  users,
  // selectUser
} = useUsersList();

// const { user, fetchUserData } = useProfile();

// Ensure user data is fetched on mount
onMounted(() => {
  fetchUserData();
});

// Computed: user yang sedang dipilih
// const selectedUser = computed(() => {
//   console.log('Selected User ID:', selectedUserId.value);
//   return users.value.find(user => user._id === selectedUserId.value) || null;
// });

// // Computed: user yang sedang login (admin)
// const currentUser = computed(() => user.value);
// console.log('Current User:', currentUser);


// Composables
const { user: currentUser, fetchUserData, getUserId } = useProfile()
const {  loading, fetchUsers } = useUsers()
const { $socket } = useNuxtApp()

// Reactive data
const selectedUser = ref<User | null>(null)
const newMessage = ref('')
const sending = ref(false)
const messagesLoading = ref(false)
const searchQuery = ref('')
const messagesContainer = ref<HTMLElement>()
const chats = ref<ChatData>({})
const currentUserId = computed(() => currentUser.value?._id || '')

// console.log('Current User:', currentUser.value)
// console.log('Users:', users.value)
// // Watch for current user changes


// Computed
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value.filter(user => user._id !== currentUser.value?._id)
  }
  
  return users.value.filter(user => 
    user._id !== currentUser.value?._id &&
    (user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const currentMessages = computed(() => {
  if (!selectedUser.value) return []
  return chats.value[selectedUser.value._id]?.messages || []
})

// Methods
const selectUser = async (user: User) => {
  selectedUser.value = user
  await loadMessages(user._id)
  markAsRead(user._id)
  scrollToBottom()
  console.log('Selected User ID:', selectedUserId.value);
  return users.value.find(user => user._id === selectedUserId.value) || null;
}

const loadMessages = async (userId: string) => {
  try {
    console.log('Loading messages for userId:', userId)
    messagesLoading.value = true
    
    const response = await $fetch<{ success: boolean, data: Message[] }>(`/api/message/getMessages`, {
      query: {
        userA: currentUserId.value,
        userB: userId
      },
      headers: {
        Authorization: `Bearer ${useCookie('token').value}`
      }
    })
    
    console.log('Messages response:', response)
    
    if (response.success) {
      if (!chats.value[userId]) {
        chats.value[userId] = { messages: [], unreadCount: 0 }
      }
      chats.value[userId].messages = response.data || []
    }
  } catch (error) {
    console.error('Error loading messages:', error)
  } finally {
    messagesLoading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedUser.value || sending.value) return
  
  try {
    sending.value = true
    const messageContent = newMessage.value.trim()
    
    console.log('Sending message:', {
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
    
    console.log('Send message response:', response)
    
    if (response.success) {
      // Add message to local chat
      if (!chats.value[selectedUser.value._id]) {
        chats.value[selectedUser.value._id] = { messages: [], unreadCount: 0 }
      }
      
      chats.value[selectedUser.value._id].messages.push(response.data)
      chats.value[selectedUser.value._id].lastMessage = messageContent
      
      // Emit via socket
      if ($socket.get()) {
        $socket.get().emit('send-message', {
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
    console.error('Error sending message:', error)
    
    // Show user-friendly error message
    if (error.statusCode === 401) {
      console.error('Authentication failed')
      // Redirect to login atau refresh token
    } else if (error.statusCode === 404) {
      console.error('Recipient not found')
    } else {
      console.error('Failed to send message')
    }
  } finally {
    sending.value = false
  }
}

const getLastMessage = (userId: string): string => {
  return chats.value[userId]?.lastMessage || ''
}

const getUnreadCount = (userId: string): number => {
  return chats.value[userId]?.unreadCount || 0
}

const markAsRead = (userId: string) => {
  if (chats.value[userId]) {
    chats.value[userId].unreadCount = 0
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

const refreshUsers = () => {
  fetchUsers()
}

// Socket event handlers
const setupSocketListeners = () => {
  const socket = $socket.get()
  if (!socket) return
  
  // Listen for incoming messages
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
  
  // Listen for typing indicators (optional)
  socket.on('user-typing', (data: { userId: string, isTyping: boolean }) => {
    // Handle typing indicator
    console.log('User typing:', data)
  })
}

const cleanupSocketListeners = () => {
  const socket = $socket.get()
  if (!socket) return
  
  socket.off('receive-message')
  socket.off('user-typing')
}

// Lifecycle
onMounted(() => {
  setupSocketListeners()
  
  // Auto-refresh users periodically
  const interval = setInterval(() => {
    if (!loading.value) {
      fetchUsers()
    }
  }, 30000) // Refresh every 30 seconds
  
  onUnmounted(() => {
    clearInterval(interval)
  })
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
  title: 'Chat',
  layout: 'admin',
  middleware: 'auth',
  meta: [
    { name: 'description', content: 'Chat with users in real-time' },
    { name: 'keywords', content: 'chat, messaging, real-time' }
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
</style>