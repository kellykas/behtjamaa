import { useState, useEffect } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "title" | "tagline" | "glow" | "exit">("enter");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("title"), 300),
      setTimeout(() => setPhase("tagline"), 1200),
      setTimeout(() => setPhase("glow"), 2200),
      setTimeout(() => setPhase("exit"), 3800),
      setTimeout(() => onComplete(), 4600),
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

      {/* Text container */}
      <div className="relative z-10 text-center">
        {/* BEHT JAMAA — letter by letter */}
        <div className="flex items-center justify-center gap-[2px] mb-4">
          {"BEHT JAMAA".split("").map((char, i) => (
            <span
              key={i}
              className="text-4xl md:text-6xl font-bold text-white inline-block"
              style={{
                textShadow: phase !== "enter"
                  ? "0 0 30px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)"
                  : "none",
                opacity: (phase === "title" || phase === "tagline" || phase === "glow") ? 1 : 0,
                transform: (phase === "title" || phase === "tagline" || phase === "glow")
                  ? "translateY(0) scale(1)"
                  : "translateY(20px) scale(0.8)",
                transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms`,
                letterSpacing: char === " " ? "0.3em" : "0.05em",
                minWidth: char === " " ? "0.5em" : undefined,
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Decorative line */}
        <div
          className="mx-auto mb-4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
          style={{
            width: (phase === "tagline" || phase === "glow") ? "200px" : "0px",
            opacity: (phase === "tagline" || phase === "glow") ? 1 : 0,
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
          }}
        />

        {/* WE THE BOYS IN THE HOUSE — word by word */}
        <div className="flex items-center justify-center gap-2 md:gap-3">
          {"WE THE BOYS IN THE HOUSE".split(" ").map((word, i) => (
            <span
              key={i}
              className="text-sm md:text-base tracking-[0.2em] font-semibold text-amber-200/80 uppercase inline-block"
              style={{
                opacity: (phase === "tagline" || phase === "glow") ? 1 : 0,
                transform: (phase === "tagline" || phase === "glow")
                  ? "translateY(0)"
                  : "translateY(12px)",
                transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.3 + i * 100}ms`,
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Subtle shimmer on glow phase */}
        {phase === "glow" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.08) 50%, transparent 100%)",
              animation: "shimmer-sweep 1.5s ease-in-out",
            }}
          />
        )}
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
