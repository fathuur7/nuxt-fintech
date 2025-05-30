import mongoose from 'mongoose'
const { Schema, model, models } = mongoose


const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: String,

  // Fintech fields
  phone: { type: String },                      // no HP pengguna
  balance: { type: Number, default: 0 },        // saldo
  verified: { type: Boolean, default: false },  // verifikasi KYC
  createdAt: { type: Date, default: Date.now }
})

export const User = models.User || model('User', UserSchema)
