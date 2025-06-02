import mongoose, { Document, Model } from "mongoose";

console.log('[MODEL] Message model file evaluation started.');

interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  message: string;
  status: 'sent' | 'delivered' | 'read';
  messageType: 'text' | 'image' | 'file' | 'system';
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MessageModel extends Model<IMessage> {
  getMessagesBetweenUsers(userA: mongoose.Types.ObjectId, userB: mongoose.Types.ObjectId, limit?: number): Promise<IMessage[]>;
}

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
}, {
  timestamps: true
});

messageSchema.index({ userId: 1, toUserId: 1, createdAt: -1 });

messageSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

messageSchema.virtual('toUser', {
  ref: 'User',
  localField: 'toUserId',
  foreignField: '_id',
  justOne: true
});

console.log('[MODEL] Defining getMessagesBetweenUsers static method...');
messageSchema.statics.getMessagesBetweenUsers = function(userA: mongoose.Types.ObjectId, userB: mongoose.Types.ObjectId, limit: number = 50) {
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
    .populate('toUserId', 'name email picture');
};
console.log('[MODEL] Static method getMessagesBetweenUsers defined on schema.');

export const Message = (mongoose.models.Message as MessageModel) || mongoose.model<IMessage, MessageModel>('Message', messageSchema);
console.log(`[MODEL] Message model exported. typeof Message.getMessagesBetweenUsers: ${typeof Message.getMessagesBetweenUsers}`);