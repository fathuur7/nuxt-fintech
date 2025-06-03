<!-- UsersList.vue -->
<template>
  <div class="h-full flex flex-col bg-white border-r border-slate-200">
    <!-- Header Section -->
    <div class="relative bg-black p-6">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-white mb-1">Messages</h3>
            <div class="flex items-center gap-3 text-sm text-white/80">
              <span v-if="lastUpdate" class="font-medium">
                Updated {{ lastUpdate }}
              </span>
              <div class="flex items-center gap-1.5">
                <div 
                  :class="[
                    'w-2 h-2 rounded-full transition-colors duration-300',
                    socketConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400'
                  ]"
                ></div>
                <span class="text-xs font-medium">
                  {{ socketConnected ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            @click="refreshUsers" 
            :disabled="loading" 
            class="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all duration-200 hover:bg-white/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              :class="['w-5 h-5 transition-transform duration-500', { 'animate-spin': loading }]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Decorative elements -->
      <div class="absolute top-4 right-20 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div class="absolute bottom-2 left-10 w-16 h-16 bg-purple-400/20 rounded-full blur-lg"></div>
    </div>
    
    <!-- Search Bar -->
    <div class="px-4 py-4 border-b border-slate-100">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Search conversations..." 
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading && users.length === 0" class="flex-1 flex flex-col items-center justify-center p-8">
      <div class="relative">
        <div class="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div class="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animate-reverse"></div>
      </div>
      <p class="mt-4 text-slate-600 font-medium">Loading conversations...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
      <p class="text-slate-600 mb-6">{{ error }}</p>
      <button 
        @click="refreshUsers" 
        class="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Try Again
      </button>
    </div>
    
    <!-- Users List -->
    <div v-else class="flex-1 overflow-y-auto">
      <div class="p-2 space-y-1">
        <TransitionGroup name="user-list" tag="div" class="space-y-1">
          <div 
            v-for="user in users" 
            :key="user._id"
            @click="selectUser(user)"
            :class="[
              'group relative flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-slate-50',
              {
                'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 shadow-sm': selectedUserId === user._id,
                'hover:shadow-sm hover:scale-[1.02]': selectedUserId !== user._id
              }
            ]"
          >
            <!-- User Avatar -->
            <div class="relative flex-shrink-0 mr-3">
              <div class="relative w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                <img 
                  :src="user.picture" 
                  :alt="`${user.name}'s avatar`"
                  @error="handleImageError"
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              <!-- Status Indicator -->
              <div 
                :class="[
                  'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white transition-all duration-300',
                  {
                    'bg-emerald-500 shadow-lg shadow-emerald-500/30': user.status === 'online',
                    'bg-amber-500 shadow-lg shadow-amber-500/30': user.status === 'idle',
                    'bg-slate-400': user.status === 'offline'
                  }
                ]"
              ></div>
            </div>
            
            <!-- User Information -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h4 class="font-semibold text-slate-900 truncate text-sm">
                  {{ user.name }}
                </h4>
                <span v-if="user.updatedAt" class="text-xs text-slate-500 flex-shrink-0 ml-2">
                  {{ formatTime(user.updatedAt) }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-slate-600 truncate mb-1">{{ user.email }}</p>
                  <div class="flex items-center gap-1.5">
                    <div 
                      :class="[
                        'w-1.5 h-1.5 rounded-full',
                        {
                          'bg-emerald-500': user.status === 'online',
                          'bg-amber-500': user.status === 'idle',
                          'bg-slate-400': user.status === 'offline'
                        }
                      ]"
                    ></div>
                    <span class="text-xs text-slate-500 capitalize font-medium">
                      {{ user.status === 'idle' ? 'Away' : formatStatus(user.status) }}
                    </span>
                  </div>
                </div>
                
                <!-- Unread Messages Badge -->
                <Transition name="badge">
                  <div 
                    v-if="getUnreadCount(user._id) > 0" 
                    class="flex-shrink-0 ml-2 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg shadow-red-500/30"
                  >
                    {{ formatUnreadCount(getUnreadCount(user._id)) }}
                  </div>
                </Transition>
              </div>
            </div>
            
            <!-- Hover Indicator -->
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          </div>
        </TransitionGroup>
      </div>
      
      <!-- Empty State -->
      <div v-if="users.length === 0" class="flex flex-col items-center justify-center p-12 text-center">
        <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">No conversations yet</h3>
        <p class="text-slate-500">Start a new conversation to see it here</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUsersList } from '@/composables/useUsersList'

// Use the composable
const {
  users,
  loading,
  error,
  socketConnected,
  lastUpdate,
  selectedUserId,
  selectUser,
  getUnreadCount,
  refreshUsers
} = useUsersList()

// Helper methods
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    online: 'Online',
    offline: 'Offline',
    idle: 'Away'
  }
  return statusMap[status] || status
}

const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      })
    }
  } catch {
    return ''
  }
}

const formatUnreadCount = (count: number): string => {
  return count > 99 ? '99+' : count.toString()
}

const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement
  img.src = '/default-avatar.png'
}
</script>

<style scoped>
/* Transition Animations */
.user-list-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-list-enter-from {
  opacity: 0;
  transform: translateX(-16px) scale(0.96);
}

.user-list-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(0.96);
}

.badge-enter-active, .badge-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.badge-enter-from, .badge-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Animate reverse for loading spinner */
@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.animate-reverse {
  animation-direction: reverse;
}
</style>

