"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import {
  FaClock, FaClipboardList, FaUserShield, FaUsers,
  FaUserGraduate, FaSyncAlt, FaCheckCircle, FaHardHat,
  FaBuilding, FaArrowRight, FaShieldAlt, FaCertificate,
  FaMapMarkerAlt, FaPhoneAlt
} from "react-icons/fa";

// ─── Hook inView unificado ───
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
function AnimateIn({ children, delay = 0, from = "fadeUp", className = "" }: {
  children: React.ReactNode; delay?: number;
  from?: "fadeUp" | "fadeLeft" | "fadeRight" | "fadeIn" | "scaleUp"; className?: string;
}) {
  const { ref, inView } = useInView();
  const base: Record<string, string> = {
    fadeUp:    "translate-y-8 opacity-0",
    fadeLeft:  "-translate-x-8 opacity-0",
    fadeRight: "translate-x-8 opacity-0",
    fadeIn:    "opacity-0",
    scaleUp:   "scale-95 opacity-0",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        inView ? "translate-y-0 translate-x-0 scale-100 opacity-100" : base[from]
      }`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}



export default function HomePage() {
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const academiaFotos = [
    { title: "Pista de Entrenamiento", desc: "Estructuras certificadas para práctica real.", img: "/pic1.webp" },
    { title: "Equipamiento Técnico",   desc: "Arneses y conectores de última generación.", img: "/equipament.webp" },
    { title: "Aulas Teóricas",         desc: "Espacios climatizados para formación técnica.", img: "/aula.webp" },
    { title: "Simulación de Rescate",  desc: "Escenarios controlados de alta complejidad.", img: "/rescate.webp" },
  ];

  const cursos = [
    { title: "Jefes de Área",         desc: "Personal administrativo que dicta políticas sobre seguridad en alturas.", duration: "8 Horas",  reqs: "Cédula y Examen",    icon: <FaUserShield />,   img: "/picboss.webp",  color: "from-orange-600 to-amber-500" },
    { title: "Trabajador Autorizado",  desc: "Formación técnica para operarios que realizan labores directas en alturas.",  duration: "32 Horas", reqs: "Aptitud Médica",     icon: <FaUsers />,        img: "/pictrabj.webp", color: "from-blue-600 to-cyan-500" },
    { title: "Coordinador de Alturas", desc: "Identificar peligros y supervisar medidas de protección en sitio.",          duration: "80 Horas", reqs: "Exp. Certificada",   icon: <FaUserGraduate />, img: "/piccoo.webp",   color: "from-violet-600 to-purple-500" },
    { title: "Reentrenamiento",        desc: "Actualización anual obligatoria para mantener vigentes las competencias.",    duration: "8 Horas",  reqs: "Certificado Previo", icon: <FaSyncAlt />,      img: "/picree.webp",   color: "from-emerald-600 to-teal-500" },
  ];

  const ventajas = [
    { icon: <FaShieldAlt />,    titulo: "Avalado por el Min. Trabajo", desc: "Resolución 4272 de 2021 como respaldo legal de cada programa." },
    { icon: <FaHardHat />,      titulo: "Instructores con Campo Real",  desc: "Cada formador tiene experiencia activa en altura, no solo teórica." },
    { icon: <FaCertificate />,  titulo: "Certificado Digital Inmediato",desc: "Sistema en línea. Descarga tu PDF verificable en minutos." },
    { icon: <FaBuilding />,     titulo: "Combos para Empresas",        desc: "Tarifas especiales y cronograma ajustado a tu operación." },
  ];

  return (
    <>
      <style jsx global>{`
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

      <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
        <main className="flex-grow">

          {/* ══════════════════════════════════════════
              HERO (componente existente)
          ══════════════════════════════════════════ */}
          <Hero />

          {/* ══════════════════════════════════════════
              BANDA DE PILARES — propuesta de valor
          ══════════════════════════════════════════ */}
          <section className="bg-slate-900 py-14 relative overflow-hidden">
            {/* Línea de gradiente arriba */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            {/* Línea de gradiente abajo */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
                {[
                  {
                    icon: <FaShieldAlt size={20}/>,
                    titulo: "Resolución 4272",
                    desc: "Toda nuestra formación cumple la normativa del Ministerio del Trabajo vigente.",
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                  },
                  {
                    icon: <FaHardHat size={20}/>,
                    titulo: "Instructores de Campo",
                    desc: "No solo saben la teoría — tienen horas reales de trabajo en altura.",
                    color: "text-cyan-400",
                    bg: "bg-cyan-500/10",
                  },
                  {
                    icon: <FaCertificate size={20}/>,
                    titulo: "Certificado Digital",
                    desc: "PDF verificable con código QR. Auténtico, inmediato y a prueba de fraude.",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                  },
                  {
                    icon: <FaBuilding size={20}/>,
                    titulo: "Planes para Empresas",
                    desc: "Cronograma flexible y tarifas especiales para equipos de cualquier tamaño.",
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                  },
                ].map((pilar, i) => (
                  <AnimateIn key={pilar.titulo} from="fadeUp" delay={i * 70}>
                    <div className="group bg-slate-900 hover:bg-slate-800 transition-colors duration-300 p-8 h-full flex flex-col gap-4">
                      {/* Ícono */}
                      <div className={`w-11 h-11 ${pilar.bg} rounded-xl flex items-center justify-center ${pilar.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        {pilar.icon}
                      </div>
                      {/* Texto */}
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1.5">
                          {pilar.titulo}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          {pilar.desc}
                        </p>
                      </div>
                      {/* Línea de color al hover */}
                      <div className={`mt-auto h-0.5 w-0 ${pilar.bg.replace('/10', '/60')} group-hover:w-8 transition-all duration-500 rounded-full ${pilar.color.replace('text-', 'bg-')}`} />
                    </div>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              QUIÉNES SOMOS
          ══════════════════════════════════════════ */}
          <section className="relative max-w-7xl mx-auto px-6 py-28">
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(#0F172A 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

            <div className="grid md:grid-cols-2 gap-20 items-center relative z-10">

              {/* Texto */}
              <AnimateIn from="fadeLeft">
                <div>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Centro de Entrenamiento · Sincelejo
                  </div>

                  <h2
                    className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-2"
                    style={{ letterSpacing: "-0.03em" }}
                  >
                    La academia líder en{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        Sucre
                      </span>
                      <span className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 line-grow" />
                    </span>
                  </h2>

                  <p className="text-slate-500 text-lg leading-relaxed mb-8 mt-6">
                    En <span className="font-bold text-slate-800">Alturas y Riesgos de la Costa S.A.S.</span>, ofrecemos
                    los mejores cursos de <strong className="text-slate-700">trabajo en alturas</strong> certificados
                    por el Ministerio del Trabajo, bajo la Resolución 4272 de 2021.
                  </p>

                  {/* Dato de contacto */}
                  <div className="border-l-4 border-blue-600 pl-5 py-1 mb-8 space-y-1">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-500" size={12}/> Cra 17 #27-35, Sincelejo, Sucre
                    </p>
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <FaPhoneAlt className="text-blue-500" size={11}/> +57 314 8475070
                    </p>
                  </div>

                  <Link
                    href="/contacto"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-0.5"
                  >
                    Cotizar Ahora
                    <FaArrowRight size={11} className="transition-transform group-hover:translate-x-1"/>
                  </Link>
                </div>
              </AnimateIn>

              {/* Grid de ventajas */}
              <div className="grid grid-cols-2 gap-4">
                {ventajas.map((v, i) => (
                  <AnimateIn key={v.titulo} from="fadeUp" delay={i * 80}>
                    <div className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        {v.icon}
                      </div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight mb-2 leading-tight">{v.titulo}</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{v.desc}</p>
                    </div>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              GALERÍA — acordeón horizontal
          ══════════════════════════════════════════ */}
          <section className="py-28 bg-slate-900 relative overflow-hidden">
            {/* Texto decorativo gigante */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[16rem] font-black text-white/[0.025] pointer-events-none select-none uppercase leading-none">
              AYR
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

              {/* Header */}
              <AnimateIn from="fadeLeft" className="mb-14">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      Infraestructura
                    </div>
                    <h2
                      className="text-4xl md:text-5xl font-black text-white leading-tight"
                      style={{ letterSpacing: "-0.03em" }}
                    >
                      Nuestro Centro de{" "}
                      <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Entrenamiento
                      </span>
                    </h2>
                  </div>
                  <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                    Instalaciones diseñadas para simular escenarios reales de trabajo en altura.
                  </p>
                </div>
              </AnimateIn>

              {/* Acordeón horizontal */}
              <AnimateIn from="scaleUp" delay={100}>
                <div className="flex flex-col md:flex-row gap-3 h-[480px]">
                  {academiaFotos.map((foto, idx) => (
                    <div
                      key={idx}
                      className="relative group flex-1 hover:flex-[2.8] transition-all duration-700 ease-in-out overflow-hidden rounded-3xl border border-white/10"
                    >
                      <Image
                        src={foto.img}
                        alt={foto.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/20 to-transparent" />

                      {/* Número */}
                      <div className="absolute top-5 left-5 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                        0{idx + 1}
                      </div>

                      {/* Texto al hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-7">
                        <div className={`h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 mb-4 transition-all duration-500 ${
                          "w-0 group-hover:w-12"
                        }`} style={{ transitionDelay: "100ms" }} />
                        <h3 className="text-white text-base font-black uppercase tracking-tight leading-none mb-2">
                          {foto.title}
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 max-w-[200px]">
                          {foto.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateIn>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              CURSOS — cards con imagen
          ══════════════════════════════════════════ */}
          <section className="bg-slate-50 py-28 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(#0F172A 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

              <AnimateIn className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Programas de Formación
                </div>
                <h2
                  className="text-4xl md:text-5xl font-black text-slate-900"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  Nuestros Servicios
                </h2>
                <p className="text-slate-500 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                  Certificación técnica de alto nivel bajo la Resolución 4272 de 2021.
                </p>
              </AnimateIn>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cursos.map((curso, idx) => (
                  <AnimateIn key={curso.title} from="fadeUp" delay={idx * 90}>
                    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-2 transition-all duration-400 h-full flex flex-col">

                      {/* Imagen */}
                      <div className="relative h-52 overflow-hidden flex-shrink-0">
                        {/* Placeholder mientras carga */}
                        <div className="absolute inset-0 bg-slate-200" />
                        <Image
                          src={curso.img}
                          alt={curso.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

                        {/* Ícono */}
                        <div className={`absolute bottom-4 left-4 w-10 h-10 bg-gradient-to-br ${curso.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                          {curso.icon}
                        </div>

                        {/* Badge duración */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                          <FaClock size={9} className="text-slate-500"/>
                          <span className="text-[10px] font-black text-slate-700 uppercase">{curso.duration}</span>
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="p-6 flex flex-col flex-1">
                        {/* Requisito */}
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          <FaClipboardList size={9}/> {curso.reqs}
                        </span>

                        <h3 className="text-base font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight">
                          {curso.title}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed flex-1">{curso.desc}</p>

                        {/* Línea de color al hover */}
                        <div className={`mt-4 h-0.5 w-0 bg-gradient-to-r ${curso.color} group-hover:w-full transition-all duration-500 rounded-full`} />
                      </div>
                    </div>
                  </AnimateIn>
                ))}
              </div>

              {/* CTA debajo */}
              <AnimateIn from="fadeUp" delay={400} className="text-center mt-12">
                <Link
                  href="/cursos"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 font-black text-sm uppercase tracking-widest rounded-2xl transition-all hover:-translate-y-0.5"
                >
                  Ver todos los programas
                  <FaArrowRight size={11} className="transition-transform group-hover:translate-x-1"/>
                </Link>
              </AnimateIn>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              CTA FINAL — oscuro con shimmer
          ══════════════════════════════════════════ */}
          <section className="relative py-36 bg-slate-900 overflow-hidden text-center">

            {/* Blobs de fondo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600 rounded-full blur-[160px] opacity-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] opacity-10 pointer-events-none -mr-20" />

            {/* Dot grid sutil */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

            <div className="max-w-3xl mx-auto px-6 relative z-10">

              <AnimateIn from="fadeIn">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                  <FaCheckCircle size={10}/> Sistema de verificación en línea
                </div>
              </AnimateIn>

              <AnimateIn from="fadeUp" delay={100}>
                <h2
                  className="text-5xl md:text-6xl font-black text-white leading-tight mb-6"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  ¿Ya tienes tu{" "}
                  <span className="shimmer-text">certificado</span>?
                </h2>
              </AnimateIn>

              <AnimateIn from="fadeUp" delay={200}>
                <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                  Valida la autenticidad de tu certificación en nuestra base de datos oficial.
                  Código QR verificable en tiempo real.
                </p>
              </AnimateIn>

              <AnimateIn from="scaleUp" delay={300}>
                <Link
                  href="/certificados"
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-900/40 hover:shadow-blue-600/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <FaShieldAlt size={14}/>
                  Validar Certificado Ahora
                  <FaArrowRight size={11} className="transition-transform group-hover:translate-x-1"/>
                </Link>
              </AnimateIn>

            </div>
          </section>

        </main>
      </div>
    </>
  );
}