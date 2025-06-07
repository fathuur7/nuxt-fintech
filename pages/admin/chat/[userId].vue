<template>
  <div class="chat-container">
    <h1 class="text-2xl font-bold mb-4">Chat with User</h1>
    <p class="mb-6">You are now chatting with user: <strong>{{ userId }}</strong></p>
    <nuxt-chat v-if="userId" :userId="userId" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const userId = computed(() => route.params.userId)

if (!userId.value) {
  throw createError({
    statusCode: 400,
    statusMessage: 'User ID is required for chat'
  })
}

definePageMeta({
  title: computed(() => `Chat with User ${userId.value}`),
  layout: 'admin',
  middleware: 'auth'
})
</script>
