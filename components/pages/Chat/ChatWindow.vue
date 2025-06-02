<!-- components/ChatWindow.vue -->
<template>
  <div class="chat-window">
    <div v-if="!selectedUser" class="no-chat">
      <div class="no-chat-content">
        <Icon name="message-circle" size="48" class="text-gray-400" />
        <h3>Select a user to start chatting</h3>
        <p>Choose someone from the users list to begin a conversation</p>
      </div>
    </div>
    
    <div v-else class="chat-container">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="user-info">
          <img :src="selectedUser.picture" :alt="selectedUser.name" class="avatar" />
          <div>
            <h3>{{ selectedUser.name }}</h3>
            <span :class="['status', selectedUser.status]">{{ selectedUser.status }}</span>
          </div>
        </div>
      </div>
      
      <!-- Messages Container -->
      <div ref="messagesContainer" class="messages-container">
        <div v-if="loading" class="loading">Loading messages...</div>
        
        <div v-for="message in messages" :key="message._id" 
             :class="['message', { 'own': message.userId._id === currentUserId }]">
          <div class="message-content">
            <div class="message-text">{{ message.message }}</div>
            <div class="message-meta">
              <span class="time">{{ formatTime(message.createdAt) }}</span>
              <span v-if="message.userId._id === currentUserId" 
                    :class="['status', message.status]">{{ message.status }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Message Input -->
      <div class="message-input">
        <form @submit.prevent="sendNewMessage" class="input-form">
          <input 
            v-model="newMessage"
            type="text"
            placeholder="Type a message..."
            :disabled="sending"
            class="message-field"
          />
          <button type="submit" :disabled="!newMessage.trim() || sending" class="send-btn">
            <Icon name="send" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedUser: Object,
  currentUserId: String
})

const { 
  messages, 
  loading, 
  fetchMessages, 
  sendMessage, 
  markCurrentConversationAsRead 
} = useChat()

const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)

const sendNewMessage = async () => {
  if (!newMessage.value.trim() || !props.currentUserId || !props.selectedUser) return
  
  try {
    sending.value = true
    await sendMessage(props.currentUserId, props.selectedUser._id, newMessage.value.trim())
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Failed to send message:', err)
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
           ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

watch(() => props.selectedUser, async (newUser) => {
  if (newUser && props.currentUserId) {
    await fetchMessages(props.currentUserId, newUser._id)
    await nextTick()
    scrollToBottom()
    await markCurrentConversationAsRead()
  }
}, { immediate: true })

watch(messages, async () => {
  await nextTick()
  scrollToBottom()
})
</script>

<style scoped>
.chat-window {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.no-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-chat-content {
  text-align: center;
  color: #6b7280;
}

.no-chat-content h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.25rem;
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.chat-header .user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.status {
  font-size: 0.75rem;
  text-transform: capitalize;
}

.status.online { color: #10b981; }
.status.offline { color: #6b7280; }
.status.idle { color: #f59e0b; }

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
}

.message {
  margin-bottom: 1rem;
  display: flex;
}

.message.own {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 0.75rem;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.own .message-content {
  background: #3b82f6;
  color: white;
}

.message-text {
  margin-bottom: 0.25rem;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-input {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.input-form {
  display: flex;
  gap: 0.5rem;
}

.message-field {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 1.5rem;
  outline: none;
}

.message-field:focus {
  border-color: #3b82f6;
}

.send-btn {
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}
</style>