"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useSmoothScroll } from "@/contexts/SmoothScrollContext";
import { NAVBAR_OFFSET } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "gold" | "outline" | "ghost";
  className?: string;
  type?: "button" | "submit";
  scroll?: boolean;
}

const variants = {
  gold: "bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] text-[#050505] shadow-[0_4px_14px_rgba(212,175,55,0.25)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6),inset_0_-2px_10px_rgba(255,255,255,0.3)] hover:brightness-110",
  outline:
    "border border-[#d4af37]/40 bg-black/20 backdrop-blur-md text-[#f5e6c8] shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:border-[#d4af37] hover:bg-[#d4af37]/10 hover:shadow-[0_0_30px_rgba(212,175,55,0.3),inset_0_1px_4px_rgba(212,175,55,0.2)]",
  ghost: "bg-white/5 backdrop-blur-md text-[#f5e6c8] hover:bg-white/10 border border-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]",
};

function isExternalHref(href: string) {
  return (
    href.startsWith("tel:") ||
    href.startsWith("mailto:") ||
    href.startsWith("http://") ||
    href.startsWith("https://")
  );
}

export function MagneticButton({
  href,
  onClick,
  children,
  variant = "gold",
  className,
  type = "button",
  scroll = true,
}: MagneticButtonProps) {
  const pathname = usePathname();
  const { scrollTo } = useSmoothScroll();
  const ref = useMagnetic<HTMLAnchorElement & HTMLButtonElement>(0.25);
  const baseClass = cn(
    "luxury-focus-ring relative inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3 text-xs font-medium tracking-[0.14em] uppercase transition-all duration-500 sm:px-8 sm:py-3.5 sm:text-sm",
    variants[variant],
    className
  );

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
    </>
  );

  if (href) {
    if (isExternalHref(href)) {
      return (
        <a
          ref={ref as React.RefObject<HTMLAnchorElement>}
          href={href}
          data-magnetic
          className={cn(baseClass, "group")}
        >
          {inner}
        </a>
      );
    }

    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        scroll={scroll}
        data-magnetic
        className={cn(baseClass, "group")}
        onClick={(e) => {
          if (href.includes("#")) {
            const [path, hashPart] = href.split("#");
            const targetPath = path || "/";
            const hash = hashPart ? `#${hashPart}` : "";

            if (hash && pathname === targetPath) {
              e.preventDefault();
              window.history.pushState(null, "", href);
              scrollTo(hash, { offset: NAVBAR_OFFSET });
              onClick?.();
              return;
            }
          }
          onClick?.();
        }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      data-magnetic
      className={cn(baseClass, "group")}
    >
      {inner}
    </button>
  );
}
