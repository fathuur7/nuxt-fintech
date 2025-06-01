<template>
  <div class="relative" ref="profileDropdown">
    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="flex items-center space-x-3 p-2">
      <div class="relative">
        <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
      <div class="hidden sm:block space-y-1">
        <div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div class="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
      <div class="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>

    <!-- Actual User Profile -->
    <button 
      v-else
      @click="toggleDropdown"
      class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
    >
      <div class="relative">
        <img 
          :src="userPicture" 
          :alt="user?.name"
          class="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
          @error="handleImageError"
        />
        <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div class="hidden sm:block text-left">
        <p class="text-sm font-medium text-gray-900">{{ user?.name || 'User' }}</p>
        <p class="text-xs text-gray-500">{{ formattedBalance }}</p>
      </div>
      <svg 
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isDropdownOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-show="isDropdownOpen && !isLoading"
        class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
      >
        <div class="px-4 py-3 border-b border-gray-100">
          <div class="flex items-center space-x-3">
            <img 
              :src="userPicture" 
              :alt="user?.name || 'User'"
              class="w-10 h-10 rounded-full object-cover"
              @error="handleImageError"
              loading="lazy"
            />
            <div>
              <p class="font-medium text-gray-900">{{ user?.name }}</p>
              <p class="text-sm text-gray-500">{{ user?.email }}</p>
            </div>
          </div>
        </div>

        <div class="py-2">
          <NuxtLink 
            to="/profile" 
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            @click="closeDropdown"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Profile Saya
          </NuxtLink>
    
          <button 
            @click="handleLogout"
            class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Keluar
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfile } from '~/composables/useProfie'
import { useAvatar } from '~/composables/useAvatar'
import { useFormatter } from '~/composables/useFormatter'

// Props
interface Props {
  user: any
  isLoading: boolean
  isDropdownOpen: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  toggleDropdown: []
  closeDropdown: []
  logout: []
}>()

// Composables
const { logout } = useProfile()
const { formatBalance } = useFormatter()

// Template ref
const profileDropdown = ref<HTMLElement>()

// Computed
const { getUserPicture } = useAvatar()
const userPicture = computed(() => getUserPicture(props.user))

// Fix: Accept only one argument for image error handler
const handleImageError = (event: Event) => {
  // Optionally, you can provide a fallback image here
  const target = event.target as HTMLImageElement
  target.src = '/default-avatar.png'
}

const formattedBalance = computed(() => 
  formatBalance(props.user?.balance || 0)
)

// Methods
const toggleDropdown = () => {
  if (props.isLoading) return
  emit('toggleDropdown')
}

const closeDropdown = () => {
  emit('closeDropdown')
}

const handleLogout = async () => {
  emit('logout')
}

// Expose ref for parent component
defineExpose({
  profileDropdown
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>