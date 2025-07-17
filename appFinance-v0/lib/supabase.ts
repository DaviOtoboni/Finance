import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          limit_amount: number
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          limit_amount?: number
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          limit_amount?: number
          color?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          description: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          description?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          description?: string | null
          date?: string
          created_at?: string
        }
      }
      fixed_accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          due_day: number
          is_paid: boolean
          month: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          due_day: number
          is_paid?: boolean
          month: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          due_day?: number
          is_paid?: boolean
          month?: number
          year?: number
          created_at?: string
        }
      }
    }
  }
}
