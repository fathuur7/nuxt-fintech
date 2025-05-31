import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  // optional: conversationId
}, {
  timestamps: true
})

messageSchema.index({ userId: 1, toUserId: 1, createdAt: -1 })

messageSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
})

messageSchema.virtual('toUser', {
  ref: 'User',
  localField: 'toUserId',
  foreignField: '_id',
  justOne: true
})

messageSchema.statics.getMessagesBetweenUsers = function(userA, userB, limit = 50) {
  return this.find({
    isDeleted: false,
    $or: [
      { userId: userA, toUserId: userB },
      { userId: userB, toUserId: userA }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email picture')
    .populate('toUserId', 'name email picture')
}

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema)
