"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { StepIndicator } from "./StepIndicator"
import { ReferralLink } from "./ReferralLink"
import { SocialButton } from "./SocialButton"
import { ShareButton } from "./ShareButton"
import { BackButton } from "./BackButton"
import { submitWaitlistEmail, updateTwitterUsername, updateDiscordUsername, getUserReferralInfo } from "../lib/actions"
import type { WaitlistStep } from "../lib/supabase"

export function WaitlistForm() {
  const [step, setStep] = useState<WaitlistStep>("email")
  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  const [xUsername, setXUsername] = useState("")
  const [discordUsername, setDiscordUsername] = useState("")
  const [referralLink, setReferralLink] = useState("")
  const [referralsCount, setReferralsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [animation, setAnimation] = useState<"enter" | "exit" | null>(null)

  // Get referrer from URL if available
  const referrer = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") : null

  // Handle page transitions
  const transitionToNextStep = (nextStep: WaitlistStep) => {
    setAnimation("exit")

    setTimeout(() => {
      setStep(nextStep)
      setAnimation("enter")

      setTimeout(() => {
        setAnimation(null)
      }, 300)
    }, 300)
  }

  // Handle going back to previous step
  const goBack = () => {
    setAnimation("exit")

    setTimeout(() => {
      if (step === "twitter") setStep("email")
      else if (step === "discord") setStep("twitter")
      else if (step === "confirmation") setStep("discord")

      setAnimation("enter")

      setTimeout(() => {
        setAnimation(null)
      }, 300)
    }, 300)
  }

  useEffect(() => {
    setAnimation("enter")

    setTimeout(() => {
      setAnimation(null)
    }, 300)
  }, [])

  useEffect(() => {
    if (userId && step === "confirmation") {
      // Fetch referral info when reaching confirmation step
      const fetchReferralInfo = async () => {
        const referralInfo = await getUserReferralInfo(email)
        if (referralInfo.success && referralInfo.data) {
          const { referral_code, referral_count } = referralInfo.data
          setReferralLink(`${window.location.origin}?ref=${referral_code}`)
          setReferralsCount(referral_count)
        }
      }
      fetchReferralInfo()
    }
  }, [userId, step, email])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!email) {
      setError("Please enter your email address")
      setIsLoading(false)
      return
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const response = await submitWaitlistEmail(email, referrer)
      if (response.success) {
        setUserId(response.userId || "")
        transitionToNextStep(response.step || "twitter")
      } else {
        setError(response.error || "An error occurred. Please try again.")
      }
    } catch (err) {
      setError("We're experiencing technical difficulties. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwitterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!xUsername) {
      setError("Please enter your Twitter/X username")
      setIsLoading(false)
      return
    }

    try {
      const response = await updateTwitterUsername(email, xUsername)
      if (response.success) {
        transitionToNextStep(response.step || "discord")
      } else {
        setError(response.error || "Failed to update Twitter username. Please try again.")
      }
    } catch (err) {
      setError("We're experiencing technical difficulties. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiscordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!discordUsername) {
      setError("Please enter your Discord username")
      setIsLoading(false)
      return
    }

    try {
      const response = await updateDiscordUsername(email, discordUsername)
      if (response.success) {
        transitionToNextStep(response.step || "confirmation")
        const referralInfo = await getUserReferralInfo(email)
        if (referralInfo.success && referralInfo.data) {
          setReferralLink(`${window.location.origin}?ref=${referralInfo.data.referral_code}`)
          setReferralsCount(referralInfo.data.referral_count)
        }
      } else {
        setError(response.error || "Failed to update Discord username. Please try again.")
      }
    } catch (err) {
      setError("We're experiencing technical difficulties. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getAnimationClass = () => {
    if (animation === "enter") return "page-transition-enter page-transition-enter-active"
    if (animation === "exit") return "page-transition-exit page-transition-exit-active"
    return ""
  }

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden border-0 shadow-lg shadow-purple-900/20 relative bg-gray-800 text-white">
      {/* Back Button - Only show on steps after email */}
      {step !== "email" && <BackButton onClick={goBack} />}

      <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 pb-6">
        <CardTitle className="text-center text-2xl font-bold gradient-text">NEFTIT Waitlist</CardTitle>
        <CardDescription className="text-center mt-2 text-gray-300 font-medium">
          {step === "email" && "Be the First to Enter the New Era of Web3 Tasks & Rewards"}
          {step === "twitter" && "Follow NEFTIT on X to Continue"}
          {step === "discord" && "Join our Discord to Stay Connected"}
          {step === "confirmation" && "You've Successfully Joined the Waitlist!"}
        </CardDescription>
        <StepIndicator
          currentStep={step === "email" ? 1 : step === "twitter" ? 2 : step === "discord" ? 3 : 4}
          totalSteps={4}
        />
      </CardHeader>
      <CardContent className={`p-6 ${getAnimationClass()}`}>
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Join the Waitlist to Unlock Early Access + Special Rewards</p>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  "Submit & Continue"
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "twitter" && (
          <form onSubmit={handleTwitterSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <SocialButton platform="twitter" href="https://x.com/neftitxyz">
                  Follow @neftitxyz on X
                </SocialButton>
                <Input
                  type="text"
                  placeholder="Your X username (without @)"
                  value={xUsername}
                  onChange={(e) => setXUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={goBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {step === "discord" && (
          <form onSubmit={handleDiscordSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <SocialButton platform="discord" href="https://t.co/oNBoaFNK2K">
                  Join NEFTIT Discord
                </SocialButton>
                <Input
                  type="text"
                  placeholder="Your Discord username"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={goBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Joining...
                    </div>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {step === "confirmation" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-900/30 text-purple-400 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 gradient-text">You're on the list!</h3>
              <p className="text-sm text-gray-300">
                Thank you for joining the NEFTIT waitlist. Invite your friends to move up the list!
              </p>
            </div>

            <ReferralLink referralLink={referralLink} referralsCount={referralsCount} />

            <div className="flex flex-col space-y-3">
              <div className="flex justify-center space-x-3">
                <ShareButton
                  platform="twitter"
                  onClick={() => {
                    window.open(
                      `https://x.com/intent/tweet?text=${encodeURIComponent(`I just joined the @neftitxyz waitlist for early access to the new era of Web3 tasks & rewards! Join me: ${referralLink}`)}`,
                      "_blank",
                    )
                  }}
                >
                  Share on X
                </ShareButton>
                <ShareButton platform="copy" onClick={copyToClipboard} active={copied}>
                  {copied ? "Copied!" : "Copy Link"}
                </ShareButton>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={goBack}
              >
                Back to Discord Step
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center p-4 bg-gray-900 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          {step !== "confirmation" ? "All steps must be completed to join the waitlist" : ""}
        </p>
      </CardFooter>
    </Card>
  )
}
