import { Message } from '@/server/models/Message'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { senderId, receiverId, content, messageType = 'text', attachmentUrl, attachmentType, attachmentSize } = body

    if (!senderId || !receiverId || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'senderId, receiverId, and content are required'
      })
    }

    const messageData: any = {
      senderId,
      receiverId,
      content,
      messageType,
      status: 'sent'
    }

    if (attachmentUrl) {
      messageData.attachmentUrl = attachmentUrl
      messageData.attachmentType = attachmentType
      messageData.attachmentSize = attachmentSize
    }

    const message = new Message(messageData)
    await message.save()

    await message.populate('senderId', 'name email avatar')
    await message.populate('receiverId', 'name email avatar')

    // Emit real-time event
    const io = event.context.io
    if (io) {
      // Send to specific user room
      io.to(`user_${receiverId}`).emit('new_message', {
        message,
        senderId
      })
      
      // Send to conversation room
      io.to(`conversation_${[senderId, receiverId].sort().join('_')}`).emit('message_sent', message)
    }

    return {
      success: true,
      data: message
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : 'Internal Server Error'
    })
  }
})
