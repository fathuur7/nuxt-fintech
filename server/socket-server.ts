import { createServer } from 'http'
import { Server } from 'socket.io'
import { User } from './models/User'
import { connectDB } from './utils/mongoose'

const startSocketServer = async () => {
  await connectDB()
  
  const httpServer = createServer()
  const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  const userMap = new Map<string, string>() // socketId -> userId
  const userSockets = new Map<string, string>() // userId -> socketId
  const disconnectTimeouts = new Map<string, NodeJS.Timeout>() // userId -> timeout

  // Helper function to broadcast status updates with multiple event names
  function broadcastStatusUpdate(userId: string, status: 'online' | 'offline' | 'idle', userData: any) {
    const timestamp = new Date().toISOString()
    
    // Multiple event formats for compatibility
    const eventData = {
      userId,
      status,
      isActive: status === 'online',
      timestamp,
      userName: userData.name
    }

    // Broadcast with different event names for different listeners
    io.emit('status-update', eventData) // Generic
    io.emit('user-status-update', eventData) // For admin dashboard
    
    // Specific status events
    if (status === 'online') {
      io.emit('user-online', eventData)
    } else if (status === 'offline') {
      io.emit('user-offline', eventData)
    } else if (status === 'idle') {
      io.emit('user-idle', eventData)
    }

    console.log(`📡 Broadcasted status update: ${userData.name} is ${status}`)
  }

  io.on('connection', (socket) => {
    console.log('🔌 New connection:', socket.id)

    // Handle user going online/active
    socket.on('user-active', async (userId: string) => {
      try {
        console.log(`🔄 Processing user-active for: ${userId}`)
        
        // Clear any pending disconnect timeout for this user
        if (disconnectTimeouts.has(userId)) {
          clearTimeout(disconnectTimeouts.get(userId)!)
          disconnectTimeouts.delete(userId)
          console.log(`⏰ Cleared disconnect timeout for user: ${userId}`)
        }
        
        // Remove any existing mapping for this user (handle reconnection)
        const existingSocketId = userSockets.get(userId)
        if (existingSocketId) {
          userMap.delete(existingSocketId)
        }
        
        // Set new mappings
        userMap.set(socket.id, userId)
        userSockets.set(userId, socket.id)
        
        // Update database with both isActive and status fields
        const updatedUser = await User.findByIdAndUpdate(
          userId, 
          { 
            isActive: true,
            status: 'online', // Add status field for compatibility
            lastSeen: new Date(),
            updatedAt: new Date()
          },
          { new: true }
        )
        
        if (updatedUser) {
          broadcastStatusUpdate(userId, 'online', updatedUser)
          console.log(`✅ User ${updatedUser.name} (${userId}) is now active`)
        }
      } catch (error) {
        console.error('❌ Error updating user status:', error)
      }
    })

    // Handle user explicitly going offline (logout, close tab)
    socket.on('user-offline', async (userId: string) => {
      console.log(`🔴 User ${userId} explicitly going offline`)
      await setUserOffline(userId, socket.id, 'explicit')
    })

    // Handle beforeunload/page close
    socket.on('user-beforeunload', async (userId: string) => {
      console.log(`📄 User ${userId} closing page/tab`)
      await setUserOffline(userId, socket.id, 'beforeunload')
    })

    // Handle force offline from admin
    socket.on('force-user-offline', async (userId: string) => {
      console.log(`💥 Admin forcing user ${userId} offline`)
      await setUserOffline(userId, socket.id, 'force_offline')
      
      // Send specific event for force offline
      const user = await User.findById(userId)
      if (user) {
        io.emit('user-forced-offline', {
          userId,
          status: 'offline',
          isActive: false,
          timestamp: new Date().toISOString(),
          userName: user.name
        })
      }
    })

    // Handle user going idle
    socket.on('user-idle', async (userId: string) => {
      try {
        console.log(`🟡 User ${userId} going idle`)
        
        const updatedUser = await User.findByIdAndUpdate(
          userId, 
          { 
            status: 'idle',
            lastSeen: new Date(),
            updatedAt: new Date()
          },
          { new: true }
        )
        
        if (updatedUser) {
          broadcastStatusUpdate(userId, 'idle', updatedUser)
          console.log(`🟡 User ${updatedUser.name} (${userId}) is now idle`)
        }
      } catch (error) {
        console.error('❌ Error setting user idle:', error)
      }
    })

    // Handle heartbeat to detect stale connections
    socket.on('heartbeat', async (userId: string) => {
      if (userMap.get(socket.id) === userId) {
        // Update last seen time and ensure user is online
        try {
          await User.findByIdAndUpdate(userId, { 
            lastSeen: new Date(),
            isActive: true,
            status: 'online'
          })
        } catch (error) {
          console.error('Error updating heartbeat:', error)
        }
      }
    })

    // Handle user disconnecting (network issues, browser close, etc.)
    socket.on('disconnect', async (reason) => {
      const userId = userMap.get(socket.id)
      console.log(`🔌 Socket ${socket.id} disconnected. Reason: ${reason}. UserId: ${userId}`)
      
      if (userId) {
        // For certain disconnect reasons, set offline immediately
        if (reason === 'client namespace disconnect' || reason === 'transport close') {
          console.log(`🔴 User ${userId} manually set offline`)
          await setUserOffline(userId, socket.id, 'manual')
        } else {
          // For other reasons, use timeout to handle brief disconnections
          const timeoutId = setTimeout(async () => {
            console.log(`⏰ Timeout reached for user ${userId}, setting offline`)
            await setUserOffline(userId, socket.id, 'timeout')
          }, 5000) // 5 second grace period
          
          disconnectTimeouts.set(userId, timeoutId)
          console.log(`⏰ Set disconnect timeout for user: ${userId}`)
        }
      }
    })
  })

  // Helper function to set user offline
  async function setUserOffline(userId: string, socketId: string, reason: string) {
    try {
      console.log(`🔄 Processing disconnect for: ${userId}`)
      
      // Clear any pending timeout
      if (disconnectTimeouts.has(userId)) {
        clearTimeout(disconnectTimeouts.get(userId)!)
        disconnectTimeouts.delete(userId)
      }
      
      // Update database with both isActive and status fields
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { 
          isActive: false,
          status: 'offline',
          lastSeen: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      )
      
      if (updatedUser) {
        broadcastStatusUpdate(userId, 'offline', updatedUser)
        console.log(`❌ User ${updatedUser.name} (${userId}) is now offline`)
      }
      
      // Clean up mappings
      userMap.delete(socketId)
      userSockets.delete(userId)
      
    } catch (error) {
      console.error('❌ Error setting user offline:', error)
    }
  }

  // Cleanup stale connections every 2 minutes
  setInterval(async () => {
    console.log('🧹 Running stale connection cleanup...')
    const now = new Date()
    const staleThreshold = 5 * 60 * 1000 // 5 minutes
    
    try {
      // Find users who haven't been seen recently but are marked as active
      const staleUsers = await User.find({
        isActive: true,
        lastSeen: { $lt: new Date(now.getTime() - staleThreshold) }
      })
      
      for (const user of staleUsers) {
        console.log(`🧹 Found stale user: ${user.name} (${user._id})`)
        
        // Find their socket if it exists
        const socketId = userSockets.get(user._id.toString())
        if (socketId) {
          await setUserOffline(user._id.toString(), socketId, 'stale_cleanup')
        } else {
          // No socket found, just update database
          await User.findByIdAndUpdate(user._id, {
            isActive: false,
            status: 'offline',
            lastSeen: now,
            updatedAt: now
          })
          
          broadcastStatusUpdate(user._id.toString(), 'offline', user)
        }
      }
      
    } catch (error) {
      console.error('❌ Error during stale connection cleanup:', error)
    }
  }, 2 * 60 * 1000) // Run every 2 minutes

  const PORT = process.env.SOCKET_PORT || 3002
  httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`)
    console.log(`📡 CORS enabled for: http://localhost:3000, http://localhost:3001`)
  })
}

startSocketServer().catch((error) => {
  console.error('❌ Error starting Socket.IO server:', error)
  process.exit(1)
})