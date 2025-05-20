import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
if (!supabaseAnonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Types for our waitlist data
export type WaitlistStep = "email" | "twitter" | "discord" | "confirmation"

export interface WaitlistEntry {
  id: string
  created_at: string
  email: string
  twitter_username?: string | null
  discord_username?: string | null
  referral_code: string
  referral_count: number
  status?: string
}

export interface WaitlistResponse {
  success: boolean
  data?: WaitlistEntry
  error?: string
  userId?: string
  step?: WaitlistStep
}

export interface ReferralInfo {
  success: boolean
  data?: {
    referral_code: string
    referral_count: number
  }
  error?: string
}

// For server components and actions
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  return createClient(supabaseUrl, supabaseServiceKey)
}
