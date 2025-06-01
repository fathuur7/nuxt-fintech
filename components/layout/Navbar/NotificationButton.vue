<template>
  <button class="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19v-7a8 8 0 1116 0v7a2 2 0 01-2 2H6a2 2 0 01-2-2z"/>
    </svg>
    <span 
      v-if="hasNotifications" 
      class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
    ></span>
  </button>
</template>

<script setup lang="ts">
// Props
interface Props {
  hasNotifications?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasNotifications: true
})
</script>