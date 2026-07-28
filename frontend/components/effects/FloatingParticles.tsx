"use client";

import { useMemo } from "react";

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

/* Pure CSS animations — zero JS per frame, GPU composited */
export function FloatingParticles({ count = 18, className = "" }: FloatingParticlesProps) {
  const particles = useMemo(() => {
    const seed = (n: number) => ((n * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: seed(i) * 100,
      y: seed(i + 7) * 100,
      size: 1 + seed(i + 3) * 2,
      duration: 10 + seed(i + 5) * 8,
      delay: -(seed(i + 2) * 12),
    }));
  }, [count]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#d4af37]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0.2,
            animation: `particle-float ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes particle-float {
          0%, 100% { transform: translateY(0); opacity: 0.12; }
          50% { transform: translateY(-28px); opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
