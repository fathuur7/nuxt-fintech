<template>
  <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
    <nav class="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div class="flex items-center justify-between px-6 py-3">
        <!-- Logo & Brand -->
        <BrandLogo />

        <!-- Desktop Navigation -->
        <DesktopNavigation />

        <!-- User Profile & Actions -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <NotificationButton />

          <!-- User Profile Dropdown -->
          <UserProfileDropdown
            :user="user"
            :is-loading="isLoading"
            :is-dropdown-open="isDropdownOpen"
            @toggle-dropdown="toggleDropdown"
            @close-dropdown="closeDropdown"
            @logout="handleLogout"
            ref="userProfileRef"
          />

          <!-- Mobile Menu -->
          <MobileNavigation
            :is-mobile-menu-open="isMobileMenuOpen"
            @toggle-mobile-menu="toggleMobileMenu"
            @close-mobile-menu="closeMobileMenu"
          />
        </div>
      </div>

      <!-- Mobile Menu Content (already handled by MobileNavigation component) -->
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useProfile } from '@/composables/useProfie'
import { useDropdown } from '@/composables/useDropdown'

// Components
import BrandLogo from './BrandLogo.vue'
import DesktopNavigation from './DesktopNavigation.vue'
import NotificationButton from './NotificationButton.vue'
import UserProfileDropdown from './UserProfileDropdown.vue'
import MobileNavigation from './MobileNavigation.vue'

// Composables
const { user, isLoading, fetchUserData, logout } = useProfile()
const { 
  isDropdownOpen, 
  isMobileMenuOpen, 
  toggleDropdown, 
  toggleMobileMenu, 
  closeDropdown, 
  closeMobileMenu,
  handleClickOutside 
} = useDropdown()

// Template refs
const userProfileRef = ref()

// Methods
const handleLogout = async () => {
  await logout()
}

// Click outside handler with proper ref
const handleDocumentClick = (event: Event) => {
  const profileDropdownEl = userProfileRef.value?.profileDropdown
  handleClickOutside(event, profileDropdownEl)
}

// Lifecycle hooks
onMounted(() => {
  fetchUserData()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})


</script>

<style scoped>
/* Custom scrollbar for dropdown if needed */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>