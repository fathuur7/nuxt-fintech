import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          role: 'user' | 'admin'
          balance: number
          status: 'online' | 'offline' | 'idle'
          is_active: boolean
          last_seen: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          avatar_url?: string | null
          role?: 'user' | 'admin'
          balance?: number
          status?: 'online' | 'offline' | 'idle'
          is_active?: boolean
          last_seen?: string
        }
        Update: {
          email?: string
          username?: string
          avatar_url?: string | null
          role?: 'user' | 'admin'
          balance?: number
          status?: 'online' | 'offline' | 'idle'
          is_active?: boolean
          last_seen?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          message_type: 'text' | 'image' | 'file'
          status: 'sent' | 'delivered' | 'read'
          is_read: boolean
          read_at: string | null
          attachment_url: string | null
          attachment_type: string | null
          attachment_size: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          sender_id: string
          receiver_id: string
          content: string
          message_type?: 'text' | 'image' | 'file'
          status?: 'sent' | 'delivered' | 'read'
          is_read?: boolean
          read_at?: string | null
          attachment_url?: string | null
          attachment_type?: string | null
          attachment_size?: number | null
        }
        Update: {
          content?: string
          status?: 'sent' | 'delivered' | 'read'
          is_read?: boolean
          read_at?: string | null
        }
      }
      savings_products: {
        Row: {
          id: string
          name: string
          interest_rate: number
          min_balance: number
          max_balance: number | null
          compound_period: 'daily' | 'monthly' | 'quarterly' | 'annually'
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          interest_rate: number
          min_balance?: number
          max_balance?: number | null
          compound_period?: 'daily' | 'monthly' | 'quarterly' | 'annually'
          description?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          interest_rate?: number
          min_balance?: number
          max_balance?: number | null
          compound_period?: 'daily' | 'monthly' | 'quarterly' | 'annually'
          description?: string | null
          is_active?: boolean
        }
      }
      savings_accounts: {
        Row: {
          id: string
          user_id: string
          product_id: string
          account_number: string
          balance: number
          interest_accrued: number
          last_interest_calculation: string
          status: 'active' | 'dormant' | 'closed'
          open_date: string
          close_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          product_id: string
          account_number: string
          balance?: number
          interest_accrued?: number
          last_interest_calculation?: string
          status?: 'active' | 'dormant' | 'closed'
          open_date?: string
          close_date?: string | null
        }
        Update: {
          balance?: number
          interest_accrued?: number
          last_interest_calculation?: string
          status?: 'active' | 'dormant' | 'closed'
          close_date?: string | null
        }
      }
      savings_transactions: {
        Row: {
          id: string
          account_id: string
          type: 'deposit' | 'withdrawal' | 'interest' | 'fee'
          amount: number
          balance_before: number
          balance_after: number
          description: string | null
          reference: string | null
          processed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          account_id: string
          type: 'deposit' | 'withdrawal' | 'interest' | 'fee'
          amount: number
          balance_before: number
          balance_after: number
          description?: string | null
          reference?: string | null
          processed_by?: string | null
        }
        Update: {
          description?: string | null
          reference?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          order_id: string
          amount: number
          status: 'pending' | 'success' | 'failed' | 'expired'
          type: string
          transaction_id: string | null
          payment_type: string | null
          snap_token: string | null
          snap_redirect_url: string | null
          expiry_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          order_id: string
          amount: number
          status?: 'pending' | 'success' | 'failed' | 'expired'
          type: string
          transaction_id?: string | null
          payment_type?: string | null
          snap_token?: string | null
          snap_redirect_url?: string | null
          expiry_time?: string | null
        }
        Update: {
          status?: 'pending' | 'success' | 'failed' | 'expired'
          transaction_id?: string | null
          payment_type?: string | null
        }
      }
    }
  }
}