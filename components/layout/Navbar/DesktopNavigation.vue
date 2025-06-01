<template>
  <div class="hidden md:flex items-center space-x-8">
    <NuxtLink 
      v-for="link in navigationLinks"
      :key="link.path"
      :to="link.path" 
      class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
    >
      {{ link.label }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useNavigation } from '~/composables/useNavigation'

// Composables
const { navigationLinks } = useNavigation()
</script>