<template>
  <div>
    <!-- Mobile Menu Button -->
    <button 
      @click="toggleMobileMenu"
      class="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-show="isMobileMenuOpen" class="md:hidden border-t border-gray-200/50 px-6 py-4 space-y-3">
        <NuxtLink 
          v-for="link in navigationLinks"
          :key="link.path"
          :to="link.path" 
          class="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
          @click="closeMobileMenu"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useNavigation } from '~/composables/useNavigation'

// Props
interface Props {
  isMobileMenuOpen: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  toggleMobileMenu: []
  closeMobileMenu: []
}>()

// Composables
const { navigationLinks } = useNavigation()

// Methods
const toggleMobileMenu = () => {
  emit('toggleMobileMenu')
}

const closeMobileMenu = () => {
  emit('closeMobileMenu')
}
</script>