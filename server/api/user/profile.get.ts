import { supabase } from '~/lib/supabase'
export default defineEventHandler(async (event) => {
  try {
    // Get the authorization header
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
    }
    const token = authHeader.substring(7)
    // Verify the JWT token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }
    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    if (profileError) {
      // If user profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          avatar_url: user.user_metadata?.avatar_url
        })
        .select()
        .single()
      if (createError) {
        throw createError
      }
      return {
        success: true,
        data: newProfile
      }
    }
    // Return user profile data
    return {
      success: true,
      data: {
        _id: userProfile.id, // For backward compatibility
        id: userProfile.id,
        name: userProfile.username,
        email: userProfile.email,
        picture: userProfile.avatar_url,
        role: userProfile.role,
        isActive: userProfile.is_active,
        balance: userProfile.balance || 0,
        status: userProfile.status,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.created_at
      }
    }
  } catch (error: any) {
    console.error('Profile API Error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})