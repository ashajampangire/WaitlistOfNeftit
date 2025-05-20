"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { StepIndicator } from "./StepIndicator";
import { ShareButton } from "./ShareButton";
import { BackButton } from "./BackButton";
import {
  submitWaitlistEmail,
  updateTwitterUsername,
  updateDiscordUsername,
  getUserReferralInfo,
} from "../lib/actions";
import type { WaitlistStep } from "../lib/supabase";
import { toast } from "./ui/use-toast";

export function WaitlistForm() {
  const [step, setStep] = useState<WaitlistStep>("email");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [xUsername, setXUsername] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [emailError, setEmailError] = useState("");

  const getCurrentStepNumber = () => {
    switch (step) {
      case "email":
        return 1;
      case "twitter":
        return 2;
      case "discord":
        return 3;
      case "confirmation":
        return 4;
      default:
        return 1;
    }
  };
  async function onEmailSubmit(formData: FormData) {
    setLoading(true);
    setEmailError(""); // Clear any previous errors
    try {
      const result = await submitWaitlistEmail(formData);
      console.log("Submit result:", result); // Debug log

      if (result.success && result.data) {
        setUserId(result.data.id);
        setStep("twitter");
        toast({
          title: "🎉 Welcome to the waitlist!",
          description:
            "Now let's connect your social accounts to boost your position.",
          variant: "default",
        });
      } else if (
        result.error ===
        "This email is already registered. Please use a different email."
      ) {
        setEmailError("This email is already registered");
        setEmail("");
        toast({
          variant: "destructive",
          title: "Already Registered",
          description:
            "This email is already on our waitlist. Try signing in or use a different email.",
        });
      } else if (result.error?.includes("database")) {
        toast({
          variant: "destructive",
          title: "Service Temporarily Unavailable",
          description:
            "We're experiencing technical difficulties. Please try again in a few minutes.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Unable to Join Waitlist",
          description:
            result.error || "Please check your information and try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting email:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description:
          "Unable to reach our servers. Please check your internet connection and try again.",
      });
    }
    setLoading(false);
  }

  async function onTwitterSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await updateTwitterUsername(userId, xUsername);
      if (result.success) {
        setStep("discord");
        toast({
          title: "Twitter username saved!",
          description: "Now let's connect your Discord account.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update Twitter username",
        });
      }
    } catch (error) {
      console.error("Error updating Twitter username:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
    setLoading(false);
  }

  async function onDiscordSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await updateDiscordUsername(userId, discordUsername);
      if (result.success) {
        const referralInfo = await getUserReferralInfo(userId);
        if (referralInfo.success && referralInfo.data) {
          setReferralLink(
            `https://neftit.com?ref=${referralInfo.data.referral_code}`
          );
          setReferralCount(referralInfo.data.referral_count);
          setReferralCount(referralInfo.data.referral_count);
        }
        setStep("confirmation");
        toast({
          title: "All set!",
          description: "Share your referral link to move up the waitlist.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update Discord username",
        });
      }
    } catch (error) {
      console.error("Error updating Discord username:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
    setLoading(false);
  }
  const shareOnTwitter = () => {
    const text =
      "🚀 I just joined the @neftitxyz waitlist! Join me in exploring the future of Web3 tasks and rewards.";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank");
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copied!",
        description: "Share it with your friends to move up the waitlist.",
      });
    } catch (error) {
      console.error("Error copying referral link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link to clipboard",
      });
    }
  };

  return (
    <div className="w-full">
      <StepIndicator currentStep={getCurrentStepNumber()} totalSteps={4} />
      {step === "email" && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2 gradient-text">
              Join the Waitlist
            </h2>
            <p className="text-gray-400 text-sm">
              Be the first to experience the future of Web3 tasks
            </p>
          </div>{" "}
          <form action={onEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(""); // Clear error when user types
                }}
                className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 hover:border-purple-500/50 focus:border-purple-500 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                } ${emailError ? "border-red-500" : ""}`}
                required
                disabled={loading}
                aria-describedby="email-error"
                aria-invalid={!!emailError}
              />
              {emailError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-200">
                  <div className="flex items-center gap-2">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M7.5 0C3.36 0 0 3.36 0 7.5C0 11.64 3.36 15 7.5 15C11.64 15 15 11.64 15 7.5C15 3.36 11.64 0 7.5 0ZM6.75 3.75H8.25V8.25H6.75V3.75ZM7.5 12C6.675 12 6 11.325 6 10.5C6 9.675 6.675 9 7.5 9C8.325 9 9 9.675 9 10.5C9 11.325 8.325 12 7.5 12Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>{emailError}</span>
                  </div>
                  <p className="mt-2 ml-6 text-red-200/80">
                    Please try signing in or use a different email address.
                  </p>
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity relative"
              disabled={loading}
            >
              <span className={loading ? "invisible" : ""}>Join Waitlist</span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </Button>
          </form>
        </div>
      )}
      {step === "twitter" && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2 gradient-text">
              Connect Twitter
            </h2>
            <p className="text-gray-400 text-sm">
              Follow us and engage with our community
            </p>
          </div>

          <form action={onTwitterSubmit} className="space-y-4">
            <Input
              type="text"
              name="username"
              placeholder="Your Twitter/X username"
              value={xUsername}
              onChange={(e) => setXUsername(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 hover:border-purple-500/50 focus:border-purple-500 transition-colors"
            />
            <div className="flex flex-col gap-3">
              {" "}
              <a
                href="https://x.com/neftitxyz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-4 rounded-lg border border-gray-700 text-gray-300 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                Follow @neftit
              </a>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
              <BackButton onClick={() => setStep("email")} />
            </div>
          </form>
        </div>
      )}
      {step === "discord" && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2 gradient-text">
              Join Discord
            </h2>
            <p className="text-gray-400 text-sm">
              Connect with our community on Discord
            </p>
          </div>

          <form action={onDiscordSubmit} className="space-y-4">
            <Input
              type="text"
              name="username"
              placeholder="Your Discord username"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 hover:border-purple-500/50 focus:border-purple-500 transition-colors"
            />
            <div className="flex flex-col gap-3">
              {" "}
              <a
                href="https://t.co/oNBoaFNK2K"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-4 rounded-lg border border-gray-700 text-gray-300 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 18l-3-3H4.5a2.5 2.5 0 0 1-2.5-2.5v-7A2.5 2.5 0 0 1 4.5 3h15a2.5 2.5 0 0 1 2.5 2.5V18z"></path>
                  <path d="M9 9h.01"></path>
                  <path d="M15 9h.01"></path>
                </svg>
                Join Discord Server
              </a>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
              <BackButton onClick={() => setStep("twitter")} />
            </div>
          </form>
        </div>
      )}{" "}
      {step === "confirmation" && (
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold gradient-text">
              🎉 You're In!
            </h2>

            {/* Referral Stats Card */}
            <div className="inline-flex flex-col items-center justify-center px-8 py-6 bg-white/5 rounded-xl border border-gray-700/50">
              <div className="text-center space-y-1">
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                  {referralCount}
                </p>
                <p className="text-sm text-gray-400">
                  {referralCount === 1 ? "Friend Invited" : "Friends Invited"}
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mt-4">
              Share your referral link to move up the waitlist
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-gray-700/50 backdrop-blur-sm">
            <p className="text-sm text-gray-300 break-all font-mono">
              {referralLink}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <ShareButton platform="twitter" onClick={shareOnTwitter}>
              Share on X (Twitter)
            </ShareButton>
            <ShareButton platform="copy" onClick={copyReferralLink}>
              Copy Link
            </ShareButton>
          </div>
        </div>
      )}
    </div>
  );
}
