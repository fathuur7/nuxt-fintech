import { connectDB } from '../utils/mongoose'
import { debugEnv }  from '../utils/debugEnv'
 
export default defineNitroPlugin(async () => {
  await connectDB()
   debugEnv()
})
