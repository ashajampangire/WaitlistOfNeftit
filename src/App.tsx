import { WaitlistForm } from "./components/WaitlistForm";
import { BackgroundEffect } from "./components/BackgroundEffect";
import { Logo } from "./components/Logo";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <BackgroundEffect />
      <div className="w-full max-w-md mb-8 text-center">
        <Logo />
        <h1 className="text-3xl font-bold mb-2 gradient-text">NEFTIT</h1>
        <p className="text-gray-600 text-sm max-w-xs mx-auto">
          The New Era of Web3 Tasks & Rewards
        </p>
      </div>

      <WaitlistForm />

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} NEFTIT. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
