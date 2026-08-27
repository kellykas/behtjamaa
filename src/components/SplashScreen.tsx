import { useState, useEffect } from "react";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"enter" | "preaching" | "praying" | "exit">("enter");

  useEffect(() => {
    // Animation timeline
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("preaching"), 500));
    timers.push(setTimeout(() => setPhase("praying"), 2500));
    timers.push(setTimeout(() => setPhase("exit"), 4000));
    timers.push(setTimeout(() => onComplete(), 4800));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #0c1220 0%, #162032 40%, #1a1a2e 70%, #0f0f23 100%)",
      }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full splash-orb"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
            top: "-15%",
            left: "10%",
            filter: "blur(80px)",
            animation: "orb-drift-1 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full splash-orb"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)",
            bottom: "-10%",
            right: "15%",
            filter: "blur(80px)",
            animation: "orb-drift-2 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full splash-orb"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
            top: "40%",
            left: "50%",
            filter: "blur(80px)",
            animation: "orb-drift-3 10s ease-in-out infinite",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Scene container */}
        <div className="relative w-[320px] h-[280px] md:w-[400px] md:h-[340px]">
          {/* Ground / Platform */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[280px] h-[60px] md:w-[340px] rounded-full"
            style={{
              background: "linear-gradient(180deg, rgba(59,130,246,0.2) 0%, transparent 100%)",
              filter: "blur(20px)",
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          />

          {/* Preacher figure */}
          <div
            className={`absolute bottom-[40px] left-[60px] md:left-[80px] transition-all duration-1000 ${
              phase === "preaching" || phase === "praying"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            {/* Body */}
            <div className="relative">
              {/* Head */}
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full relative"
                style={{
                  background: "linear-gradient(135deg, #8B6914 0%, #A0792B 50%, #6B4F10 100%)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)",
                }}
              >
                {/* Eyes */}
                <div className="absolute top-[35%] left-[25%] w-2 h-2.5 rounded-full bg-white">
                  <div className="absolute top-0.5 left-0.5 w-1 h-1.5 rounded-full bg-[#1a1a2e]" />
                </div>
                <div className="absolute top-[35%] right-[25%] w-2 h-2.5 rounded-full bg-white">
                  <div className="absolute top-0.5 left-0.5 w-1 h-1.5 rounded-full bg-[#1a1a2e]" />
                </div>
                {/* Mouth - changes with phase */}
                <div
                  className={`absolute bottom-[25%] left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 ${
                    phase === "preaching" ? "w-4 h-3 bg-[#c0392b]" : "w-5 h-1 bg-[#c0392b]"
                  }`}
                />
                {/* Hair */}
                <div
                  className="absolute -top-1 left-1 right-1 h-6 rounded-t-full"
                  style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)" }}
                />
              </div>

              {/* Body / Suit */}
              <div
                className="w-20 h-24 md:w-24 md:h-28 -mt-2 rounded-t-2xl"
                style={{
                  background: "linear-gradient(180deg, #1e3a5f 0%, #152d4a 100%)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                }}
              >
                {/* Collar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/90 rounded-b-lg" />
                {/* Tie */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-8 bg-red-600 rounded-b-full" />
              </div>

              {/* Arms */}
              <div
                className={`absolute top-16 -right-4 w-8 h-20 rounded-full transition-all duration-700 ${
                  phase === "preaching"
                    ? "rotate-[-30deg] origin-top"
                    : phase === "praying"
                    ? "rotate-[-60deg] origin-top"
                    : "rotate-0"
                }`}
                style={{
                  background: "linear-gradient(180deg, #1e3a5f 0%, #152d4a 100%)",
                  borderRadius: "40%",
                }}
              >
                {/* Hand */}
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                  style={{ background: "#8B6914" }}
                />
              </div>
              <div
                className={`absolute top-16 -left-4 w-8 h-20 rounded-full transition-all duration-700 ${
                  phase === "preaching"
                    ? "rotate-[30deg] origin-top"
                    : phase === "praying"
                    ? "rotate-[60deg] origin-top"
                    : "rotate-0"
                }`}
                style={{
                  background: "linear-gradient(180deg, #1e3a5f 0%, #152d4a 100%)",
                  borderRadius: "40%",
                }}
              >
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                  style={{ background: "#8B6914" }}
                />
              </div>
            </div>
          </div>

          {/* Listener / Congregant figure */}
          <div
            className={`absolute bottom-[40px] right-[60px] md:right-[80px] transition-all duration-1000 ${
              phase === "preaching"
                ? "opacity-100 translate-y-0"
                : phase === "praying"
                ? "opacity-100 translate-y-0 scale-95"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              {/* Head */}
              <div
                className="w-14 h-14 md:w-18 md:h-18 rounded-full relative"
                style={{
                  background: "linear-gradient(135deg, #6B4F10 0%, #8B6914 50%, #5A4210 100%)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)",
                  width: "3.5rem",
                  height: "3.5rem",
                }}
              >
                {/* Eyes */}
                <div className="absolute top-[35%] left-[25%] w-1.5 h-2 rounded-full bg-white">
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-[#1a1a2e]" />
                </div>
                <div className="absolute top-[35%] right-[25%] w-1.5 h-2 rounded-full bg-white">
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-[#1a1a2e]" />
                </div>
                {/* Mouth */}
                <div
                  className={`absolute bottom-[25%] left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 ${
                    phase === "praying" ? "w-3 h-1.5 bg-[#c0392b]" : "w-3 h-1 bg-[#c0392b]"
                  }`}
                />
                {/* Hair */}
                <div
                  className="absolute -top-1 left-0.5 right-0.5 h-5 rounded-t-full"
                  style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)" }}
                />
              </div>

              {/* Body / Casual shirt */}
              <div
                className="w-16 h-20 -mt-1 rounded-t-xl"
                style={{
                  background: "linear-gradient(180deg, #27ae60 0%, #1e8449 100%)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                }}
              >
                {/* Collar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-white/80 rounded-b" />
              </div>

              {/* Arms */}
              <div
                className={`absolute top-12 -left-3 w-6 h-16 rounded-full transition-all duration-700 ${
                  phase === "praying" ? "rotate-[45deg] origin-top" : "rotate-0"
                }`}
                style={{
                  background: "linear-gradient(180deg, #27ae60 0%, #1e8449 100%)",
                  borderRadius: "40%",
                }}
              >
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full" style={{ background: "#6B4F10" }} />
              </div>
              <div
                className={`absolute top-12 -right-3 w-6 h-16 rounded-full transition-all duration-700 ${
                  phase === "praying" ? "rotate-[-45deg] origin-top" : "rotate-0"
                }`}
                style={{
                  background: "linear-gradient(180deg, #27ae60 0%, #1e8449 100%)",
                  borderRadius: "40%",
                }}
              >
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full" style={{ background: "#6B4F10" }} />
              </div>
            </div>
          </div>

          {/* Speech/Prayer waves */}
          {phase === "preaching" && (
            <div className="absolute top-[60px] left-[140px] md:left-[170px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full border-2 border-blue-400/40"
                  style={{
                    width: `${20 + i * 20}px`,
                    height: `${20 + i * 20}px`,
                    top: `${-i * 15}px`,
                    left: `${-i * 10}px`,
                    animation: `speech-pulse 1.5s ease-out ${i * 0.3}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Prayer glow */}
          {phase === "praying" && (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
                animation: "prayer-glow 2s ease-in-out infinite",
              }}
            />
          )}

          {/* Cross symbol during praying */}
          {phase === "praying" && (
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-400/60"
              style={{ animation: "float-up 2s ease-in-out infinite" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="10" y="2" width="4" height="20" rx="1" />
                <rect x="4" y="8" width="16" height="4" rx="1" />
              </svg>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="mt-8 text-center">
          <h2
            className={`text-2xl md:text-3xl font-bold text-white mb-2 transition-all duration-700 ${
              phase === "enter" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            BEHT JAMAA
          </h2>
          <p
            className={`text-white/50 text-sm transition-all duration-700 delay-200 ${
              phase === "enter" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            {phase === "preaching"
              ? "Winning Souls for Christ..."
              : phase === "praying"
              ? "Empowering Through Prayer..."
              : "Boys Evangelists of the Holy Trinity"}
          </p>
        </div>

        {/* Loading dots */}
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/30"
              style={{
                animation: `dot-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
