"use client";

export function AmbientGlow() {
  return (
    <div
      aria-hidden={true}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -top-1/4 left-1/4 h-[60vh] w-[60vh] rounded-full bg-[#d4af37]/[0.04] blur-[120px]" />
      <div className="absolute top-1/2 -right-1/4 h-[50vh] w-[50vh] rounded-full bg-[#8b6914]/[0.06] blur-[100px]" />
      <div className="absolute -bottom-1/4 left-1/3 h-[40vh] w-[40vh] rounded-full bg-[#d4af37]/[0.03] blur-[90px]" />
    </div>
  );
}
