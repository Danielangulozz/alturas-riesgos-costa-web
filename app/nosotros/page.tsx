"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import GoogleMapsEmbed from "@/components/GoogleMapsEmbed";
import {
  FaBullseye, FaEye, FaHandHoldingHeart, FaCheckCircle,
  FaWaze, FaHardHat, FaCertificate, FaUserShield,
  FaMapMarkerAlt, FaArrowRight
} from "react-icons/fa";

// ─── Hook reutilizable (mismo que CursosPage) ───
function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.12, ...options });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

// ─── Componente wrapper que anima al entrar al viewport ───
function AnimateIn({
  children,
  delay = 0,
  className = "",
  from = "fadeUp",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: "fadeUp" | "fadeLeft" | "fadeRight" | "fadeIn";
}) {
  const { ref, inView } = useInView();
  const animations: Record<string, string> = {
    fadeUp:    "translate-y-8 opacity-0",
    fadeLeft:  "-translate-x-8 opacity-0",
    fadeRight: "translate-x-8 opacity-0",
    fadeIn:    "opacity-0",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${inView ? "translate-y-0 translate-x-0 opacity-100" : animations[from]}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export default function NosotrosPage() {
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const valores = ["Responsabilidad", "Legalidad", "Compromiso", "Excelencia"];

  const porQueNosotros = [
    {
      icon: <FaHardHat size={20} />,
      titulo: "Instructores Expertos",
      desc: "Personal certificado y con experiencia real en campo.",
      color: "bg-blue-600",
    },
    {
      icon: <FaCertificate size={20} />,
      titulo: "Certificación Inmediata",
      desc: "Sistema digital ágil. Descarga tu certificado apenas apruebes.",
      color: "bg-blue-600",
    },
    {
      icon: <FaUserShield size={20} />,
      titulo: "Seguridad Total",
      desc: "Pistas de entrenamiento homologadas y equipos certificados.",
      color: "bg-blue-600",
    },
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes growWidth {
          from { width: 0; }
          to   { width: 100%; }
        }
        .animate-fade-up { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) forwards; }
        .line-grow       { animation: growWidth 0.9s cubic-bezier(.22,1,.36,1) 0.5s forwards; width: 0; }
      `}</style>

      <div className="bg-white min-h-screen overflow-x-hidden">

        {/* ══════════════════════════════════════════
            1. HERO
        ══════════════════════════════════════════ */}
        <section className="relative py-28 px-6 overflow-hidden">

          {/* Blob de fondo igual que CursosPage */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60 -z-10 -mr-40 -mt-40" />

          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

            {/* TEXTO */}
            <div
              className={`order-2 md:order-1 space-y-6 transition-all duration-700 ${headerVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
            >
              {/* Badge igual a CursosPage */}
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Sobre Nosotros
              </div>

              <h1
                className="text-4xl md:text-6xl font-black text-slate-900 leading-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                Líderes en formación de{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Trabajo Seguro
                  </span>
                  <span className={`absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 line-grow`} />
                </span>
              </h1>

              <p className="text-lg text-slate-500 leading-relaxed">
                <strong className="text-slate-800">Alturas y Riesgos de la Costa S.A.S</strong> es tu aliado
                estratégico en seguridad industrial en Sincelejo y Sucre. Transformamos la cultura de
                seguridad de las empresas mediante capacitación de alta calidad, cumpliendo estrictamente
                con la normativa colombiana vigente.
              </p>

              <div
                className={`pt-2 flex flex-wrap gap-4 transition-all duration-700 delay-300 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <Link
                  href="/cursos"
                  className="group px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:bg-blue-700 transition-all shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Ver Cursos
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" size={12} />
                </Link>
                <Link
                  href="/contacto"
                  className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold uppercase text-sm hover:border-blue-500 hover:text-blue-600 transition-all"
                >
                  Contáctanos
                </Link>
              </div>
            </div>

            {/* IMAGEN HERO */}
            <div
              className={`order-1 md:order-2 relative transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-50/60 rounded-full blur-3xl -z-10" />

              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-white">
                <Image
                  src="/entrenamientoenalturas.webp"
                  alt="Entrenamiento en Alturas"
                  width={700}
                  height={500}
                  priority
                  className="w-full h-[480px] object-cover"
                />

                {/* Tarjeta flotante */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/60">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 flex-shrink-0">
                      <FaCheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumplimiento Legal</p>
                      <p className="text-sm font-bold text-slate-900">Resolución 4272 de 2021</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════
            2. MISIÓN / VISIÓN / VALORES
        ══════════════════════════════════════════ */}
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">

            <AnimateIn className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Identidad Corporativa
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4" style={{ letterSpacing: "-0.02em" }}>
                Quiénes somos por dentro
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                Más que certificar, buscamos salvar vidas a través de la educación consciente y la excelencia operativa.
              </p>
            </AnimateIn>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FaBullseye />,
                  titulo: "Nuestra Misión",
                  color: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                  content: (
                    <p className="text-slate-500 leading-relaxed text-sm">
                      Formar trabajadores competentes y conscientes del riesgo. No solo entregamos un
                      certificado, garantizamos que cada estudiante tenga las habilidades para
                      proteger su vida.
                    </p>
                  ),
                  delay: 0,
                },
                {
                  icon: <FaEye />,
                  titulo: "Nuestra Visión",
                  color: "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
                  content: (
                    <p className="text-slate-500 leading-relaxed text-sm">
                      Ser el centro de entrenamiento referente en la Región Caribe para 2028,
                      reconocidos por nuestra infraestructura de punta y calidad pedagógica.
                    </p>
                  ),
                  delay: 100,
                },
                {
                  icon: <FaHandHoldingHeart />,
                  titulo: "Nuestros Valores",
                  color: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
                  content: (
                    <ul className="space-y-2.5">
                      {valores.map((val) => (
                        <li key={val} className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                          {val}
                        </li>
                      ))}
                    </ul>
                  ),
                  delay: 200,
                },
              ].map((card) => (
                <AnimateIn key={card.titulo} delay={card.delay} from="fadeUp">
                  <div className="group bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 h-full">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 transition-all duration-300 ${card.color}`}>
                      {card.icon}
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-4">{card.titulo}</h3>
                    {card.content}
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════
            3. POR QUÉ ELEGIRNOS
        ══════════════════════════════════════════ */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <AnimateIn>
              <div className="bg-[#0f172a] rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">

                {/* Blobs decorativos */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-15 -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-[100px] opacity-10 -ml-10 -mb-10 pointer-events-none" />

                <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">

                  {/* Texto */}
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      ¿Por qué nosotros?
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                      Entrenamiento real para riesgos reales
                    </h2>
                    <p className="text-slate-400 mb-10 leading-relaxed">
                      Sabemos que la seguridad no es un juego. Contamos con instalaciones diseñadas
                      específicamente para simular escenarios reales de riesgo.
                    </p>

                    <div className="space-y-6">
                      {porQueNosotros.map((item, i) => (
                        <AnimateIn key={item.titulo} delay={i * 120} from="fadeLeft">
                          <div className="flex items-start gap-4 group">
                            <div className={`${item.color} p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-base mb-1">{item.titulo}</h4>
                              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        </AnimateIn>
                      ))}
                    </div>
                  </div>

                  {/* Imagen */}
                  <AnimateIn from="fadeRight">
                    <div className="relative h-full min-h-[380px] rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl">
                      <Image
                        src="/workers.webp"
                        alt="Instalaciones de entrenamiento"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                      />
                      {/* Overlay gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    </div>
                  </AnimateIn>
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>


        {/* ══════════════════════════════════════════
            4. UBICACIÓN + MAPA
        ══════════════════════════════════════════ */}
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">

            <AnimateIn className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Ubicación Estratégica
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900" style={{ letterSpacing: "-0.02em" }}>
                Visita Nuestra Sede
              </h2>
            </AnimateIn>

            <div className="grid lg:grid-cols-3 gap-8 items-stretch">

              {/* Info lateral */}
              <AnimateIn from="fadeLeft">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center space-y-7 h-full">

                  <div>
                    <h3 className="font-black text-slate-900 flex items-center gap-3 text-sm uppercase tracking-widest mb-3">
                      <div className="bg-blue-100 p-2 rounded-xl text-blue-600 flex-shrink-0">
                        <FaMapMarkerAlt size={14} />
                      </div>
                      Dirección
                    </h3>
                    <p className="text-slate-500 text-sm font-medium ml-11 leading-relaxed">
                      Cra. 17 #27-35<br />Sincelejo, Sucre
                    </p>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div>
                    <h3 className="font-black text-slate-900 flex items-center gap-3 text-sm uppercase tracking-widest mb-3">
                      <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 flex-shrink-0">
                        <FaCertificate size={14} />
                      </div>
                      Horarios
                    </h3>
                    <p className="text-slate-500 text-sm font-medium ml-11 leading-relaxed">
                      Lun–Vie: 7:00 AM – 12:00 PM<br />
                      y 2:00 PM – 6:00 PM<br />
                      Sábados: 8:00 AM – 12:00 PM
                    </p>
                  </div>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Alturas+y+Riesgos+de+la+Costa+S.A.S+Sincelejo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-0.5"
                  >
                    <FaWaze size={15} />
                    Abrir en GPS
                    <FaArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </AnimateIn>

              {/* Mapa */}
              <AnimateIn from="fadeRight" className="lg:col-span-2">
                <div className="h-[400px] lg:h-full min-h-[400px] rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
                  <GoogleMapsEmbed />
                </div>
              </AnimateIn>

            </div>
          </div>
        </section>

      </div>
    </>
  );
}