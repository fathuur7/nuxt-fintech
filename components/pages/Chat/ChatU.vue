
<!-- pages/chat.vue -->
<template>
  <div class="chat-page">
    <div class="chat-layout">
      <div class="sidebar">
        <UsersList @user-selected="handleUserSelected" />
      </div>
      
      <div class="main-chat">
        <ChatWindow 
          :selected-user="selectedUser" 
          :current-user-id="currentUser?._id" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// Assuming you have authentication/session management
import {useChat } from '@/composables/useChat'
const { $auth } = useNuxtApp() // or however you manage auth
const currentUser = ref($auth?.user || null)

const selectedUser = ref(null)
const { setCurrentUser, fetchConversations } = useChat()

const handleUserSelected = (user) => {
  selectedUser.value = user
}

onMounted(async () => {
  if (currentUser.value) {
    setCurrentUser(currentUser.value._id)
    await fetchConversations(currentUser.value._id)
  }
})

// Set page title
useHead({
  title: 'Chat'
})
</script>

<style scoped>
.chat-page {
  height: 100vh;
  background: #f3f4f6;
}

.chat-layout {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e5e7eb;
}

.main-chat {
  flex: 1;
  background: white;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: absolute;
    z-index: 10;
    height: 100%;
  }
  
  .main-chat {
    width: 100%;
  }
}
</style>