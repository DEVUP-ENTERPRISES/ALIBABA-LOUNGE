"use client";

/* Pure CSS smoke — no JS animations, GPU composited via opacity/transform */
export function SmokeOverlay({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="smoke-orb-1 absolute -bottom-1/4 left-0 h-[70%] w-full opacity-40"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(180,180,190,0.15), transparent 70%)" }}
      />
      <div className="smoke-orb-2 absolute top-1/4 -left-1/4 h-[60%] w-[60%] rounded-full opacity-20"
        style={{ background: "rgba(255,255,255,0.06)", filter: "blur(80px)" }}
      />
      <div className="smoke-orb-3 absolute top-1/3 -right-1/4 h-[50%] w-[50%] rounded-full opacity-15"
        style={{ background: "rgba(212,175,55,0.08)", filter: "blur(70px)" }}
      />
      <style>{`
        @keyframes smoke1 { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:.42;transform:scale(1.04)} }
        @keyframes smoke2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-20px)} }
        @keyframes smoke3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,25px)} }
        .smoke-orb-1{animation:smoke1 12s ease-in-out infinite}
        .smoke-orb-2{animation:smoke2 18s ease-in-out infinite}
        .smoke-orb-3{animation:smoke3 14s ease-in-out infinite}
      `}</style>
    </div>
  );
}
