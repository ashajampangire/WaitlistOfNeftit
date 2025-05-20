import { WaitlistForm } from "@/components/WaitlistForm";
import { BackgroundEffect } from "@/components/BackgroundEffect";
import { Logo } from "@/components/Logo";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <BackgroundEffect />
      </div>

      <div className="w-full max-w-md mb-12 text-center relative z-10">
        <div className="hover-scale mb-6">
          <Logo />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text glow">
          NEFTIT
        </h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-xs mx-auto leading-relaxed">
          The New Era of Web3 Tasks & Rewards
        </p>
      </div>

      <div className="glass-effect w-full max-w-md p-6 glow relative z-10">
        <WaitlistForm />
      </div>

      <footer className="mt-12 text-center relative z-10">
        <p className="text-sm text-gray-400/60">
          © {new Date().getFullYear()} NEFTIT. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
