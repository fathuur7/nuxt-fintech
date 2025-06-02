import { User } from '../../models/User'
import { connectDB } from '@/server/utils/mongoose'

export default defineEventHandler(async (event) => {
    // take all users from database
    try {
        await connectDB()
        const users = await User.find({}).lean()
        return {
            success: true,
            data: users
        }
    } catch (error) {
        console.error('❌ Error fetching users:', error)
        return {
            success: false,
            error: 'Failed to fetch users'
        }
    }
})

// api/user/getAllUser.get.ts