import { supabase } from '~/lib/supabase'
import type { Database } from '~/lib/supabase'

export const useSupabase = () => {
  return {
    supabase,
    auth: supabase.auth,
    from: supabase.from.bind(supabase),
    rpc: supabase.rpc.bind(supabase),
    storage: supabase.storage,
    realtime: supabase.realtime,
    channel: supabase.channel.bind(supabase)
  }
}

// Helper composable for authenticated operations
export const useSupabaseAuth = () => {
  const { supabase } = useSupabase()
  
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)

  const getSession = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user || null
      return currentSession
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
    
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
    
    user.value = null
    session.value = null
  }

  const getCurrentUser = () => {
    return user.value
  }

  const getCurrentUserId = () => {
    return user.value?.id || null
  }

  // Listen for auth state changes
  const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
    session.value = currentSession
    user.value = currentSession?.user || null
    
    if (event === 'SIGNED_IN') {
      console.log('User signed in:', user.value?.email)
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out')
    }
  })

  onUnmounted(() => {
    authListener?.subscription?.unsubscribe()
  })

  return {
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    getSession,
    signInWithGoogle,
    signOut,
    getCurrentUser,
    getCurrentUserId
  }
}