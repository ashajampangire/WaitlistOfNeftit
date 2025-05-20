"use server"

import { supabase } from "./supabase"
import type { WaitlistEntry, WaitlistResponse, ReferralInfo } from "./supabase"
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)

const ERROR_MESSAGES = {
  INVALID_EMAIL: "Please provide a valid email address.",
  EMAIL_EXISTS: "This email is already registered. Please use a different email.",
  INVALID_USERNAME: "Please provide a valid username.",
  SERVER_ERROR: "An unexpected error occurred. Please try again later.",
  DB_ERROR: "Unable to connect to the database. Please try again in a few minutes.",
  NOT_FOUND: "User not found. Please check your email and try again.",
  REFERRAL_ERROR: "Failed to process referral. Please try again.",
  NETWORK_ERROR: "Network connection error. Please check your internet connection.",
  RATE_LIMIT: "Too many attempts. Please wait a few minutes before trying again.",
  INVALID_TWITTER: "Please provide a valid Twitter/X username without the @ symbol.",
  INVALID_DISCORD: "Please provide a valid Discord username.",
  ENV_ERROR: "Server configuration error. Please contact support.",
  DB_TIMEOUT: "The database is taking too long to respond. Please try again.",
}

function generateReferralCode(): string {
  return nanoid()
}

async function incrementReferralCount(referralCode: string) {
  const { error } = await supabase.rpc('increment_referral_count', {
    p_referral_code: referralCode
  })
  if (error) {
    console.error('Error incrementing referral count:', error)
  }
}

export async function submitWaitlistEmail(formData: FormData): Promise<WaitlistResponse> {
  'use server'
  
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing required Supabase environment variables')
    return { success: false, error: ERROR_MESSAGES.SERVER_ERROR }
  }

  const email = formData.get('email')?.toString()
  const referrerCode = formData.get('referrerCode')?.toString()
  console.log('Received email:', email, 'referrerCode:', referrerCode) // Debug log

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    console.log('Invalid email format') // Debug log
    return { success: false, error: ERROR_MESSAGES.INVALID_EMAIL }
  }

  try {
    // Check if email already exists
    const { data: existingData, error: checkError } = await supabase
      .from("waitlist")
      .select("id, email")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing user:", checkError)
      return { success: false, error: ERROR_MESSAGES.DB_ERROR }
    }

    if (existingData) {
      return { success: false, error: ERROR_MESSAGES.EMAIL_EXISTS }
    }

    const referralCode = generateReferralCode()    // Log the insert operation
    console.log('Attempting to insert:', { email, referralCode })

    const { data, error: insertError } = await supabase
      .from("waitlist")
      .insert([{
        email,
        referral_code: referralCode,
        referral_count: 0,
        status: "pending",
        ...(referrerCode ? { referred_by: referrerCode } : {})
      }])
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting email:", insertError)
      return { success: false, error: ERROR_MESSAGES.DB_ERROR }
    }

    if (!data) {
      console.error("No data returned from insert")
      return { success: false, error: ERROR_MESSAGES.DB_ERROR }
    }

    if (referrerCode) {
      await incrementReferralCount(referrerCode)
    }

    return { success: true, data, step: "twitter" }
  } catch (error: any) {
    console.error("Error submitting to waitlist:", error)
    return { success: false, error: ERROR_MESSAGES.SERVER_ERROR }
  }
}

export async function updateTwitterUsername(userId: string, username: string): Promise<WaitlistResponse> {
  if (!username) {
    return { success: false, error: ERROR_MESSAGES.INVALID_USERNAME }
  }

  try {
    const { error } = await supabase
      .from("waitlist")
      .update({ twitter_username: username.replace(/^@/, '') })
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error updating Twitter username:", error)
      return { success: false, error: ERROR_MESSAGES.DB_ERROR }
    }

    return { success: true, step: "discord" }
  } catch (error: any) {
    console.error("Error updating Twitter username:", error)
    return { success: false, error: ERROR_MESSAGES.SERVER_ERROR }
  }
}

export async function updateDiscordUsername(userId: string, username: string): Promise<WaitlistResponse> {
  if (!username) {
    return { success: false, error: ERROR_MESSAGES.INVALID_USERNAME }
  }

  try {
    const { error } = await supabase
      .from("waitlist")
      .update({ discord_username: username })
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error updating Discord username:", error)
      return { success: false, error: ERROR_MESSAGES.DB_ERROR }
    }

    return { success: true, step: "confirmation" }
  } catch (error: any) {
    console.error("Error updating Discord username:", error)
    return { success: false, error: ERROR_MESSAGES.SERVER_ERROR }
  }
}

export async function getUserReferralInfo(userId: string): Promise<ReferralInfo> {
  try {
    const { data, error } = await supabase
      .from("waitlist")
      .select("referral_code, referral_count")
      .eq("id", userId)
      .single()

    if (error || !data) {
      console.error("Error fetching referral info:", error)
      return { success: false, error: ERROR_MESSAGES.DB_ERROR }
    }

    return {
      success: true,
      data: {
        referral_code: data.referral_code,
        referral_count: data.referral_count
      }
    }
  } catch (error: any) {
    console.error("Error getting referral info:", error)
    return { success: false, error: ERROR_MESSAGES.SERVER_ERROR }
  }
}
