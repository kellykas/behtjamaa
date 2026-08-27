import { useState, useEffect } from "react";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"enter" | "preaching" | "praying" | "exit">("enter");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("preaching"), 500));
    timers.push(setTimeout(() => setPhase("praying"), 2800));
    timers.push(setTimeout(() => setPhase("exit"), 4500));
    timers.push(setTimeout(() => onComplete(), 5300));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(180deg, #87CEEB 0%, #E8D5B7 40%, #D4A574 70%, #8B7355 100%)",
      }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sky gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #87CEEB 0%, #B5D8E8 30%, #E8D5B7 60%, #D4A574 100%)" }} />

        {/* House silhouette */}
        <div className="absolute bottom-0 right-[10%] md:right-[15%]">
          <svg width="200" height="180" viewBox="0 0 200 180" fill="none" className="opacity-30">
            <rect x="30" y="80" width="140" height="100" fill="#8B4513" />
            <polygon points="100,20 20,80 180,80" fill="#A0522D" />
            <rect x="60" y="100" width="30" height="40" fill="#654321" />
            <rect x="120" y="100" width="25" height="25" fill="#654321" />
            <rect x="125" y="105" width="15" height="15" fill="#87CEEB" opacity="0.5" />
          </svg>
        </div>

        {/* Trees */}
        <div className="absolute bottom-0 left-[5%]">
          <svg width="120" height="140" viewBox="0 0 120 140" fill="none" className="opacity-40">
            <rect x="55" y="90" width="10" height="50" fill="#5D4037" />
            <ellipse cx="60" cy="60" rx="50" ry="45" fill="#2E7D32" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-[25%]">
          <svg width="100" height="120" viewBox="0 0 100 120" fill="none" className="opacity-35">
            <rect x="45" y="80" width="10" height="40" fill="#5D4037" />
            <ellipse cx="50" cy="55" rx="40" ry="38" fill="#388E3C" />
          </svg>
        </div>

        {/* Mountains in background */}
        <svg className="absolute bottom-[40%] left-0 right-0 w-full opacity-20" viewBox="0 0 1200 200" fill="none">
          <path d="M0,200 L200,80 L400,150 L600,40 L800,120 L1000,60 L1200,200 Z" fill="#6B5B4F" />
        </svg>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-[30%]" style={{ background: "linear-gradient(180deg, #C4A882 0%, #A08060 50%, #8B7355 100%)" }} />

        {/* Path/road */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px]" style={{ background: "linear-gradient(180deg, #B8A080 0%, #9C8060 100%)", borderRadius: "50% 50% 0 0", opacity: 0.6 }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Scene container */}
        <div className="relative w-[320px] h-[380px] md:w-[400px] md:h-[450px]">
          {/* Boy 1 - Orange striped polo (left) */}
          <div
            className={`absolute bottom-[60px] left-[30px] md:left-[50px] transition-all duration-1000 ${
              phase === "preaching" || phase === "praying"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              {/* Head */}
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-[45%] relative"
                style={{
                  background: "linear-gradient(135deg, #F5D0A9 0%, #E8C090 50%, #D4A574 100%)",
                  boxShadow: "0 6px 25px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.2)",
                }}
              >
                {/* Eyes - big cartoon style */}
                <div className="absolute top-[38%] left-[18%] w-5 h-6 rounded-full bg-white shadow-inner">
                  <div
                    className="absolute top-1 left-1 w-3 h-4 rounded-full"
                    style={{ background: "linear-gradient(135deg, #8B4513 0%, #5D3A1A 100%)" }}
                  />
                  <div className="absolute top-1.5 left-1.5 w-1.5 h-2 rounded-full bg-[#1a1a1a]" />
                  <div className="absolute top-1 left-2 w-1 h-1 rounded-full bg-white" />
                </div>
                <div className="absolute top-[38%] right-[18%] w-5 h-6 rounded-full bg-white shadow-inner">
                  <div
                    className="absolute top-1 left-0.5 w-3 h-4 rounded-full"
                    style={{ background: "linear-gradient(135deg, #8B4513 0%, #5D3A1A 100%)" }}
                  />
                  <div className="absolute top-1.5 left-1 w-1.5 h-2 rounded-full bg-[#1a1a1a]" />
                  <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-white" />
                </div>
                {/* Eyebrows */}
                <div className="absolute top-[28%] left-[15%] w-5 h-1 bg-[#5D3A1A] rounded-full -rotate-6" />
                <div className="absolute top-[28%] right-[15%] w-5 h-1 bg-[#5D3A1A] rounded-full rotate-6" />
                {/* Nose */}
                <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-2 h-1.5 rounded-full bg-[#D4A060]" />
                {/* Mouth */}
                <div
                  className={`absolute bottom-[18%] left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 ${
                    phase === "preaching" ? "w-5 h-3 bg-[#c0392b]" : phase === "praying" ? "w-4 h-2 bg-[#c0392b]" : "w-4 h-1.5 bg-[#c0392b]"
                  }`}
                />
                {/* Hair - messy brown */}
                <div className="absolute -top-2 left-2 right-2 h-8 rounded-t-[50%]" style={{ background: "linear-gradient(180deg, #6B4226 0%, #8B5A2B 50%, #5D3A1A 100%)" }}>
                  <div className="absolute -top-1 left-1 w-4 h-4 rounded-full bg-[#6B4226]" />
                  <div className="absolute -top-0.5 right-2 w-3 h-3 rounded-full bg-[#7B5230]" />
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-3 rounded-full bg-[#5D3A1A]" />
                </div>
                {/* Freckles */}
                <div className="absolute top-[55%] left-[15%] flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-[#C4956A]" />
                  <div className="w-1 h-1 rounded-full bg-[#C4956A]" />
                </div>
                <div className="absolute top-[55%] right-[15%] flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-[#C4956A]" />
                  <div className="w-1 h-1 rounded-full bg-[#C4956A]" />
                </div>
                {/* Ears */}
                <div className="absolute top-[40%] -left-2 w-4 h-5 rounded-full" style={{ background: "linear-gradient(135deg, #E8C090 0%, #D4A574 100%)" }} />
                <div className="absolute top-[40%] -right-2 w-4 h-5 rounded-full" style={{ background: "linear-gradient(135deg, #E8C090 0%, #D4A574 100%)" }} />
              </div>

              {/* Body - Orange striped polo */}
              <div
                className="w-24 h-28 md:w-28 md:h-32 -mt-3 rounded-t-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, #E74C3C 0%, #C0392B 100%)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                }}
              >
                {/* Stripes */}
                <div className="absolute top-[30%] left-0 right-0 h-3 bg-white/80" />
                <div className="absolute top-[50%] left-0 right-0 h-3 bg-white/80" />
                <div className="absolute top-[70%] left-0 right-0 h-3 bg-white/80" />
                {/* Collar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-4 bg-[#E74C3C] rounded-b-lg border-b-2 border-white/30" />
                {/* Buttons */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                </div>
              </div>

              {/* Arms */}
              {/* Right arm - extends toward listener during praying */}
              <div
                className={`absolute top-20 -right-5 w-8 h-24 rounded-full transition-all duration-700 ${
                  phase === "preaching"
                    ? "rotate-[-25deg] origin-top"
                    : phase === "praying"
                    ? "rotate-[-70deg] origin-top translate-x-4"
                    : "rotate-[-10deg] origin-top"
                }`}
                style={{
                  background: "linear-gradient(180deg, #E74C3C 0%, #C0392B 100%)",
                  borderRadius: "40%",
                }}
              >
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                  style={{ background: "linear-gradient(135deg, #F5D0A9 0%, #E8C090 100%)" }}
                />
              </div>
              {/* Left arm */}
              <div
                className={`absolute top-20 -left-5 w-8 h-24 rounded-full transition-all duration-700 ${
                  phase === "preaching"
                    ? "rotate-[25deg] origin-top"
                    : phase === "praying"
                    ? "rotate-[15deg] origin-top"
                    : "rotate-[10deg] origin-top"
                }`}
                style={{
                  background: "linear-gradient(180deg, #E74C3C 0%, #C0392B 100%)",
                  borderRadius: "40%",
                }}
              >
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                  style={{ background: "linear-gradient(135deg, #F5D0A9 0%, #E8C090 100%)" }}
                />
              </div>

              {/* Legs - jeans */}
              <div className="flex gap-2 -mt-1">
                <div className="w-10 h-16 rounded-b-lg" style={{ background: "linear-gradient(180deg, #4A6FA5 0%, #3D5A80 100%)" }} />
                <div className="w-10 h-16 rounded-b-lg" style={{ background: "linear-gradient(180deg, #4A6FA5 0%, #3D5A80 100%)" }} />
              </div>
              {/* Shoes */}
              <div className="flex gap-3 -mt-1">
                <div className="w-11 h-4 rounded-b-lg rounded-r-lg" style={{ background: "linear-gradient(180deg, #8B7355 0%, #6B5340 100%)" }} />
                <div className="w-11 h-4 rounded-b-lg rounded-l-lg" style={{ background: "linear-gradient(180deg, #8B7355 0%, #6B5340 100%)" }} />
              </div>
            </div>
          </div>

          {/* Boy 2 - Light blue shirt with backpack (right) */}
          <div
            className={`absolute bottom-[60px] right-[30px] md:right-[50px] transition-all duration-1000 ${
              phase === "preaching"
                ? "opacity-100 translate-y-0"
                : phase === "praying"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              {/* Backpack straps visible */}
              <div className="absolute top-16 -left-1 w-3 h-12 bg-[#8B7355] rounded-full -rotate-6" />
              <div className="absolute top-16 -right-1 w-3 h-12 bg-[#8B7355] rounded-full rotate-6" />

              {/* Head */}
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-[45%] relative"
                style={{
                  background: "linear-gradient(135deg, #F5D0A9 0%, #E8C090 50%, #D4A574 100%)",
                  boxShadow: "0 6px 25px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.2)",
                }}
              >
                {/* Eyes - big cartoon style */}
                <div className="absolute top-[38%] left-[18%] w-5 h-6 rounded-full bg-white shadow-inner">
                  <div
                    className="absolute top-1 left-1 w-3 h-4 rounded-full"
                    style={{ background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)" }}
                  />
                  <div className="absolute top-1.5 left-1 w-1.5 h-2 rounded-full bg-[#1a1a1a]" />
                  <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-white" />
                </div>
                <div className="absolute top-[38%] right-[18%] w-5 h-6 rounded-full bg-white shadow-inner">
                  <div
                    className="absolute top-1 left-0.5 w-3 h-4 rounded-full"
                    style={{ background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)" }}
                  />
                  <div className="absolute top-1.5 left-1 w-1.5 h-2 rounded-full bg-[#1a1a1a]" />
                  <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-white" />
                </div>
                {/* Eyebrows */}
                <div className="absolute top-[28%] left-[15%] w-5 h-1 bg-[#5D3A1A] rounded-full -rotate-6" />
                <div className="absolute top-[28%] right-[15%] w-5 h-1 bg-[#5D3A1A] rounded-full rotate-6" />
                {/* Nose */}
                <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-2 h-1.5 rounded-full bg-[#D4A060]" />
                {/* Mouth - concerned/neutral */}
                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-full bg-[#c0392b]" />
                {/* Hair - spiky brown */}
                <div className="absolute -top-3 left-1 right-1 h-10 rounded-t-[40%]" style={{ background: "linear-gradient(180deg, #7B5230 0%, #8B5A2B 50%, #6B4226 100%)" }}>
                  <div className="absolute -top-2 left-2 w-4 h-5 rounded-full bg-[#7B5230] rotate-12" />
                  <div className="absolute -top-3 left-6 w-3 h-5 rounded-full bg-[#8B5A2B] -rotate-6" />
                  <div className="absolute -top-2 right-3 w-4 h-4 rounded-full bg-[#6B4226] rotate-[-15deg]" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-4 rounded-full bg-[#7B5230]" />
                </div>
                {/* Ears */}
                <div className="absolute top-[40%] -left-2 w-4 h-5 rounded-full" style={{ background: "linear-gradient(135deg, #E8C090 0%, #D4A574 100%)" }} />
                <div className="absolute top-[40%] -right-2 w-4 h-5 rounded-full" style={{ background: "linear-gradient(135deg, #E8C090 0%, #D4A574 100%)" }} />
              </div>

              {/* Body - Light blue button-up shirt */}
              <div
                className="w-24 h-28 md:w-28 md:h-32 -mt-3 rounded-t-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, #B0C4DE 0%, #8FAABE 100%)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                }}
              >
                {/* Collar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-5 bg-[#B0C4DE] rounded-b-lg" />
                <div className="absolute top-0 left-[35%] w-2 h-4 bg-[#9FB5C7] rounded-b" />
                <div className="absolute top-0 right-[35%] w-2 h-4 bg-[#9FB5C7] rounded-b" />
                {/* Buttons */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7B9AB0]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7B9AB0]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7B9AB0]" />
                </div>
                {/* Pocket */}
                <div className="absolute top-8 left-3 w-6 h-5 border border-[#8FAABE] rounded-sm" />
              </div>

              {/* Backpack body */}
              <div
                className="absolute top-16 -right-3 w-10 h-16 rounded-lg -z-10"
                style={{
                  background: "linear-gradient(180deg, #8B7355 0%, #6B5340 100%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              />

              {/* Arms */}
              <div
                className={`absolute top-20 -left-5 w-8 h-24 rounded-full transition-all duration-700 ${
                  phase === "praying"
                    ? "rotate-[60deg] origin-top"
                    : "rotate-[10deg] origin-top"
                }`}
                style={{
                  background: "linear-gradient(180deg, #B0C4DE 0%, #8FAABE 100%)",
                  borderRadius: "40%",
                }}
              >
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                  style={{ background: "linear-gradient(135deg, #F5D0A9 0%, #E8C090 100%)" }}
                />
              </div>
              <div
                className={`absolute top-20 -right-5 w-8 h-24 rounded-full transition-all duration-700 ${
                  phase === "praying"
                    ? "rotate-[-60deg] origin-top"
                    : "rotate-[-10deg] origin-top"
                }`}
                style={{
                  background: "linear-gradient(180deg, #B0C4DE 0%, #8FAABE 100%)",
                  borderRadius: "40%",
                }}
              >
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full"
                  style={{ background: "linear-gradient(135deg, #F5D0A9 0%, #E8C090 100%)" }}
                />
              </div>

              {/* Legs - jeans */}
              <div className="flex gap-2 -mt-1">
                <div className="w-10 h-16 rounded-b-lg" style={{ background: "linear-gradient(180deg, #4A6FA5 0%, #3D5A80 100%)" }} />
                <div className="w-10 h-16 rounded-b-lg" style={{ background: "linear-gradient(180deg, #4A6FA5 0%, #3D5A80 100%)" }} />
              </div>
              {/* Shoes */}
              <div className="flex gap-3 -mt-1">
                <div className="w-11 h-4 rounded-b-lg rounded-r-lg" style={{ background: "linear-gradient(180deg, #8B7355 0%, #6B5340 100%)" }} />
                <div className="w-11 h-4 rounded-b-lg rounded-l-lg" style={{ background: "linear-gradient(180deg, #8B7355 0%, #6B5340 100%)" }} />
              </div>
            </div>
          </div>

          {/* Speech waves during preaching */}
          {phase === "preaching" && (
            <div className="absolute top-[100px] left-[140px] md:left-[170px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full border-2 border-white/40"
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

          {/* Prayer glow between them */}
          {phase === "praying" && (
            <div
              className="absolute top-[120px] left-[140px] md:left-[170px] w-[180px] h-[180px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0.15) 40%, transparent 70%)",
                animation: "prayer-glow 2s ease-in-out infinite",
                filter: "blur(8px)",
              }}
            />
          )}

          {/* Rising prayer particles */}
          {phase === "praying" && (
            <div className="absolute top-[80px] left-[160px] md:left-[190px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-yellow-400/70"
                  style={{
                    animation: `float-particle 2.5s ease-out ${i * 0.5}s infinite`,
                    left: `${i * 10}px`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Cross during praying */}
          {phase === "praying" && (
            <div
              className="absolute top-[40px] left-[170px] md:left-[200px] text-yellow-400/70"
              style={{ animation: "float-up 2s ease-in-out infinite" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="10" y="2" width="4" height="20" rx="1" />
                <rect x="4" y="8" width="16" height="4" rx="1" />
              </svg>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="mt-4 text-center">
          <h2
            className={`text-2xl md:text-3xl font-bold text-white mb-2 transition-all duration-700 drop-shadow-lg ${
              phase === "enter" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            BEHT JAMAA
          </h2>
          <p
            className={`text-white/80 text-sm drop-shadow-md transition-all duration-700 delay-200 ${
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
        <div className="mt-4 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/50"
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
