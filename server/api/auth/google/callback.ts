import jwt from 'jsonwebtoken'
import { connectDB } from '../../../utils/mongoose'
import { User } from '../../../models/User'
import { UserType } from '../../../types/UserType'

export default defineEventHandler(async (event) => {
  const code = getQuery(event).code as string
  const config = useRuntimeConfig()
  const arrayEmailAdmin = config.arrayEmailAdmin || []

  try {
    // 1. Exchange code to token
    const tokenRes = await $fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: {
        code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.googleRedirectUri,
        grant_type: 'authorization_code'
      }
    })

    const accessToken = (tokenRes as any).access_token

    // 2. Get user info from Google
    const userInfo = await $fetch<UserType>('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    // 3. Connect to DB
    await connectDB()

    // 4. Check if user is admin based on email
    const isAdmin = arrayEmailAdmin.includes(userInfo.email.toLowerCase())
    // update role based on email in database
    
    
    // 5. Find or Create user
    let user = await User.findOne({ email: userInfo.email })
    if (!user) {
      user = await User.create({
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        role: isAdmin ? 'admin' : 'user'
      })
    }
    
    await User.updateOne({ email: userInfo.email }, { role: isAdmin ? 'admin' : 'user' })

    // 6. Generate JWT with role information
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '1h' }
    )

    // 7. Set Cookie with proper configuration
    setCookie(event, 'token', token, {
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
    })

    // 8. Role-based redirect to different domains/subdomains
    let redirectUrl: string
    if (isAdmin) {
      redirectUrl = process.env.NODE_ENV === 'production'
        ? 'https://admin.yourdomain.com/dashboard'
        : 'http://localhost:3001/admin'
    } else {
      redirectUrl = process.env.NODE_ENV === 'production'
        ? 'https://app.yourdomain.com/dashboard'
        : 'http://localhost:3000/dashboard'
    }

    return sendRedirect(event, redirectUrl)

  } catch (error) {
    console.error('OAuth Error:', error)

    // Redirect to error page or login with error message
    const errorUrl = process.env.NODE_ENV === 'production'
      ? 'https://yourdomain.com/login?error=oauth_failed'
      : 'http://localhost:3000/login?error=oauth_failed'

    return sendRedirect(event, errorUrl)
  }
})
