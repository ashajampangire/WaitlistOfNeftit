"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

interface ReferralLinkProps {
  referralLink: string
  referralsCount: number
}

export function ReferralLink({ referralLink, referralsCount }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 p-5 border rounded-xl bg-gray-800 border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-200">Your Referral Link</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Referrals:</span>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900/30 text-purple-300 font-semibold text-sm">
            {referralsCount}
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Input value={referralLink} readOnly className="text-sm bg-gray-700 border-gray-600 text-gray-300" />
        <Button
          onClick={copyToClipboard}
          variant={copied ? "outline" : "default"}
          size="sm"
          className={copied ? "border-green-500 text-green-400 bg-green-900/20" : ""}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-900/30">
        <p className="text-xs text-purple-300">
          <span className="font-semibold">Pro tip:</span> Share this link with friends to move up the waitlist. Each
          referral improves your position!
        </p>
      </div>
    </div>
  )
}
