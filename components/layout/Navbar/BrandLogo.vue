<template>
  <div class="flex items-center space-x-3">
    <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
    <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      {{ brandName }}
    </span>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  brandName?: string
}

const props = withDefaults(defineProps<Props>(), {
  brandName: 'FinTech'
})
</script>