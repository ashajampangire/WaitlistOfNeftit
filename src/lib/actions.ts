"use server"

import { supabase } from "./supabase"
import type { WaitlistEntry, WaitlistResponse, ReferralInfo } from "./supabase"

export async function submitWaitlistEmail(email: string, referrerCode?: string | null): Promise<WaitlistResponse> {
  console.log("Submitting email:", email)

  if (!email) {
    return { 
      success: false, 
      error: "Please provide an email address." 
    }
  }

  try {
    // Check if email already exists
    const { data: existingData, error: checkError } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)

    if (checkError) {
      console.error("Error checking existing user:", checkError)
      throw checkError
    }

    if (existingData && existingData.length > 0) {
      return { 
        success: false, 
        error: "This email is already registered. Please use a different email." 
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

    if (insertError) {
      console.error("Database insert error:", insertError)
      throw insertError
    }

    if (!data || data.length === 0) {
      console.error("No data returned from insert")
      throw new Error("Failed to create waitlist entry")
    }

    const newEntry = data[0]

    // If there's a referrer, increment their referral count
    if (referrerCode) {
      const { error: refError } = await supabase
        .rpc('increment_referral_count', { referral_code: referrerCode })
      
      if (refError) {
        console.error("Error incrementing referral count:", refError)
      }
    }

    console.log("Successfully created waitlist entry:", newEntry)

    return { 
      success: true, 
      data: newEntry,
      userId: newEntry.id,
      step: "twitter"
    }
  } catch (error: any) {
    console.error("Error submitting to waitlist:", error)
    return { 
      success: false, 
      error: error?.message || "Failed to join waitlist. Please try again later." 
    }
  }
}

export async function updateTwitterUsername(email: string, username: string): Promise<WaitlistResponse> {
  try {
    const { error } = await supabase
      .from("waitlist")
      .update({ twitter_username: username })
      .eq("email", email)

    if (error) throw error
    return { 
      success: true,
      step: "discord" 
    }
  } catch (error) {
    console.error("Error updating Twitter username:", error)
    return { 
      success: false, 
      error: "Failed to update Twitter username" 
    }
  }
}

export async function updateDiscordUsername(email: string, username: string): Promise<WaitlistResponse> {
  try {
    const { error } = await supabase
      .from("waitlist")
      .update({ discord_username: username })
      .eq("email", email)

    if (error) throw error
    return { 
      success: true,
      step: "confirmation" 
    }
  } catch (error) {
    console.error("Error updating Discord username:", error)
    return { 
      success: false, 
      error: "Failed to update Discord username" 
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
    return { success: true, data }
  } catch (error) {
    console.error("Error getting referral info:", error)
    return { 
      success: false, 
      error: "Failed to get referral information" 
    }
  }
}

function generateReferralCode(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
