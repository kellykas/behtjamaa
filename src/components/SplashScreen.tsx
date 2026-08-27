import { useState, useEffect } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "closed" | "glow" | "open" | "read" | "exit">("enter");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("closed"), 600),
      setTimeout(() => setPhase("glow"), 1400),
      setTimeout(() => setPhase("open"), 2200),
      setTimeout(() => setPhase("read"), 3200),
      setTimeout(() => setPhase("exit"), 4600),
      setTimeout(() => onComplete(), 5400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-800 ${
        phase === "enter" || phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(135deg, #0c1220 0%, #162032 50%, #1a1a2e 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full bg-blue-600/20 blur-[100px]" style={{ animation: "float-orb 8s ease-in-out infinite" }} />
        <div className="absolute bottom-[20%] right-[15%] w-48 h-48 rounded-full bg-purple-600/15 blur-[80px]" style={{ animation: "float-orb 10s ease-in-out infinite 2s" }} />
        <div className="absolute top-[50%] left-[50%] w-40 h-40 rounded-full bg-amber-500/10 blur-[60px] -translate-x-1/2 -translate-y-1/2" style={{ animation: "float-orb 12s ease-in-out infinite 4s" }} />
      </div>

      {/* Bible SVG */}
      <div
        className="relative z-10"
        style={{
          transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: phase === "open" || phase === "read" ? "scale(1.1)" : "scale(1)",
        }}
      >
        <svg viewBox="0 0 320 240" width="320" height="240" className="drop-shadow-2xl">
          {/* Left page (back cover) */}
          <rect
            x={phase === "open" || phase === "read" ? "20" : "60"}
            y="30"
            width="120"
            height="180"
            rx="4"
            fill="#5c3317"
            stroke="#3d220f"
            strokeWidth="1.5"
            style={{ transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
          {/* Left page inner */}
          <rect
            x={phase === "open" || phase === "read" ? "28" : "68"}
            y="38"
            width="104"
            height="164"
            rx="2"
            fill="#f5f0e8"
            style={{ transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
          {/* Right page (front cover) */}
          <rect
            x={phase === "open" || phase === "read" ? "180" : "140"}
            y="30"
            width="120"
            height="180"
            rx="4"
            fill="#5c3317"
            stroke="#3d220f"
            strokeWidth="1.5"
            style={{ transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
          {/* Right page inner */}
          <rect
            x={phase === "open" || phase === "read" ? "188" : "148"}
            y="38"
            width="104"
            height="164"
            rx="2"
            fill="#f5f0e8"
            style={{ transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
          {/* Spine */}
          <rect
            x="150"
            y="28"
            width="20"
            height="184"
            rx="2"
            fill="#4a2a12"
            style={{ transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />

          {/* Cross on cover (visible when closed) */}
          {phase === "closed" || phase === "enter" || phase === "glow" ? (
            <g style={{ transition: "opacity 0.8s", opacity: phase === "glow" ? 0.4 : 1 }}>
              <rect x="152" y="85" width="16" height="50" rx="2" fill="#d4a554" />
              <rect x="138" y="95" width="44" height="12" rx="2" fill="#d4a554" />
            </g>
          ) : null}

          {/* Golden glow effect */}
          {(phase === "glow" || phase === "open" || phase === "read") && (
            <>
              <ellipse cx="160" cy="120" rx="60" ry="40" fill="url(#bibleGlow)" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
              <defs>
                <radialGradient id="bibleGlow">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
              </defs>
            </>
          )}

          {/* Left page text lines (when open) */}
          {(phase === "open" || phase === "read") && (
            <g style={{ transition: "opacity 1s 0.5s", opacity: phase === "read" ? 1 : 0.6 }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => (
                <rect
                  key={`l${i}`}
                  x={phase === "open" || phase === "read" ? "38" : "78"}
                  y={50 + i * 11}
                  width={60 + (i % 3) * 12}
                  height="3"
                  rx="1.5"
                  fill="#94a3b8"
                  style={{
                    transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 50}ms`,
                    opacity: phase === "read" ? 1 : 0,
                  }}
                />
              ))}
              {/* Verse number on left */}
              <text
                x={phase === "open" || phase === "read" ? "40" : "80"}
                y="66"
                fontSize="8"
                fill="#6366f1"
                fontWeight="bold"
                style={{ transition: "all 1s 0.8s", opacity: phase === "read" ? 1 : 0 }}
              >
                1
              </text>
            </g>
          )}

          {/* Right page text lines (when open) */}
          {(phase === "open" || phase === "read") && (
            <g style={{ transition: "opacity 1s 0.6s", opacity: phase === "read" ? 1 : 0.6 }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => (
                <rect
                  key={`r${i}`}
                  x={phase === "open" || phase === "read" ? "198" : "158"}
                  y={50 + i * 11}
                  width={65 + (i % 2) * 15}
                  height="3"
                  rx="1.5"
                  fill="#94a3b8"
                  style={{
                    transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 50 + 100}ms`,
                    opacity: phase === "read" ? 1 : 0,
                  }}
                />
              ))}
            </g>
          )}

          {/* Golden sparkle particles */}
          {phase === "read" && (
            <>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle
                  key={`spark${i}`}
                  cx={100 + i * 30}
                  cy={80 + (i % 3) * 30}
                  r="2"
                  fill="#fbbf24"
                  style={{ animation: `sparkle-float 2s ease-in-out ${i * 300}ms infinite` }}
                />
              ))}
            </>
          )}
        </svg>
      </div>

      {/* Text */}
      <div
        className="absolute bottom-[18%] text-center"
        style={{ transition: "all 0.8s ease", opacity: phase !== "enter" && phase !== "exit" ? 1 : 0 }}
      >
        <h1
          className="text-3xl font-bold tracking-[0.3em] text-white mb-2"
          style={{
            textShadow: "0 0 30px rgba(251,191,36,0.4), 0 0 60px rgba(251,191,36,0.2)",
          }}
        >
          BEHT JAMAA
        </h1>
        <p
          className="text-sm tracking-widest text-amber-200/60"
          style={{ transition: "all 0.5s" }}
        >
          {phase === "closed" || phase === "enter"
            ? "The Word of God"
            : phase === "glow"
            ? "His Light Shines"
            : "Faith • Hope • Love"}
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-10 flex gap-2">
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
