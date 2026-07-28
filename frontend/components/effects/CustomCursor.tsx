"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  hue: number;
  spin: number;
}

export function CustomCursor() {
  const particles = useRef<SmokeParticle[]>([]);
  const rafRef = useRef<number>(0);
  const prevPos = useRef({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const rx = useSpring(mx, { stiffness: 300, damping: 28, mass: 0.6 });
  const ry = useSpring(my, { stiffness: 300, damping: 28, mass: 0.6 });

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    document.body.classList.add("custom-cursor-active");
    setVisible(true);

    // Create canvas imperatively so it's available immediately
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;z-index:9996;pointer-events:none;mix-blend-mode:screen;";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnParticles = (cx: number, cy: number, count: number, burst = false) => {
      for (let i = 0; i < count; i++) {
        const angle = burst
          ? (Math.PI * 2 * i) / count + Math.random() * 0.5
          : Math.random() * Math.PI * 2;
        const speed = burst
          ? Math.random() * 3 + 1.5
          : Math.random() * 1.4 + 0.3;
        particles.current.push({
          x: cx + (Math.random() - 0.5) * 4,
          y: cy + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed * (burst ? 1 : 0.5),
          vy: burst ? Math.sin(angle) * speed : -(speed * 0.8 + Math.random() * 0.6),
          life: 1,
          decay: burst
            ? Math.random() * 0.025 + 0.02
            : Math.random() * 0.012 + 0.006,
          size: burst ? Math.random() * 6 + 3 : Math.random() * 10 + 5,
          hue: 38 + Math.random() * 18,
          spin: (Math.random() - 0.5) * 0.08,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.life > 0);

      for (const p of particles.current) {
        p.life -= p.decay;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.15;
        p.vy -= 0.018;
        p.vx *= 0.97;
        p.vy *= 0.98;
        p.size *= 1.018;

        const a = Math.max(0, p.life) * 0.38;
        const r = p.size;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grad.addColorStop(0, `hsla(${p.hue}, 85%, 65%, ${a})`);
        grad.addColorStop(0.45, `hsla(${p.hue}, 70%, 50%, ${a * 0.55})`);
        grad.addColorStop(1, `hsla(${p.hue}, 60%, 35%, 0)`);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin * (1 - p.life));
        ctx.translate(-p.x, -p.y);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, r, r * 1.2, p.spin * 10, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - prevPos.current.x;
      const dy = e.clientY - prevPos.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      prevPos.current = { x: e.clientX, y: e.clientY };
      mx.set(e.clientX);
      my.set(e.clientY);
      const count = speed > 8 ? 4 : speed > 3 ? 2 : 1;
      spawnParticles(e.clientX, e.clientY, count);
    };

    const onDown = (e: MouseEvent) => {
      setClicking(true);
      spawnParticles(e.clientX, e.clientY, 14, true);
    };
    const onUp = () => setClicking(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    const attachHoverListeners = () => {
      document
        .querySelectorAll("a, button, [data-magnetic], input, textarea, select, label, [role='button']")
        .forEach((el) => {
          el.addEventListener("mouseenter", () => setHovering(true));
          el.addEventListener("mouseleave", () => setHovering(false));
        });
    };
    attachHoverListeners();

    const observer = new MutationObserver(attachHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      canvas.remove();
    };
  }, [mx, my]);

  if (!visible) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{ x: rx, y: ry }}
      >
        <motion.div
          animate={{
            width:   hovering ? 56 : clicking ? 18 : 34,
            height:  hovering ? 56 : clicking ? 18 : 34,
            x:       hovering ? -28 : clicking ? -9 : -17,
            y:       hovering ? -28 : clicking ? -9 : -17,
            opacity: clicking ? 0.5 : 1,
          }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="rounded-full border border-[#d4af37]/50"
          style={{
            boxShadow: hovering
              ? "0 0 22px 6px rgba(212,175,55,0.25), inset 0 0 12px rgba(212,175,55,0.12)"
              : "0 0 10px 3px rgba(212,175,55,0.15)",
          }}
        />
      </motion.div>

      {/* Inner ember dot — instant follow */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{ x: mx, y: my }}
      >
        <motion.div
          animate={{
            scale:   clicking ? 0.3 : hovering ? 1.6 : 1,
            opacity: hovering ? 0.85 : 1,
          }}
          transition={{ type: "spring", stiffness: 700, damping: 35 }}
          className="h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4af37]"
          style={{
            boxShadow: "0 0 8px 3px rgba(212,175,55,0.9), 0 0 18px 6px rgba(212,175,55,0.35)",
          }}
        />
      </motion.div>

      {/* Hover label */}
      <AnimatePresence>
        {hovering && (
          <motion.div
            key="hover-label"
            className="pointer-events-none fixed top-0 left-0 z-[9999]"
            style={{ x: rx, y: ry }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
          >
            <div className="absolute flex h-[56px] w-[56px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <span
                className="text-[6.5px] font-light uppercase tracking-[0.22em] text-[#d4af37]"
                style={{ textShadow: "0 0 6px rgba(212,175,55,0.8)" }}
              >
                open
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
