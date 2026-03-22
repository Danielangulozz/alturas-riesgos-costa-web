"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image"; 
import { FaTimes, FaCheckCircle, FaClock, FaBookOpen, FaHardHat, FaInfoCircle, FaArrowRight } from "react-icons/fa";

// Tipos
interface Curso {
  titulo: string;
  desc: string;
  horasTotal: string;
  icono: string;
  horasTeoricas: number;
  horasPracticas: number;
  requisitos: string[];
  imagen: string;
  color: string;
}

// Hook para detectar cuando un elemento entra al viewport
function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.15, ...options });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

export default function CursosPage() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);

  // Animación del header al montar
  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Abrir modal con animación
  const abrirModal = (curso: Curso) => {
    setCursoSeleccionado(curso);
    // Pequeño delay para que el DOM monte antes de animar
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setModalVisible(true));
    });
  };

  // Cerrar modal con animación de salida
  const cerrarModal = () => {
    setModalVisible(false);
    // Esperamos que termine la transición antes de desmontar
    setTimeout(() => setCursoSeleccionado(null), 350);
  };

  const cursos: Curso[] = [
    {
      titulo: "Trabajador autorizado",
      desc: "Capacitación para personal autorizado a ejecutar labores operativas en alturas.",
      horasTotal: "32 horas",
      icono: "🦺",
      horasTeoricas: 12.5,
      horasPracticas: 19.5,
      color: "from-blue-600 to-cyan-500",
      requisitos: [
        "Fotocopia de Cédula (CC)",
        "ARL Vigente (Riesgo V)",
        "EMO (Examen Médico) con aptitud para alturas",
        "Certificado de afiliación a EPS"
      ],
      imagen: "/trabajador.webp" 
    },
    {
      titulo: "Reentrenamiento",
      desc: "Actualización obligatoria de conocimientos para mantener la certificación vigente.",
      horasTotal: "8 horas",
      icono: "🔄",
      horasTeoricas: 1.6,
      horasPracticas: 6.4,
      color: "from-emerald-600 to-teal-500",
      requisitos: [
        "Fotocopia de Cédula (CC)",
        "ARL Vigente",
        "Certificado de curso anterior",
        "EMO con aptitud para alturas",
        "Certificado de afiliación a EPS",
        "Haber realizado el curso de Trabajador Autorizado previamente"
      ],
      imagen: "/reentrenamiento.webp"
    },
    {
      titulo: "Coordinador de alturas",
      desc: "Formación para coordinar, controlar y supervisar trabajos en altura según normativa.",
      horasTotal: "80 horas",
      icono: "📋",
      horasTeoricas: 32,
      horasPracticas: 48,
      color: "from-violet-600 to-purple-500",
      requisitos: [
        "Fotocopia de Cédula (CC)",
        "Certificado de Trabajador Autorizado",
        "Experiencia mínima certificada (1 año)",
        "Carta laboral",
        "ARL Vigente",
        "EMO con aptitud para alturas",
        "Certificado de afiliación a EPS",
        "Certificado 20h SST"
      ],
      imagen: "/coordinador.webp"
    },
    {
      titulo: "Jefes de área",
      desc: "Para responsables de tomar decisiones administrativas sobre trabajos en altura.",
      horasTotal: "8 horas",
      icono: "👷‍♂️",
      horasTeoricas: 8,
      horasPracticas: 0,
      color: "from-orange-500 to-amber-400",
      requisitos: [
        "Cédula (CC)",
        "ARL Vigente",
        "EMO con aptitud para alturas",
        "Certificado de afiliación a EPS",
        "Certificado trabajador autorizado",
        "Certificado 20h SST"
      ],
      imagen: "/jefes.webp"
    },
  ];

  return (
    <>
      {/* Estilos de animación globales para esta página */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scaleOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to   { opacity: 0; transform: scale(0.93) translateY(16px); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .animate-fade-up   { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) forwards; }
        .animate-fade-in   { animation: fadeIn 0.5s ease forwards; }
        .animate-scale-in  { animation: scaleIn 0.35s cubic-bezier(.22,1,.36,1) forwards; }
        .animate-scale-out { animation: scaleOut 0.3s cubic-bezier(.55,0,1,.45) forwards; }
        .animate-slide-right { animation: slideRight 0.5s cubic-bezier(.22,1,.36,1) forwards; }
        .opacity-0 { opacity: 0; }

        /* Barra de progreso animada dentro del modal */
        @keyframes growWidth {
          from { width: 0%; }
          to   { width: var(--target-width); }
        }
        .bar-animate { animation: growWidth 1s cubic-bezier(.22,1,.36,1) forwards 0.3s; width: 0%; }
      `}</style>

      <section className="bg-slate-50 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mt-12 mx-auto px-6 py-20">
          
          {/* ─── HEADER ─── */}
          <div className={`text-center mb-16 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge animado */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Certificado bajo Resolución 4272 de 2021
            </div>

            <h1
              className="text-4xl md:text-6xl font-black text-slate-900 mb-5 leading-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              Programas de{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Formación
                </span>
                {/* Línea decorativa bajo el texto */}
                <span
                  className={`absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000 delay-500 ${headerVisible ? 'w-full' : 'w-0'}`}
                />
              </span>
            </h1>

            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Selecciona un curso para ver el temario completo,{" "}
              <span className="font-bold text-slate-700">distribución de horas</span> y{" "}
              <span className="font-bold text-slate-700">requisitos de inscripción</span>.
            </p>
          </div>

          {/* ─── GRID DE CURSOS ─── */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cursos.map((curso, idx) => (
              <CursoCard
                key={curso.titulo}
                curso={curso}
                index={idx}
                onClick={() => abrirModal(curso)}
              />
            ))}
          </div>

          {/* Nota legal */}
          <p className={`text-center text-xs text-slate-400 mt-12 transition-all duration-700 delay-700 ${headerVisible ? 'opacity-100' : 'opacity-0'}`}>
            Todos nuestros cursos incluyen certificado oficial avalado por el Ministerio de Trabajo de Colombia.
          </p>
        </div>

        {/* ─── MODAL ─── */}
        {cursoSeleccionado && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${modalVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
              onClick={cerrarModal}
            />

            {/* Panel del modal */}
            <div className={`
              bg-white rounded-[32px] w-full max-w-4xl shadow-2xl relative
              flex flex-col md:flex-row
              max-h-[90vh] md:max-h-[85vh] overflow-hidden
              ${modalVisible ? 'animate-scale-in' : 'animate-scale-out'}
            `}>

              {/* IMAGEN IZQUIERDA */}
              <div
                className="md:w-2/5 relative min-h-[220px] md:min-h-full flex flex-col overflow-hidden rounded-t-[32px] md:rounded-l-[32px] md:rounded-tr-none"
                style={{ isolation: 'isolate' }}
              >
                {/* Preload la imagen con priority */}
                <Image
                  src={cursoSeleccionado.imagen}
                  alt={cursoSeleccionado.titulo}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

                {/* Texto sobre imagen */}
                <div className={`relative z-10 mt-auto p-8 text-white ${modalVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.15s' }}>
                  <span className={`inline-block px-3 py-1 bg-gradient-to-r ${cursoSeleccionado.color} rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 shadow-lg`}>
                    Certificado Oficial
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2 uppercase tracking-tighter drop-shadow-md">
                    {cursoSeleccionado.titulo}
                  </h2>
                  <p className="text-slate-300 text-sm font-bold flex items-center gap-2">
                    <FaClock className="text-blue-400" /> {cursoSeleccionado.horasTotal} de Intensidad
                  </p>
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="md:w-3/5 p-8 md:p-10 overflow-y-auto bg-white md:rounded-r-[32px]">
                {/* Botón cerrar */}
                <button
                  onClick={cerrarModal}
                  className="absolute top-4 right-4 z-20 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all hover:rotate-90 duration-200"
                >
                  <FaTimes size={18}/>
                </button>

                {/* Horas */}
                <div className={`mb-2 ${modalVisible ? 'animate-fade-up opacity-0' : ''}`} style={{ animationDelay: '0.2s' }}>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <FaClock size={12}/> Distribución del Tiempo
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="bg-blue-50 p-2 rounded-2xl border border-blue-100">
                      <span className="block text-3xl font-black text-blue-600">{cursoSeleccionado.horasTeoricas}h</span>
                      <span className="text-xs font-bold text-blue-400 uppercase">Teóricas</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <span className="block text-3xl font-black text-emerald-600">{cursoSeleccionado.horasPracticas}h</span>
                      <span className="text-xs font-bold text-emerald-400 uppercase">Prácticas</span>
                    </div>
                  </div>

                  {/* Barra de proporción */}
                  {cursoSeleccionado.horasPracticas > 0 && (
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${cursoSeleccionado.color} bar-animate`}
                        style={{
                          '--target-width': `${(cursoSeleccionado.horasPracticas / (cursoSeleccionado.horasTeoricas + cursoSeleccionado.horasPracticas)) * 100}%`
                        } as React.CSSProperties}
                      />
                    </div>
                  )}
                  <p className="text-[12px] text-slate-400 font-bold">
                    {Math.round((cursoSeleccionado.horasPracticas / (cursoSeleccionado.horasTeoricas + cursoSeleccionado.horasPracticas || 1)) * 100)}% componente práctico
                  </p>
                </div>

                {/* Requisitos */}
                <div className={`mb-2 ${modalVisible ? 'animate-fade-up opacity-0' : ''}`} style={{ animationDelay: '0.28s' }}>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaBookOpen size={10}/> Requisitos de Inscripción
                  </h3>
                  <ul className="space-y-1.5">
                    {cursoSeleccionado.requisitos.map((req, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-3 text-slate-600 text-sm font-medium ${modalVisible ? 'animate-slide-right opacity-0' : ''}`}
                        style={{ animationDelay: `${0.3 + i * 0.06}s` }}
                      >
                        <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0 text-xs"/>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <a
                  href="/contacto"
                  className={`
                    w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm
                    flex items-center justify-center gap-2 group
                    bg-slate-900 text-white
                    hover:opacity-90 transition-all
                    shadow-xl hover:-translate-y-0.5
                    ${modalVisible ? 'animate-fade-up opacity-0' : ''}
                  `}
                  style={{ animationDelay: '0.55s' }}
                >
                  <FaHardHat/>
                  Inscribirme Ahora
                  <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1"/>
                </a>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

// ─────────────────────────────────────────
// SUB-COMPONENTE: TARJETA DE CURSO
// ─────────────────────────────────────────
function CursoCard({ curso, index, onClick }: { curso: Curso; index: number; onClick: () => void }) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`
        group bg-white rounded-3xl
        border border-slate-200 cursor-pointer
        shadow-sm hover:shadow-2xl hover:shadow-blue-900/10
        transition-all duration-300 hover:-translate-y-2
        flex flex-col relative overflow-hidden
        opacity-0
      `}
      style={inView ? {
        animation: `fadeUp 0.6s cubic-bezier(.22,1,.36,1) ${index * 0.1}s forwards`
      } : {}}
    >
      {/* Imagen de fondo con overlay - carga eager para los primeros 2 */}
      <div className="relative h-40 overflow-hidden rounded-t-3xl">
        <Image
          src={curso.imagen}
          alt={curso.titulo}
          fill
          priority={index < 2}       // Los primeros 2 cargan inmediatamente
          loading={index < 2 ? "eager" : "lazy"}  // El resto lazy
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        {/* Badge de horas sobre imagen */}
        <span className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${curso.color} shadow-md`}>
          {curso.horasTotal}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-6 flex flex-col flex-1">
        <div className="text-3xl mb-3">{curso.icono}</div>
        <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
          {curso.titulo}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">
          {curso.desc}
        </p>
        <button className="mt-auto w-full py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-xs uppercase flex items-center justify-center gap-2 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
          <FaInfoCircle size={12}/> Ver Detalles
        </button>
      </div>

      {/* Línea decorativa de color al hover */}
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${curso.color} group-hover:w-full transition-all duration-500 rounded-b-3xl`} />
    </div>
  );
}