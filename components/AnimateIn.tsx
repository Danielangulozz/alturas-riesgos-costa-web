"use client";

import React, { useRef, useState, useEffect } from "react";

// ─── Hook inView ───
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── AnimateIn wrapper ───
export function AnimateIn({
  children,
  delay = 0,
  from = "fadeUp",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  from?: "fadeUp" | "fadeLeft" | "fadeRight" | "fadeIn" | "scaleUp";
  className?: string;
}) {
  const { ref, inView } = useInView();
  const base: Record<string, string> = {
    fadeUp: "translate-y-8 opacity-0",
    fadeLeft: "-translate-x-8 opacity-0",
    fadeRight: "translate-x-8 opacity-0",
    fadeIn: "opacity-0",
    scaleUp: "scale-95 opacity-0",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${inView ? "translate-y-0 translate-x-0 scale-100 opacity-100" : base[from]
        }`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// ─── PageAnimations: inyecta los @keyframes una sola vez ───
export function PageAnimations() {
  return (
    <style>{`
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes growWidth {
        from { width: 0; } to { width: 100%; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-8px); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      .line-grow   { animation: growWidth 1s cubic-bezier(.22,1,.36,1) 0.6s forwards; width: 0; }
      .float-anim  { animation: float 4s ease-in-out infinite; }
      .shimmer-text {
        background: linear-gradient(90deg, #FFD700 0%, #fff 40%, #FFD700 60%, #fff 80%, #FFD700 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 4s linear infinite;
      }
    `}</style>
  );
}
