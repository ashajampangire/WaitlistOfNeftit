interface ConfirmationStepProps {
  referralCount: number;
  referralLink: string;
  onShareTwitter: () => void;
  onCopyLink: () => void;
}

export function ConfirmationStep({
  referralCount,
  referralLink,
  onShareTwitter,
  onCopyLink,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold gradient-text">🎉 You're In!</h2>

        <div className="inline-flex items-center justify-center px-6 py-4 bg-white/5 rounded-lg border border-gray-700">
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text mb-1">
              {referralCount}
            </p>
            <p className="text-sm text-gray-400">
              {referralCount === 1 ? "Friend Invited" : "Friends Invited"}
            </p>
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          Share your referral link to move up the waitlist!
        </p>
      </div>

      <div className="p-4 bg-white/5 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-300 break-all">{referralLink}</p>
      </div>

      <div className="flex flex-col gap-3">
        <ShareButton platform="twitter" onClick={onShareTwitter}>
          Share on X (Twitter)
        </ShareButton>
        <ShareButton platform="copy" onClick={onCopyLink}>
          Copy Link
        </ShareButton>
      </div>
    </div>
  );
}
