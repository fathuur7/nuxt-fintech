<template>
  <div class="users-list">
    <div class="header">
      <h3>Users</h3>
      <button @click="fetchUsers" :disabled="loading" class="refresh-btn">
        <Icon name="refresh" :class="{ 'animate-spin': loading }" />
      </button>
    </div>
    
    <div v-if="loading && users.length === 0" class="loading">
      Loading users...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="users-container">
      <div 
        v-for="user in users" 
        :key="user._id"
        @click="selectUser(user)"
        :class="['user-item', { 
          'active': selectedUserId === user._id,
          'online': user.status === 'online'
        }]"
      >
        <div class="user-avatar">
          <img :src="user.picture" :alt="user.name" />
          <div :class="['status-indicator', user.status]"></div>
        </div>
        
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-email">{{ user.email }}</div>
          <div class="user-status">{{ user.status }}</div>
        </div>
        
        <div v-if="getUnreadCount(user._id) > 0" class="unread-badge">
          {{ getUnreadCount(user._id) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '@/composables/useProfie'
import {useChat } from '@/composables/useChat'
const { users, loading, error, getAllUsers } = useProfile()
const { setSelectedUser, selectedUserId, getUnreadCount } = useChat()

const emit = defineEmits(['userSelected'])

const selectUser = (user) => {
  setSelectedUser(user._id)
  emit('userSelected', user)
}

onMounted(() => {
  getAllUsers()
})
</script>

<style scoped>
.users-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.refresh-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  background: #f3f4f6;
}

.refresh-btn:hover {
  background: #e5e7eb;
}

.users-container {
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
  position: relative;
}

.user-item:hover {
  background: #f9fafb;
}

.user-item.active {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
}

.user-avatar {
  position: relative;
  margin-right: 0.75rem;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  right: 0;
  border: 2px solid white;
}

.status-indicator.online {
  background: #10b981;
}

.status-indicator.offline {
  background: #6b7280;
}

.status-indicator.idle {
  background: #f59e0b;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.user-status {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: capitalize;
}

.unread-badge {
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.loading, .error {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
}

.error {
  color: #ef4444;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>



