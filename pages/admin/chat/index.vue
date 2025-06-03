<template>
  <main class="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
    <!-- Sidebar: Users List -->
    <aside class="w-80 flex-shrink-0 shadow-xl shadow-slate-900/5 bg-white/80 backdrop-blur-sm border-r border-slate-200/60">
      <UsersList />
    </aside>

    <!-- Main Chat Area -->
    <section class="flex-1 flex flex-col min-w-0">
      <!-- Chat Window Component -->
      <ChatWindow 
        :selected-user="selectedUser"
        :current-user="currentUser"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import UsersList from '@/components/pages/Chat/UsersList.vue';
import ChatWindow from '@/components/pages/Chat/chatWindow.vue'; // ← Capitalized to match PascalCase
import { useUsersList } from '@/composables/useUsersList';
import { useProfile } from '@/composables/useProfie'; // ← Fixed typo: was 'useProfie'

// Define page metadata
definePageMeta({
  title: 'Chat Users',
  layout: 'admin',
  middleware: 'auth'
});

// Load data from composables
const {
  selectedUserId,
  users,
  selectUser
} = useUsersList();

const { user, fetchUserData } = useProfile();

// Ensure user data is fetched on mount
onMounted(() => {
  fetchUserData();
});

// Computed: user yang sedang dipilih
const selectedUser = computed(() => {
  console.log('Selected User ID:', selectedUserId.value);
  return users.value.find(user => user._id === selectedUserId.value) || null;
});

// Computed: user yang sedang login (admin)
const currentUser = computed(() => user.value);
console.log('Current User:', currentUser);
</script>

<style scoped>
/* Custom animations for floating elements */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 3s ease-in-out infinite;
  animation-delay: 1.5s;
}

/* Responsive Sidebar Behavior */
@media (max-width: 768px) {
  .w-80 {
    width: 100%;
    position: absolute;
    z-index: 10;
    height: 100%;
  }

  .chat-active .w-80 {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
}
</style>
