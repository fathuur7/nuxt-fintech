<template>
  <layoutNavbar />
  <pagesHomeHeroSection />
</template>

<script setup>
// Page meta
definePageMeta({
  middleware: 'auth'
})

// Head configuration
useHead({
  title: 'Dashboard',
  meta: [
    {
      name: 'description',
      content: 'Dashboard page'
    }
  ]
})

const { user, fetchUserData, getUserId, isLoading } = useProfile()
const { $socket } = useNuxtApp()

// Fetch user data on component mount
onMounted(async () => {
  await fetchUserData()
  
  // Set user online after data is fetched
  const userId = getUserId()
  if (userId) {
    console.log('🔄 Initializing socket for user:', userId)
    await $socket.setUserOnline(userId)
  } else {
    console.error('❌ No user ID available for socket connection')
  }
})

// Set user offline when component is unmounted
onUnmounted(() => {
  const userId = getUserId()
  if (userId) {
    $socket.setUserOffline(userId)
  }
})
</script>