import { H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { User } from '@/server/models/User'
import { connectDB } from './mongoose'

export const getUserFromToken = async (event: H3Event) => {
  await connectDB()

  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret') as { id: string }
    const user = await User.findById(decoded.id).lean()
    return user
  } catch (err) {
    return null
  }
}
