<template>
  <div class="chat-container">
    <h1 class="text-2xl font-bold mb-4">Chat with admin</h1>
    <p class="mb-6">This is the chat page where you can interact with the admin in real-time.</p>
    <nuxt-chat v-if="userId" :userId="userId" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = computed(() => route.params.userId)

if (!userId.value) {
  throw createError({
    statusCode: 400,
    statusMessage: 'User ID is required for chat page'
  })
}

// SEO + middleware
definePageMeta({
  title: computed(() => `Chat with Admin ${userId.value}`),
  layout: 'admin',
  middleware: 'auth'
})
</script>
