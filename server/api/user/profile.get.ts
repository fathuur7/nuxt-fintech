// server/api/user/profile.get.ts
import jwt from 'jsonwebtoken'
import { connectDB } from '@/server/utils/mongoose'
import { User } from '@/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Get token from cookie or Authorization header
    let token = getCookie(event, 'token')
    
    if (!token) {
      const authHeader = getHeader(event, 'authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token tidak ditemukan'
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret) as any
    
    if (!decoded || !decoded.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token tidak valid'
      })
    }

    // Connect to database
    await connectDB()

    // Find user by ID
    const user = await User.findById(decoded.id).select('-__v')
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User tidak ditemukan'
      })
    }

    // Return user data
    return {
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        balance: user.balance || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }

  } catch (error: any) {
    console.error('Profile API Error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token tidak valid'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token sudah kadaluarsa'
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error'
    })
  }
})