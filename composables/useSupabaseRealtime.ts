import type { RealtimeChannel } from '@supabase/supabase-js'

export const useSupabaseRealtime = () => {
  const { supabase } = useSupabase()
  const { getCurrentUserId } = useSupabaseAuth()
  
  const channels = ref<Map<string, RealtimeChannel>>(new Map())
  const isConnected = ref(false)

  // Subscribe to user status changes
  const subscribeToUserStatus = (callback: (payload: any) => void) => {
    const channelName = 'user_status_changes'
    
    if (channels.value.has(channelName)) {
      return channels.value.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('User status changed:', payload)
          callback(payload)
        }
      )
      .subscribe((status) => {
        console.log('User status subscription status:', status)
        isConnected.value = status === 'SUBSCRIBED'
      })

    channels.value.set(channelName, channel)
    return channel
  }

  // Subscribe to messages for a specific conversation
  const subscribeToConversation = (otherUserId: string, callback: (payload: any) => void) => {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) return null

    const channelName = `conversation_${[currentUserId, otherUserId].sort().join('_')}`
    
    if (channels.value.has(channelName)) {
      return channels.value.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId}))`
        },
        (payload) => {
          console.log('New message received:', payload)
          callback(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId}))`
        },
        (payload) => {
          console.log('Message updated:', payload)
          callback(payload)
        }
      )
      .subscribe((status) => {
        console.log('Conversation subscription status:', status)
        isConnected.value = status === 'SUBSCRIBED'
      })

    channels.value.set(channelName, channel)
    return channel
  }

  // Subscribe to savings account changes
  const subscribeToSavingsAccount = (accountId: string, callback: (payload: any) => void) => {
    const channelName = `savings_account_${accountId}`
    
    if (channels.value.has(channelName)) {
      return channels.value.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'savings_accounts',
          filter: `id=eq.${accountId}`
        },
        (payload) => {
          console.log('Savings account updated:', payload)
          callback(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'savings_transactions',
          filter: `account_id=eq.${accountId}`
        },
        (payload) => {
          console.log('New savings transaction:', payload)
          callback(payload)
        }
      )
      .subscribe((status) => {
        console.log('Savings account subscription status:', status)
        isConnected.value = status === 'SUBSCRIBED'
      })

    channels.value.set(channelName, channel)
    return channel
  }

  // Subscribe to user's own data changes
  const subscribeToUserData = (callback: (payload: any) => void) => {
    const userId = getCurrentUserId()
    if (!userId) return null

    const channelName = `user_data_${userId}`
    
    if (channels.value.has(channelName)) {
      return channels.value.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('User data updated:', payload)
          callback(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New transaction:', payload)
          callback(payload)
        }
      )
      .subscribe((status) => {
        console.log('User data subscription status:', status)
        isConnected.value = status === 'SUBSCRIBED'
      })

    channels.value.set(channelName, channel)
    return channel
  }

  // Unsubscribe from a specific channel
  const unsubscribeFromChannel = (channelName: string) => {
    const channel = channels.value.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      channels.value.delete(channelName)
      console.log(`Unsubscribed from channel: ${channelName}`)
    }
  }

  // Unsubscribe from all channels
  const unsubscribeFromAll = () => {
    channels.value.forEach((channel, channelName) => {
      supabase.removeChannel(channel)
      console.log(`Unsubscribed from channel: ${channelName}`)
    })
    channels.value.clear()
    isConnected.value = false
  }

  // Send presence updates
  const updatePresence = async (status: 'online' | 'offline' | 'idle') => {
    const userId = getCurrentUserId()
    if (!userId) return

    const channel = supabase.channel('presence')
    
    await channel.track({
      user_id: userId,
      status,
      last_seen: new Date().toISOString()
    })

    return channel
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribeFromAll()
  })

  return {
    isConnected: readonly(isConnected),
    subscribeToUserStatus,
    subscribeToConversation,
    subscribeToSavingsAccount,
    subscribeToUserData,
    unsubscribeFromChannel,
    unsubscribeFromAll,
    updatePresence
  }
}