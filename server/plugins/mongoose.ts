import { connectDB } from '../utils/mongoose'

export default defineNitroPlugin(async () => {
  await connectDB()
})
