import jwt from 'jsonwebtoken'
import { User } from '@/server/models/User'
import { connectDB } from '@/server/utils/mongoose'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'token')

    if (!token) throw new Error('Unauthorized')

    const decoded = jwt.verify(token, config.jwtSecret) as any

    if (decoded.role !== 'admin') throw new Error('Forbidden')

    await connectDB()
    
    // Fetch all users
    const users = await User.find({}).lean()
    
    // Transform data to ensure consistency between isActive and status fields
    const transformedUsers = await Promise.all(users.map(async user => {
      // Determine status based on isActive and other factors
      let status = 'offline'
      
      if (user.isActive) {
        // Check if user has a specific status field, otherwise default to 'online'
        status = user.status || 'online'
      } else {
        status = 'offline'
      }
      
      // Check if user should be considered idle based on lastSeen
      if (user.isActive && user.lastSeen) {
        const timeSinceLastSeen = Date.now() - new Date(user.lastSeen).getTime()
        const idleThreshold = 5 * 60 * 1000 // 5 minutes
        
        if (timeSinceLastSeen > idleThreshold && timeSinceLastSeen < 30 * 60 * 1000) { // Less than 30 minutes
          status = 'idle'
        } else if (timeSinceLastSeen >= 30 * 60 * 1000) { // More than 30 minutes
          status = 'offline'
          // Update database to reflect true offline status
          await User.findByIdAndUpdate(user._id, { 
            isActive: false, 
            status: 'offline' 
          })
        }
      }
      
      return {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        balance: user.balance || 0,
        status: status,
        picture: user.picture || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || user.lastSeen || user.createdAt,
        isActive: user.isActive || false,
        lastSeen: user.lastSeen
      }
    }))
    
    return {
      success: true,
      data: transformedUsers,
      total: transformedUsers.length
    }
    
  } catch (error) {
    console.error('❌ Error fetching users:', error)
    
    return {
      success: false,
      error: 'Failed to fetch users',
      data: []
    }
  }
})