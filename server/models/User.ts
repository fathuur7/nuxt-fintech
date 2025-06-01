
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['online', 'offline' , 'idle'],
    default: 'offline'
  },

}, {
  timestamps: true
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)