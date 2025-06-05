import { connectDB} from '@/server/utils/mongoose'
import { User } from '@/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const adminUsers = await User.find({ role: 'admin' })

    return {
      success: true,
      data: adminUsers,
    }
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    }))
  }
})
