import { useState, useEffect } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("show"), 400),
      setTimeout(() => setPhase("exit"), 3200),
      setTimeout(() => onComplete(), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
        phase === "enter" || phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #111827 40%, #0f172a 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-80 h-80 rounded-full bg-blue-900/25 blur-[120px]" style={{ animation: "float-orb 10s ease-in-out infinite" }} />
        <div className="absolute bottom-[15%] right-[10%] w-64 h-64 rounded-full bg-purple-900/20 blur-[100px]" style={{ animation: "float-orb 12s ease-in-out infinite 3s" }} />
        <div className="absolute top-[40%] left-[50%] w-48 h-48 rounded-full bg-amber-800/15 blur-[80px] -translate-x-1/2 -translate-y-1/2" style={{ animation: "float-orb 14s ease-in-out infinite 5s" }} />
      </div>

      {/* Text */}
      <div
        className="relative z-10 text-center"
        style={{ transition: "all 1s ease", opacity: phase !== "enter" && phase !== "exit" ? 1 : 0, transform: phase === "show" ? "scale(1)" : "scale(0.95)" }}
      >
        <h1
          className="text-4xl md:text-5xl font-bold tracking-[0.3em] text-white mb-4"
          style={{
            textShadow: "0 0 40px rgba(251,191,36,0.4), 0 0 80px rgba(251,191,36,0.2)",
          }}
        >
          BEHT JAMAA
        </h1>
        <p
          className="text-sm md:text-base tracking-[0.2em] font-semibold text-amber-200/70 uppercase"
        >
          WE THE BOYS IN THE HOUSE
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-amber-400/60"
            style={{ animation: `dot-pulse 1.4s ease-in-out ${i * 200}ms infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
