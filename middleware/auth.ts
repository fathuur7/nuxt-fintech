export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, session, getSession } = useSupabaseAuth()
  
  // Get current session if not already loaded
  if (!session.value) {
    await getSession()
  }

  // If not authenticated, redirect to login
  if (!session.value || !user.value) {
    return navigateTo('/auth/login')
  }

  // Check admin routes
  if (to.path.startsWith('/admin')) {
    // Get user profile to check role
    const { fetchUserProfile } = useSupabaseProfile()
    const userProfile = await fetchUserProfile(user.value.id)
    
    if (!userProfile || userProfile.role !== 'admin') {
      console.log('User role:', userProfile?.role)
      return navigateTo('/') // redirect to home if not admin
    }
  }
})