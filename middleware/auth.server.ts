// middleware/auth.server.ts
import jwt from 'jsonwebtoken'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on server-side
  if (process.client) return

  const config = useRuntimeConfig()
  const event = useRequestEvent()
  
  if (!event) return

  // Get token from httpOnly cookie
  const token = getCookie(event, 'token')
  console.log('Server Auth Middleware:', { token })

  if (!token && to.path !== '/auth/login') {
    console.log('No token, redirecting to login')
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret)
      console.log('Token verified:', decoded)
      
      // You can add user info to nuxt context here if needed
      // event.context.user = decoded
    } catch (error) {
      console.log('Invalid token, clearing cookie')
      // Clear invalid token
      deleteCookie(event, 'token')
      
      if (to.path !== '/auth/login') {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid token'
        })
      }
    }
  }
})