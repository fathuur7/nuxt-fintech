<!-- pages/auth/callback.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div class="text-center">
      <div class="relative">
        <div class="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
        <div class="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-purple-500 rounded-full animate-spin mx-auto" style="animation-delay: -0.15s;"></div>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2">Processing Login...</h2>
      <p class="text-gray-300">Please wait while we complete your authentication.</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const { supabase } = useSupabase()
const { updateUserProfile } = useSupabaseProfile()

onMounted(async () => {
  try {
    // Handle the auth callback
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth callback error:', error)
      await navigateTo('/auth/login?error=callback_failed')
      return
    }

    if (data.session?.user) {
      const user = data.session.user
      console.log('User authenticated:', user.email)

      // Update or create user profile in our users table
      try {
        await updateUserProfile({
          email: user.email!,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          avatar_url: user.user_metadata?.avatar_url,
          status: 'online',
          is_active: true
        })
      } catch (profileError) {
        console.warn('Error updating profile:', profileError)
        // Continue anyway, profile might already exist
      }

      // Determine redirect based on user role
      // You can check user role from user metadata or database
      const userRole = user.user_metadata?.role || 'user'
      
      if (userRole === 'admin') {
        await navigateTo('/admin')
      } else {
        await navigateTo('/dashboard')
      }
    } else {
      console.log('No session found, redirecting to login')
      await navigateTo('/auth/login')
    }
  } catch (error) {
    console.error('Callback processing error:', error)
    await navigateTo('/auth/login?error=processing_failed')
  }
})
</script>