<template>
  <div class="chat-container p-6">
    <h1 class="text-2xl font-bold mb-4">Chat</h1>
    <p class="mb-6">Select a user to start chatting.</p>

    <div v-if="pending">Loading users...</div>
    <div v-else-if="error">❌ {{ error }}</div>
    <div v-else>
      <ul class="space-y-2">
        <li
          v-for="user in users"
          :key="user._id"
          class="p-3 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
          @click="navigateToChat(user._id)"
        >
          {{ user.name || user.email || user._id }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, error, pending } = await useFetch('/api/user/getAllUser')
const users = data.value?.data || []

const router = useRouter()
function navigateToChat(userId: string) {
  router.push(`/chat/${userId}`)
}

definePageMeta({
  title: 'Chat',
  layout: 'admin',
  middleware: 'auth',
  meta: [
    { name: 'description', content: 'Chat with users in real-time' },
    { name: 'keywords', content: 'chat, messaging, real-time' }
  ]
})
</script>
