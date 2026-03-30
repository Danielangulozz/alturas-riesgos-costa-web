"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaShieldAlt, FaCheckCircle, FaMapMarkerAlt } from "react-icons/fa";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const badges = [
    { icon: <FaShieldAlt size={10}/>,   text: "Cursos de alturas" },
    { icon: <FaMapMarkerAlt size={10}/>, text: "Sincelejo, Sucre" },
    { icon: <FaCheckCircle size={10}/>, text: "Certificado Digital" },
  ];

  return (
    <>
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroSlideRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          40%       { transform: translateY(-16px) rotate(1deg); }
          70%       { transform: translateY(-8px) rotate(-0.5deg); }
        }
        @keyframes logoPulseGlow {
          0%, 100% { filter: drop-shadow(0 0 28px rgba(59,130,246,0.2)) drop-shadow(0 28px 36px rgba(0,0,0,0.45)); }
          50%       { filter: drop-shadow(0 0 52px rgba(59,130,246,0.4)) drop-shadow(0 28px 36px rgba(0,0,0,0.45)); }
        }
        @keyframes lineGrow {
          from { width: 0; opacity: 0; }
          to   { width: 100%; opacity: 1; }
        }
        @keyframes dotsPulse {
          0%, 100% { opacity: 0.12; }
          50%       { opacity: 0.07; }
        }

        .hero-badge  { animation: heroFadeIn  0.5s ease forwards; opacity: 0; }
        .hero-fadeup { animation: heroFadeUp  0.7s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .hero-logo   { animation: heroSlideRight 0.85s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .logo-float  { animation: logoFloat 9s ease-in-out infinite; }
        .logo-glow   { animation: logoPulseGlow 5s ease-in-out infinite; }
        .accent-line {
          animation: lineGrow 0.9s cubic-bezier(.22,1,.36,1) forwards;
          width: 0; opacity: 0;
        }
        .dots-bg { animation: dotsPulse 6s ease-in-out infinite; }

        .btn-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
          border-radius: inherit;
        }
        .btn-shimmer:hover::after { transform: translateX(100%); }
      `}</style>

      <section
        className="-mt-20 relative pt-44 pb-40 overflow-hidden"
        style={{
          background: "linear-gradient(155deg, #0F172A 0%, #1E3A8A 45%, #1E40AF 70%, #0F172A 100%)",
        }}
      >

        {/* Dot grid pulsante */}
        <div
          className="dots-bg absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Luz ambiental izquierda */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/15 blur-[130px] rounded-full z-0 pointer-events-none" />

        {/* Luz ambiental derecha */}
        <div className="absolute top-1/3 right-0 w-[380px] h-[380px] bg-blue-400/10 blur-[100px] rounded-full z-0 pointer-events-none" />

        {/* CONTENIDO */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-7">

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {badges.map((b, i) => (
                  <span
                    key={b.text}
                    className="hero-badge inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-blue-200 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
                    style={{ animationDelay: mounted ? `${i * 80}ms` : "9999ms" }}
                  >
                    {b.icon} {b.text}
                  </span>
                ))}
              </div>

              {/* Título */}
              <div
                className="hero-fadeup"
                style={{ animationDelay: mounted ? "200ms" : "9999ms" }}
              >
                <h1
                  className="font-black text-white leading-[1.05]"
                  style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.8rem)", letterSpacing: "-0.03em" }}
                >
                  Formación en{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                      trabajo seguro
                    </span>
                    {/* Línea bajo "trabajo seguro" */}
                    <span
                      className="accent-line absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-blue-400 to-cyan-300"
                      style={{ animationDelay: mounted ? "750ms" : "9999ms" }}
                    />
                  </span>
                  {" "}en{" "}
                  <span
                    className="text-[#FFD700]"
                    style={{ textShadow: "0 0 40px rgba(255,215,0,0.35)" }}
                  >
                    alturas.
                  </span>
                </h1>
              </div>

              {/* Subtítulo */}
              <p
                className="hero-fadeup text-blue-100/75 leading-relaxed max-w-lg"
                style={{
                  fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                  animationDelay: mounted ? "310ms" : "9999ms",
                }}
              >
                Cursos certificados bajo la{" "}
                <strong className="text-white font-bold">Resolución 4272 de 2021</strong>.
                Instructores con experiencia real. Certificado digital verificable al instante.
              </p>

              {/* CTAs */}
              <div
                className="hero-fadeup flex flex-wrap gap-4"
                style={{ animationDelay: mounted ? "400ms" : "9999ms" }}
              >
                {/* Botón dorado — igual que el Hero original */}
                <Link
                  href="/contacto"
                  className="btn-shimmer group relative overflow-hidden inline-flex items-center gap-3 px-10 py-4 rounded-full bg-[#FFD700] text-[#0F172A] font-black text-sm uppercase tracking-wider shadow-xl hover:bg-white hover:scale-105 transition-all duration-300"
                >
                  Cotizar Ahora
                  <FaArrowRight size={12} className="transition-transform group-hover:translate-x-1"/>
                </Link>

                {/* Botón secundario — borde blanco translúcido */}
                <Link
                  href="/certificados"
                  className="group inline-flex items-center gap-3 px-10 py-4 rounded-full border-2 border-white/20 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm"
                >
                  <FaShieldAlt size={12} className="text-blue-300"/>
                  Validar Certificado
                </Link>
              </div>
            </div>

            {/* COLUMNA DERECHA — Logo */}
            <div
              className="hero-logo flex justify-center items-center"
              style={{ animationDelay: mounted ? "150ms" : "9999ms" }}
            >
              <div className="relative">
                {/* Halo detrás del logo */}
                <div className="absolute inset-0 bg-blue-500/20 blur-[90px] rounded-full scale-125 pointer-events-none" />

                {/* Logo flotante */}
                <div className="logo-float logo-glow relative z-10">
                  <Image
                    src="/logo-blanco.webp"
                    alt="Alturas y Riesgos de la Costa S.A.S"
                    width={360}
                    height={360}
                    priority
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── TRANSICIÓN A slate-900 ──
            No hay ola. El fondo del Hero termina en #0F172A
            y la banda de pilares es bg-slate-900 = #0F172A.
            Son el mismo color — se funden sin corte.
            Este gradiente solo suaviza el borde inferior.        */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-10"
          style={{ background: "linear-gradient(to bottom, transparent 0%, #0f172a 100%)" }}
        />

      </section>
    </>
  );
}