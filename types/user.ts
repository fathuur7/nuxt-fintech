export interface User {
  _id: string
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  balance: number
  status: 'online' | 'idle' | 'offline'
  isActive: boolean
  picture: string
  createdAt: string
  updatedAt: string
}

export interface UserStatusUpdate {
  userId: string
  status?: 'online' | 'idle' | 'offline'
  isActive?: boolean
  timestamp?: string
}