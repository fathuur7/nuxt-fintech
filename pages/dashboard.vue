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
const { updatePresence } = useSupabaseRealtime()

// Fetch user data on component mount
onMounted(async () => {
  await fetchUserData()
  
  // Set user online in presence after data is fetched
  const userId = getUserId()
  if (userId) {
    console.log('🔄 Setting user online in presence:', userId)
    await updatePresence('online')
  } else {
    console.error('❌ No user ID available for presence')
  }
})

// Set user offline in presence when component is unmounted
onUnmounted(() => {
  updatePresence('offline').catch(console.error)
})
</script>