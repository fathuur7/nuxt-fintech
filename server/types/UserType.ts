export interface UserType {
  _id?: string
  name: string
  email: string
  picture?: string
  role?: 'admin' | 'user'
  balance?: number
  isActive?: boolean
}