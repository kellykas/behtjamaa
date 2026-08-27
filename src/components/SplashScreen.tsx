import { useState, useEffect } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "closed" | "glow" | "open" | "read" | "exit">("enter");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("closed"), 600),
      setTimeout(() => setPhase("glow"), 1600),
      setTimeout(() => setPhase("open"), 2600),
      setTimeout(() => setPhase("read"), 3600),
      setTimeout(() => setPhase("exit"), 5000),
      setTimeout(() => onComplete(), 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const isOpen = phase === "open" || phase === "read";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-800 ${
        phase === "enter" || phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #111827 40%, #0f172a 100%)" }}
    >
      {/* Deep ambient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-80 h-80 rounded-full bg-blue-900/25 blur-[120px]" style={{ animation: "float-orb 10s ease-in-out infinite" }} />
        <div className="absolute bottom-[15%] right-[10%] w-64 h-64 rounded-full bg-purple-900/20 blur-[100px]" style={{ animation: "float-orb 12s ease-in-out infinite 3s" }} />
        <div className="absolute top-[40%] left-[50%] w-48 h-48 rounded-full bg-amber-800/15 blur-[80px] -translate-x-1/2 -translate-y-1/2" style={{ animation: "float-orb 14s ease-in-out infinite 5s" }} />
      </div>

      {/* Bible SVG — realistic */}
      <div
        className="relative z-10"
        style={{
          transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: isOpen ? "scale(1.08)" : "scale(1)",
          filter: isOpen ? "drop-shadow(0 30px 60px rgba(0,0,0,0.7))" : "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
        }}
      >
        <svg viewBox="0 0 360 280" width="360" height="280">
          <defs>
            {/* Leather texture gradient */}
            <linearGradient id="leatherDark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b1f0b" />
              <stop offset="30%" stopColor="#5c3317" />
              <stop offset="60%" stopColor="#4a2a12" />
              <stop offset="100%" stopColor="#2e1a08" />
            </linearGradient>
            <linearGradient id="leatherMid" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stopColor="#6b3a1f" />
              <stop offset="50%" stopColor="#5c3317" />
              <stop offset="100%" stopColor="#3b1f0b" />
            </linearGradient>
            {/* Page paper */}
            <linearGradient id="pageLeft" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#f5f0e6" />
              <stop offset="40%" stopColor="#faf7f0" />
              <stop offset="100%" stopColor="#e8e2d6" />
            </linearGradient>
            <linearGradient id="pageRight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#faf7f0" />
              <stop offset="60%" stopColor="#f5f0e6" />
              <stop offset="100%" stopColor="#e8e2d6" />
            </linearGradient>
            {/* Gold edge */}
            <linearGradient id="goldEdge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5d77a" />
              <stop offset="30%" stopColor="#d4a554" />
              <stop offset="70%" stopColor="#c4943e" />
              <stop offset="100%" stopColor="#b8862e" />
            </linearGradient>
            {/* Glow */}
            <radialGradient id="bibleGlow">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
            {/* Spine shadow */}
            <linearGradient id="spineShadow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1a0f05" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#2e1a08" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1a0f05" stopOpacity="0.4" />
            </linearGradient>
            {/* Subtle noise filter for leather */}
            <filter id="leatherNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
              <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
              <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" />
            </filter>
          </defs>

          {/* ===== CLOSED STATE: Full Bible ===== */}
          {!isOpen && (
            <g style={{ transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              {/* Back cover shadow */}
              <rect x="72" y="42" width="216" height="196" rx="6" fill="#0a0500" opacity="0.3" />

              {/* Back cover */}
              <rect x="68" y="38" width="220" height="196" rx="6" fill="url(#leatherDark)" stroke="#2e1a08" strokeWidth="1" />

              {/* Leather grain overlay */}
              <rect x="68" y="38" width="220" height="196" rx="6" fill="url(#leatherDark)" filter="url(#leatherNoise)" opacity="0.3" />

              {/* Gold page edges (top) */}
              <rect x="72" y="36" width="212" height="4" rx="1" fill="url(#goldEdge)" />
              {/* Gold page edges (right side) */}
              <rect x="280" y="42" width="4" height="188" rx="1" fill="url(#goldEdge)" opacity="0.8" />
              {/* Gold page edges (bottom) */}
              <rect x="72" y="230" width="212" height="3" rx="1" fill="url(#goldEdge)" opacity="0.6" />

              {/* Spine */}
              <rect x="64" y="36" width="12" height="200" rx="3" fill="#2e1a08" />
              <rect x="66" y="36" width="3" height="200" fill="#1a0f05" opacity="0.5" />
              {/* Spine ribs */}
              {[60, 90, 120, 150, 180].map((y) => (
                <line key={`rib${y}`} x1="64" y1={y} x2="76" y2={y} stroke="#4a2a12" strokeWidth="1" opacity="0.5" />
              ))}

              {/* Front cover */}
              <rect x="70" y="36" width="216" height="196" rx="5" fill="url(#leatherMid)" stroke="#3b1f0b" strokeWidth="0.5" />

              {/* Cover border inset */}
              <rect x="82" y="48" width="192" height="172" rx="3" fill="none" stroke="#8b6942" strokeWidth="0.8" opacity="0.4" />

              {/* Inner decorative border */}
              <rect x="88" y="54" width="180" height="160" rx="2" fill="none" stroke="#8b6942" strokeWidth="0.5" opacity="0.25" />

              {/* Gold cross on cover */}
              <g opacity={phase === "glow" ? 0.5 : 1} style={{ transition: "opacity 1s" }}>
                {/* Cross shadow */}
                <rect x="161" y="97" width="22" height="68" rx="2" fill="#000" opacity="0.2" />
                <rect x="143" y="113" width="58" height="20" rx="2" fill="#000" opacity="0.2" />
                {/* Cross body */}
                <rect x="158" y="92" width="22" height="68" rx="2" fill="url(#goldEdge)" />
                <rect x="140" y="108" width="58" height="20" rx="2" fill="url(#goldEdge)" />
                {/* Cross highlight */}
                <rect x="160" y="94" width="4" height="64" rx="1" fill="#f5d77a" opacity="0.5" />
                <rect x="142" y="110" width="54" height="4" rx="1" fill="#f5d77a" opacity="0.4" />
              </g>

              {/* "HOLY BIBLE" embossed text */}
              <text
                x="178"
                y="190"
                fontSize="9"
                fill="#8b6942"
                textAnchor="middle"
                fontFamily="Georgia, serif"
                letterSpacing="3"
                opacity="0.5"
                fontWeight="bold"
              >
                HOLY BIBLE
              </text>
            </g>
          )}

          {/* ===== OPEN STATE: Two pages ===== */}
          {isOpen && (
            <g style={{ transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
              {/* Left page shadow */}
              <rect x="18" y="34" width="156" height="212" rx="4" fill="#0a0500" opacity="0.15" />

              {/* Left page */}
              <rect x="14" y="30" width="156" height="212" rx="4" fill="url(#pageLeft)" stroke="#d4cfc5" strokeWidth="0.5" />

              {/* Left page fold shadow */}
              <rect x="162" y="30" width="8" height="212" fill="#d4cfc5" opacity="0.3" />

              {/* Right page shadow */}
              <rect x="188" y="34" width="156" height="212" rx="4" fill="#0a0500" opacity="0.15" />

              {/* Right page */}
              <rect x="190" y="30" width="156" height="212" rx="4" fill="url(#pageRight)" stroke="#d4cfc5" strokeWidth="0.5" />

              {/* Right page fold shadow */}
              <rect x="188" y="30" width="6" height="212" fill="#d4cfc5" opacity="0.3" />

              {/* Spine center */}
              <rect x="166" y="28" width="24" height="216" rx="2" fill="#3b1f0b" opacity="0.8" />
              <rect x="170" y="28" width="2" height="216" fill="#1a0f05" opacity="0.4" />

              {/* Gold page edges (visible on open) */}
              <rect x="14" y="238" width="156" height="3" rx="1" fill="url(#goldEdge)" opacity="0.5" />
              <rect x="190" y="238" width="156" height="3" rx="1" fill="url(#goldEdge)" opacity="0.5" />

              {/* Left page header */}
              <text x="92" y="48" fontSize="5" fill="#8b7355" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" opacity={phase === "read" ? 0.6 : 0} style={{ transition: "opacity 1s 0.3s" }}>
                THE GOSPEL ACCORDING TO JOHN
              </text>
              <line x1="40" y1="52" x2="144" y2="52" stroke="#d4cfc5" strokeWidth="0.3" opacity={phase === "read" ? 0.5 : 0} style={{ transition: "opacity 1s 0.4s" }} />

              {/* Right page header */}
              <text x="268" y="48" fontSize="5" fill="#8b7355" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" opacity={phase === "read" ? 0.6 : 0} style={{ transition: "opacity 1s 0.4s" }}>
                CHAPTER 1
              </text>
              <line x1="204" y1="52" x2="332" y2="52" stroke="#d4cfc5" strokeWidth="0.3" opacity={phase === "read" ? 0.5 : 0} style={{ transition: "opacity 1s 0.5s" }} />

              {/* Left page text lines */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                  <rect
                    key={`l${i}`}
                    x="30"
                    y={58 + i * 11}
                    width={80 + (i % 4) * 10 - (i % 3) * 8}
                    height="2.5"
                    rx="1"
                    fill="#6b5e50"
                    style={{
                      transition: `all 0.7s ease ${i * 60}ms`,
                      opacity: phase === "read" ? (0.5 + (i % 3) * 0.15) : 0,
                    }}
                  />
                ))}
                {/* Verse number */}
                <text x="24" y="70" fontSize="7" fill="#6366f1" fontWeight="bold" fontFamily="Georgia, serif" style={{ transition: "opacity 1s 0.6s", opacity: phase === "read" ? 1 : 0 }}>
                  1
                </text>
                {/* Drop cap style first letter */}
                <text x="30" y="68" fontSize="14" fill="#5c3317" fontFamily="Georgia, serif" fontWeight="bold" style={{ transition: "opacity 1s 0.5s", opacity: phase === "read" ? 0.7 : 0 }}>
                  I
                </text>
                <text x="37" y="68" fontSize="5" fill="#6b5e50" fontFamily="Georgia, serif" style={{ transition: "opacity 1s 0.55s", opacity: phase === "read" ? 0.6 : 0 }}>
                  n the beginning was the Word
                </text>

                {/* Verse number 2 */}
                <text x="24" y="92" fontSize="7" fill="#6366f1" fontWeight="bold" fontFamily="Georgia, serif" style={{ transition: "opacity 1s 1s", opacity: phase === "read" ? 1 : 0 }}>
                  2
                </text>
                <text x="30" y="92" fontSize="5" fill="#6b5e50" fontFamily="Georgia, serif" style={{ transition: "opacity 1s 1s", opacity: phase === "read" ? 0.6 : 0 }}>
                  He was with God in the beginn
                </text>
                <rect x="30" y="94" width="75" height="2.5" rx="1" fill="#6b5e50" opacity={phase === "read" ? 0.4 : 0} style={{ transition: "opacity 0.7s 1.1s" }} />

                {/* Verse number 3 */}
                <text x="24" y="114" fontSize="7" fill="#6366f1" fontWeight="bold" fontFamily="Georgia, serif" style={{ transition: "opacity 1s 1.3s", opacity: phase === "read" ? 1 : 0 }}>
                  3
                </text>
                {[0, 1, 2, 3, 4].map((j) => (
                  <rect key={`l2${j}`} x="30" y={106 + j * 11} width={70 + (j % 3) * 14} height="2.5" rx="1" fill="#6b5e50" style={{ transition: `opacity 0.7s ${1.3 + j * 0.1}s`, opacity: phase === "read" ? (0.45 + (j % 2) * 0.1) : 0 }} />
                ))}
              </g>

              {/* Right page text lines */}
              <g>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                  <rect
                    key={`r${i}`}
                    x="206"
                    y={58 + i * 11}
                    width={85 + (i % 3) * 12 - (i % 2) * 10}
                    height="2.5"
                    rx="1"
                    fill="#6b5e50"
                    style={{
                      transition: `all 0.7s ease ${i * 60 + 150}ms`,
                      opacity: phase === "read" ? (0.5 + (i % 3) * 0.15) : 0,
                    }}
                  />
                ))}
                {/* Verse continuation */}
                <text x="200" y="70" fontSize="7" fill="#6366f1" fontWeight="bold" fontFamily="Georgia, serif" style={{ transition: "opacity 1s 0.7s", opacity: phase === "read" ? 1 : 0 }}>
                  4
                </text>
                <rect x="206" y="62" width="90" height="2.5" rx="1" fill="#6b5e50" opacity={phase === "read" ? 0.5 : 0} style={{ transition: "opacity 0.7s 0.8s" }} />

                <text x="200" y="92" fontSize="7" fill="#6366f1" fontWeight="bold" fontFamily="Georgia, serif" style={{ transition: "opacity 1s 1.1s", opacity: phase === "read" ? 1 : 0 }}>
                  5
                </text>
                {[0, 1, 2, 3, 4, 5].map((j) => (
                  <rect key={`r2${j}`} x="206" y={106 + j * 11} width={80 + (j % 3) * 10} height="2.5" rx="1" fill="#6b5e50" style={{ transition: `opacity 0.7s ${1.2 + j * 0.1}s`, opacity: phase === "read" ? (0.45 + (j % 2) * 0.1) : 0 }} />
                ))}
              </g>

              {/* Page corner curl hint */}
              <path d="M 170 240 Q 172 236 176 236 L 170 242 Z" fill="#e8e2d6" opacity={phase === "read" ? 0.5 : 0} style={{ transition: "opacity 1s 1s" }} />
            </g>
          )}

          {/* Golden glow effect */}
          {(phase === "glow" || isOpen) && (
            <ellipse
              cx="180"
              cy="140"
              rx={isOpen ? 100 : 70}
              ry={isOpen ? 60 : 45}
              fill="url(#bibleGlow)"
              style={{ animation: "pulse-glow 2.5s ease-in-out infinite", transition: "all 1.2s" }}
            />
          )}

          {/* Golden sparkle particles */}
          {phase === "read" && (
            <>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <circle
                  key={`spark${i}`}
                  cx={120 + (i * 22)}
                  cy={90 + (i % 3) * 35}
                  r={1.5 + (i % 2)}
                  fill="#fbbf24"
                  style={{ animation: `sparkle-float 2.5s ease-in-out ${i * 280}ms infinite` }}
                />
              ))}
            </>
          )}
        </svg>
      </div>

      {/* Text */}
      <div
        className="absolute bottom-[16%] text-center"
        style={{ transition: "all 0.8s ease", opacity: phase !== "enter" && phase !== "exit" ? 1 : 0 }}
      >
        <h1
          className="text-3xl font-bold tracking-[0.3em] text-white mb-3"
          style={{
            textShadow: "0 0 30px rgba(251,191,36,0.4), 0 0 60px rgba(251,191,36,0.2)",
          }}
        >
          BEHT JAMAA
        </h1>
        <p
          className="text-sm tracking-[0.2em] font-semibold text-amber-200/70 uppercase"
          style={{ transition: "all 0.5s" }}
        >
          {phase === "closed" || phase === "enter"
            ? "The Word of God"
            : phase === "glow"
            ? "His Light Shines"
            : "WE THE BOYS IN THE HOUSE"}
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
