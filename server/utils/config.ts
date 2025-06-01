import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export const getConfig = () => {
  return {
    mongodbUri: process.env.MONGODB_URI,
    socketPort: '3002',
    // Add other config values as needed
  }
}