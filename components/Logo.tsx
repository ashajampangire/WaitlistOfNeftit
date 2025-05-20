export function Logo() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 relative">
        <img
          src="/images/logo.png"
          alt="NEFTIT Logo"
          className="w-full h-full object-contain rounded-lg transition-transform duration-200 hover:scale-105"
          style={{ filter: "drop-shadow(0 0 8px rgba(109, 40, 217, 0.4))" }}
        />
      </div>
    </div>
  );
}
