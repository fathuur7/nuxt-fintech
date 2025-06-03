import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  attachmentUrl: {
    type: String // For file/image messages
  },
  attachmentType: {
    type: String // MIME type for attachments
  },
  attachmentSize: {
    type: Number // File size in bytes
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for better query performance
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 })
messageSchema.index({ receiverId: 1, isRead: 1 })

// Virtual for backward compatibility
messageSchema.virtual('userId').get(function() {
  return this.senderId
})

messageSchema.virtual('toUserId').get(function() {
  return this.receiverId
})

export const Message = (mongoose.models.Message) || mongoose.model('Message', messageSchema);
