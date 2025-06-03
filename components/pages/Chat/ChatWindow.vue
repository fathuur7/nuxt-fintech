<template>
  <div class="flex-1 flex flex-col h-full bg-white">
    <!-- Chat Header -->
    <div v-if="selectedUser" class="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-b border-slate-200 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <img 
              :src="selectedUser.picture" 
              :alt="`${selectedUser.name}'s avatar`"
              @error="handleImageError"
              class="w-10 h-10 rounded-full border-2 border-white/20"
            />
            <div 
              :class="[
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                {
                  'bg-emerald-500': selectedUser.status === 'online',
                  'bg-amber-500': selectedUser.status === 'idle',
                  'bg-slate-400': selectedUser.status === 'offline'
                }
              ]"
            ></div>
          </div>
          <div>
            <h3 class="font-semibold text-white">{{ selectedUser.name }}</h3>
            <p class="text-xs text-white/70 capitalize">
              {{ selectedUser.status === 'idle' ? 'Away' : selectedUser.status }}
            </p>
          </div>
        </div>
        
        <!-- Chat Actions -->
        <div class="flex items-center space-x-2">
          <button 
            @click="refreshChat"
            :disabled="loading"
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
          >
            <svg :class="['w-4 h-4', { 'animate-spin': loading }]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!selectedUser" class="flex-1 flex flex-col items-center justify-center p-8">
      <div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
        <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2h-6m0-4h4m0 0v-4m-4 4v4m0-4h-4" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-slate-900 mb-2">Select a conversation</h3>
      <p class="text-slate-500 text-center max-w-sm">Choose a user from the sidebar to start chatting or continue an existing conversation.</p>
    </div>

    <!-- Chat Content -->
    <div v-else class="flex-1 flex flex-col overflow-hidden">
      <!-- Messages Area -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Loading State -->
        <div v-if="loading && messages.length === 0" class="flex justify-center py-8">
          <div class="flex items-center space-x-2 text-slate-500">
            <div class="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
            <span class="text-sm">Loading messages...</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex justify-center py-8">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <div class="flex items-center space-x-2 text-red-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span class="text-sm font-medium">{{ error }}</span>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <TransitionGroup v-else name="message" tag="div" class="space-y-4">
          <div 
            v-for="message in messages" 
            :key="message._id"
            :class="[
              'flex',
              isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'
            ]"
          >
            <div 
              :class="[
                'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm',
                isCurrentUserMessage(message) 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md' 
                  : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'
              ]"
            >
              <p class="text-sm leading-relaxed">{{ message.message }}</p>
              <div 
                :class="[
                  'flex items-center justify-between mt-2 text-xs',
                  isCurrentUserMessage(message) ? 'text-white/70' : 'text-slate-500'
                ]"
              >
                <span>{{ formatMessageTime(message.createdAt) }}</span>
                <div v-if="isCurrentUserMessage(message)" class="flex items-center space-x-1">
                  <!-- Message Status -->
                  <svg 
                    v-if="message.status === 'read'" 
                    class="w-3 h-3 text-emerald-300" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <svg 
                    v-else-if="message.status === 'delivered'" 
                    class="w-3 h-3 text-white/50" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <svg 
                    v-else 
                    class="w-3 h-3 text-white/30" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Empty Messages State -->
        <div v-if="!loading && !error && messages.length === 0" class="flex flex-col items-center justify-center py-12">
          <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 class="text-lg font-medium text-slate-900 mb-2">No messages yet</h4>
          <p class="text-slate-500 text-center">Start the conversation by sending a message below.</p>
        </div>
      </div>

      <!-- Message Input -->
      <div class="border-t border-slate-200 p-4 bg-slate-50/50">
        <form @submit.prevent="handleSendMessage" class="flex items-end space-x-3">
          <div class="flex-1">
            <div class="relative">
              <textarea
                v-model="newMessage"
                ref="messageInput"
                placeholder="Type your message..."
                rows="1"
                class="w-full px-4 py-3 pr-12 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
                @keydown.enter="handleKeyDown"
                @input="autoResize"
                :disabled="sendingMessage"
              ></textarea>
              
              <!-- Character Count -->
              <div v-if="newMessage.length > 0" class="absolute bottom-2 right-3 text-xs text-slate-400">
                {{ newMessage.length }}/1000
              </div>
            </div>
          </div>
          
          <button 
            type="submit"
            :disabled="!newMessage.trim() || sendingMessage || newMessage.length > 1000"
            class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <svg v-if="!sendingMessage" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useChat } from '@/composables/useChat'

interface User {
  _id: string
  name: string
  email: string
  picture: string
  status: 'online' | 'offline' | 'idle'
}

interface Props {
  selectedUser: User | null
  currentUser: { _id: string } | null
}

const props = defineProps<Props>()

// Chat composable
const {
  messages,
  loading,
  error,
  fetchMessages,
  sendMessage,
  setCurrentUser,
  setSelectedUser,
  markCurrentConversationAsRead
} = useChat()

// Reactive data
const newMessage = ref('')
const sendingMessage = ref(false)
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()

// Computed
const isCurrentUserMessage = (message: any) => {
  return message.userId._id === props.currentUser?._id
}

// Methods
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !props.currentUser || !props.selectedUser || sendingMessage.value) {
    return
  }

  try {
    sendingMessage.value = true
    await sendMessage(
      props.currentUser._id,
      props.selectedUser._id,
      newMessage.value.trim()
    )
    newMessage.value = ''
    autoResize()
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Error sending message:', err)
  } finally {
    sendingMessage.value = false
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

const autoResize = () => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = Math.min(messageInput.value.scrollHeight, 120) + 'px'
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const refreshChat = async () => {
  if (props.currentUser && props.selectedUser) {
    await fetchMessages(props.currentUser._id, props.selectedUser._id)
    await nextTick()
    scrollToBottom()
  }
}

const formatMessageTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  } catch {
    return ''
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-avatar.png'
}
watch(() => props.selectedUser, async (newUser) => {
  if (props.currentUser && newUser) {
    setCurrentUser(props.currentUser._id)
    setSelectedUser(newUser._id)
    console.log('Selected User:', newUser)
    console.log('Current User:', props.currentUser)
    
    await fetchMessages(props.currentUser._id, newUser._id)
    await markCurrentConversationAsRead()
    await nextTick()
    scrollToBottom()
  }
})

// Watchers
watch(() => props.selectedUser, async (newUser) => {
  if (newUser && props.currentUser) {
    setSelectedUser(newUser._id)
    await fetchMessages(props.currentUser._id, newUser._id)
    await markCurrentConversationAsRead()
    await nextTick()
    scrollToBottom()
  }
}, { immediate: true })

watch(() => props.currentUser, (newUser) => {
  if (newUser) {
    setCurrentUser(newUser._id)
  }
}, { immediate: true })

// Auto-scroll when new messages arrive
watch(() => messages.value.length, async () => {
  await nextTick()
  scrollToBottom()
})

// Lifecycle
onMounted(() => {
  if (props.currentUser) {
    setCurrentUser(props.currentUser._id)
  }
})
</script>

<style scoped>
/* Message transitions */
.message-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>