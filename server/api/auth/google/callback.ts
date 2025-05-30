import jwt from 'jsonwebtoken'
import { connectDB } from '../../../utils/mongoose'
import { User } from '../../../models/User'
import {UserType} from '../../../types/UserType'

export default defineEventHandler(async (event) => {
  const code = getQuery(event).code as string
  const config = useRuntimeConfig()

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

  console.log('Token Response:', tokenRes)

  const accessToken = (tokenRes as any).access_token

  // 2. Get user info
  const userInfo = await $fetch<UserType>('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  

  console.log('User Info:', userInfo)

  // 3. Connect to DB
  await connectDB()
  console.log('✅ MongoDB connected')

  // 4. Find or Create user
  let user = await User.findOne({ email: userInfo.email })
  if (!user) {
    user = await User.create({
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture
    })
  }

  // 5. Generate JWT
  const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
    expiresIn: '1h'
  })

  // 6. Set Cookie
  // In your OAuth callback
  setCookie(event, 'token', token, {
    httpOnly: false, // Allow client-side access
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60
  })


  return sendRedirect(event, '/dashboard')
})
