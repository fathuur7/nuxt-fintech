<template>
  <main class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar: Users List -->
    <aside class="w-1/4 border-r border-gray-200 bg-white overflow-y-auto">
      <UsersList />
    </aside>

    <!-- Main Chat Window -->
    <section class="flex-1 flex flex-col bg-white">
      <ChatWindow />
    </section>

    <!-- Chat User Detail Panel -->
    <aside class="w-1/4 border-l border-gray-200 bg-gray-100 overflow-y-auto hidden lg:block">
      <ChatU />
    </aside>
  </main>
</template>

<script setup lang="ts">
import ChatWindow from '@/components/pages/Chat/ChatWindow.vue';
import UsersList from '@/components/pages/Chat/UsersList.vue';
import ChatU from '@/components/pages/Chat/ChatU.vue';

definePageMeta({
  title: 'Chat Users',
  layout: 'admin',
  middleware: 'auth',
});
</script>
