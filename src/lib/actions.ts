"use server"

import { supabase } from "./supabase"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neftit.xyz"

export async function submitWaitlistEmail(email: string, referrer?: string) {
  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("waitlist")
      .select("id, x_username, discord_username")
      .eq("email", email)
      .single()

    if (existingUser) {
      // User already exists, determine next step
      if (!existingUser.x_username) {
        return { success: true, userId: existingUser.id, step: "twitter" }
      } else if (!existingUser.discord_username) {
        return { success: true, userId: existingUser.id, step: "discord" }
      } else {
        return { success: true, userId: existingUser.id, step: "confirmation" }
      }
    }

    // Find referrer ID if referrer username is provided
    let referrerId = null
    if (referrer) {
      const { data: referrerData } = await supabase.from("waitlist").select("id").eq("email", referrer).single()

      if (referrerData) {
        referrerId = referrerData.id

        // Increment referrer's count
        await supabase.rpc("increment_referral_count", { user_id: referrerId })
      }
    }

    // Insert new user
    const { data, error } = await supabase
      .from("waitlist")
      .insert([
        {
          email,
          referrer_id: referrerId,
        },
      ])
      .select()

    if (error) throw error

    const userId = data[0].id

    return { success: true, userId, step: "twitter" }
  } catch (error) {
    console.error("Error submitting email:", error)
    return { success: false, error: "Failed to submit email. Please try again." }
  }
}

export async function updateTwitterUsername(userId: string, xUsername: string) {
  try {
    const { error } = await supabase.from("waitlist").update({ x_username: xUsername }).eq("id", userId)

    if (error) throw error

    return { success: true, step: "discord" }
  } catch (error) {
    console.error("Error updating Twitter username:", error)
    return { success: false, error: "Failed to update Twitter username. Please try again." }
  }
}

export async function updateDiscordUsername(userId: string, discordUsername: string) {
  try {
    const { error } = await supabase.from("waitlist").update({ discord_username: discordUsername }).eq("id", userId)

    if (error) throw error

    return { success: true, step: "confirmation" }
  } catch (error) {
    console.error("Error updating Discord username:", error)
    return { success: false, error: "Failed to update Discord username. Please try again." }
  }
}

export async function getUserReferralInfo(userId: string) {
  try {
    const { data, error } = await supabase.from("waitlist").select("email, referrals_count").eq("id", userId).single()

    if (error) throw error

    const referralLink = `${siteUrl}/waitlist?ref=${encodeURIComponent(data.email)}`

    return {
      success: true,
      referralLink,
      referralsCount: data.referrals_count,
    }
  } catch (error) {
    console.error("Error getting referral info:", error)
    return {
      success: false,
      referralLink: `${siteUrl}/waitlist`,
      referralsCount: 0,
    }
  }
}
