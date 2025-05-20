"use server"

import { supabase } from "./supabase"
import type { WaitlistEntry, WaitlistResponse, ReferralInfo } from "./supabase"

const ERROR_MESSAGES = {
  INVALID_EMAIL: "Please provide a valid email address.",
  EMAIL_EXISTS: "This email is already registered. Please use a different email.",
  INVALID_USERNAME: "Please provide a valid username.",
  SERVER_ERROR: "An unexpected error occurred. Please try again later.",
  DB_ERROR: "Database error occurred. Please try again later.",
  NOT_FOUND: "User not found. Please check your email and try again.",
  REFERRAL_ERROR: "Failed to process referral. Please try again.",
}

export async function submitWaitlistEmail(email: string, referrerCode?: string | null): Promise<WaitlistResponse> {
  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return { 
      success: false, 
      error: ERROR_MESSAGES.INVALID_EMAIL 
    }
  }

  try {
    // Check if email already exists
    const { data: existingData, error: checkError } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing user:", checkError)
      throw checkError
    }

    if (existingData) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.EMAIL_EXISTS
      }
    }

    // Generate referral code
    const referralCode = generateReferralCode()

    // Insert new waitlist entry
    const { data, error: insertError } = await supabase
      .from("waitlist")
      .insert([
        {
          email,
          referral_code: referralCode,
          referral_count: 0,
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("Database insert error:", insertError)
      throw insertError
    }

    // If there's a referrer, increment their referral count
    if (referrerCode) {
      const { error: refError } = await supabase
        .rpc('increment_referral_count', { referral_code: referrerCode })
      
      if (refError) {
        console.error("Error incrementing referral count:", refError)
        // Don't throw here, as the main signup was successful
      }
    }

    return { 
      success: true, 
      data,
      userId: data.id,
      step: "twitter"
    }
  } catch (error: any) {
    console.error("Error submitting to waitlist:", error)
    return { 
      success: false, 
      error: error?.message || ERROR_MESSAGES.SERVER_ERROR
    }
  }
}

export async function updateTwitterUsername(email: string, username: string): Promise<WaitlistResponse> {
  if (!username) {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_USERNAME
    }
  }

  try {
    const { error } = await supabase
      .from("waitlist")
      .update({ twitter_username: username.replace(/^@/, '') }) // Remove @ if present
      .eq("email", email)
      .single()

    if (error) throw error

    return { 
      success: true,
      step: "discord" 
    }
  } catch (error: any) {
    console.error("Error updating Twitter username:", error)
    return { 
      success: false, 
      error: error?.message || ERROR_MESSAGES.SERVER_ERROR
    }
  }
}

export async function updateDiscordUsername(email: string, username: string): Promise<WaitlistResponse> {
  if (!username) {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_USERNAME
    }
  }

  try {
    const { error } = await supabase
      .from("waitlist")
      .update({ discord_username: username })
      .eq("email", email)
      .single()

    if (error) throw error

    return { 
      success: true,
      step: "confirmation" 
    }
  } catch (error: any) {
    console.error("Error updating Discord username:", error)
    return { 
      success: false, 
      error: error?.message || ERROR_MESSAGES.SERVER_ERROR
    }
  }
}

export async function getUserReferralInfo(email: string): Promise<ReferralInfo> {
  try {
    const { data, error } = await supabase
      .from("waitlist")
      .select("referral_code, referral_count")
      .eq("email", email)
      .single()

    if (error) throw error

    if (!data) {
      return {
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND
      }
    }

    return {
      success: true,
      data: {
        referral_code: data.referral_code,
        referral_count: data.referral_count
      }
    }
  } catch (error: any) {
    console.error("Error fetching referral info:", error)
    return {
      success: false,
      error: error?.message || ERROR_MESSAGES.SERVER_ERROR
    }
  }
}

// Helper function to generate a unique referral code
function generateReferralCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
