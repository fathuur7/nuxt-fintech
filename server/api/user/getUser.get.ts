import { supabase } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    // Get the authorization header
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization required'
      })
    }

    const token = authHeader.substring(7)

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || userProfile?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }
    
    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (usersError) {
      throw usersError
    }
    
    // Transform data for backward compatibility
    const transformedUsers = (users || []).map(user => {
      // Determine status based on is_active and last_seen
      let status = user.status || 'offline'
      
      if (user.last_seen) {
        const timeSinceLastSeen = Date.now() - new Date(user.last_seen).getTime()
        const idleThreshold = 5 * 60 * 1000 // 5 minutes
        
        if (timeSinceLastSeen > idleThreshold && timeSinceLastSeen < 30 * 60 * 1000) {
          status = 'idle'
        } else if (timeSinceLastSeen >= 30 * 60 * 1000) {
          status = 'offline'
        }
      }
      
      return {
        _id: user.id, // For backward compatibility
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        balance: user.balance || 0,
        status: status,
        picture: user.avatar_url || '',
        createdAt: user.created_at,
        updatedAt: user.created_at,
        isActive: user.is_active || false,
        lastSeen: user.last_seen
      }
    })
    
    return {
      success: true,
      data: transformedUsers,
      total: transformedUsers.length
    }
    
  } catch (error) {
    console.error('❌ Error fetching users:', error)
    
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
      data: []
    }
  }
})