import mongoose from 'mongoose'
import { getConfig } from './config'

export const connectDB = async () => {
  try {
    const config = getConfig()
    if (!config.mongodbUri) {
      throw new Error('MongoDB URI is not defined in configuration')
    }
    await mongoose.connect(config.mongodbUri)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}