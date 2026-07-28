"use client";

import { useEffect, useState } from "react";

const TARGET = new Date("2026-09-01T20:00:00").getTime();

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer() {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, TARGET - Date.now());
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 md:gap-6">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="glass-luxury glow-gold rounded-2xl px-4 py-6 text-center md:px-6 md:py-8"
        >
          <p className="font-[family-name:var(--font-display)] text-3xl text-gold-gradient md:text-5xl">
            {pad(unit.value)}
          </p>
          <p className="mt-2 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.25em] text-white/40 uppercase">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  );
}
