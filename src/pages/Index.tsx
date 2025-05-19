import { WaitlistForm } from "../components/WaitlistForm"
import { Logo } from "../components/Logo"
export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md mb-8 text-center">
        <Logo />
        <h1 className="text-3xl font-bold mb-2">NEFTIT</h1>
      </div>

      <WaitlistForm />

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} NEFTIT. All rights reserved.</p>
      </footer>
    </div>
  )
}
