import mongoose from 'mongoose'

let isConnected = false

export const connectDB = async () => {
  const config = useRuntimeConfig()
  const MONGODB_URI = config.mongoUri || ''

  console.log('🔍 Connecting to:', MONGODB_URI)

  if (isConnected || !MONGODB_URI) return

  try {
    await mongoose.connect(MONGODB_URI)
    isConnected = true
    console.log('✅ MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
  }
}
