"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaTimes, FaCheckCircle, FaClock, FaBookOpen, FaHardHat, FaInfoCircle, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
  const [headerVisible, setHeaderVisible] = useState(false);

  // Animación del header al montar
  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const abrirModal = (curso: Curso) => {
    setCursoSeleccionado(curso);
  };

  const cerrarModal = () => {
    setCursoSeleccionado(null);
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
      {/* Estilos de animación globales */}
      <style jsx global>{`
        @keyframes growWidth {
          from { width: 0%; }
          to   { width: var(--target-width); }
        }
        .bar-animate { animation: growWidth 1s cubic-bezier(.22,1,.36,1) forwards 0.4s; width: 0%; }
      `}</style>

      <section className="bg-slate-50 min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mt-12 mx-auto px-6 py-20">

          {/* ─── HEADER ─── */}
          <div className={`text-center mb-16 transition-all duration-1000 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
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

          <p className={`text-center text-xs text-slate-400 mt-12 transition-all duration-700 delay-700 ${headerVisible ? 'opacity-100' : 'opacity-0'}`}>
            Todos nuestros cursos incluyen certificado oficial avalado por el Ministerio de Trabajo de Colombia.
          </p>
        </div>

        {/* ─── MODAL CON FRAMER MOTION ─── */}
        <AnimatePresence>
          {cursoSeleccionado && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                onClick={cerrarModal}
              />

              {/* Panel del modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] overflow-hidden"
              >
                {/* IMAGEN IZQUIERDA */}
                <div className="md:w-2/5 relative min-h-[250px] md:min-h-full flex flex-col overflow-hidden">
                  <div className="absolute inset-0">
                    <Image
                      src={cursoSeleccionado.imagen}
                      alt={cursoSeleccionado.titulo}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  </div>

                  {/* Texto sobre imagen */}
                  <div className="relative z-10 mt-auto p-10 text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className={`inline-block px-3 py-1 bg-gradient-to-r ${cursoSeleccionado.color} rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg`}>
                        Certificado Oficial
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black leading-tight mb-3 uppercase tracking-tighter drop-shadow-md">
                        {cursoSeleccionado.titulo}
                      </h2>
                      <p className="text-slate-300 text-sm font-bold flex items-center gap-2">
                        <FaClock className="text-blue-400" /> {cursoSeleccionado.horasTotal} de Intensidad
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto bg-white flex flex-col">
                  {/* Botón cerrar */}
                  <button
                    onClick={cerrarModal}
                    className="absolute top-6 right-6 z-20 p-3 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all hover:rotate-90 duration-300"
                  >
                    <FaTimes size={18} />
                  </button>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1"
                  >
                    {/* Horas */}
                    <div className="mb-8">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FaClock size={12} /> Distribución del Tiempo
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50/50 p-5 rounded-3xl border border-blue-100">
                          <span className="block text-4xl font-black text-blue-600">{cursoSeleccionado.horasTeoricas}h</span>
                          <span className="text-xs font-bold text-blue-400 uppercase">Teóricas</span>
                        </div>
                        <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100">
                          <span className="block text-4xl font-black text-emerald-600">{cursoSeleccionado.horasPracticas}h</span>
                          <span className="text-xs font-bold text-emerald-400 uppercase">Prácticas</span>
                        </div>
                      </div>

                      {/* Barra de proporción */}
                      {cursoSeleccionado.horasPracticas > 0 && (
                        <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${cursoSeleccionado.color} bar-animate`}
                            style={{
                              '--target-width': `${(cursoSeleccionado.horasPracticas / (cursoSeleccionado.horasTeoricas + cursoSeleccionado.horasPracticas)) * 100}%`
                            } as React.CSSProperties}
                          />
                        </div>
                      )}
                      <p className="text-[12px] text-slate-400 font-bold">
                        {Math.round((cursoSeleccionado.horasPracticas / (cursoSeleccionado.horasTeoricas + cursoSeleccionado.horasPracticas || 1)) * 100)}% componente práctico presencial
                      </p>
                    </div>

                    {/* Requisitos */}
                    <div className="mb-10">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <FaBookOpen size={10} /> Requisitos de Inscripción
                      </h3>
                      <ul className="space-y-3">
                        {cursoSeleccionado.requisitos.map((req, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className="flex items-start gap-4 text-slate-600 text-[15px] font-medium leading-tight"
                          >
                            <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0 text-sm" />
                            {req}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <a
                      href="/contacto"
                      className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 group bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-xl hover:-translate-y-1"
                    >
                      <FaHardHat className="text-blue-400" />
                      Inscribirme Ahora
                      <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
    <motion.div
      ref={ref}
      onClick={onClick}
      className={`
        group bg-white rounded-[32px]
        border border-slate-200 cursor-pointer
        shadow-sm hover:shadow-2xl hover:shadow-blue-900/10
        transition-all duration-500 hover:-translate-y-2
        flex flex-col relative overflow-hidden
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Imagen de fondo con overlay */}
      <div className="relative h-44 overflow-hidden rounded-t-[32px]">
        <Image
          src={curso.imagen}
          alt={curso.titulo}
          fill
          priority={index < 4} // Aumentamos priority para que estén listas para el modal
          sizes="(max-width: 768px) 100vw, 40vw" // Match modal sizes to avoid reload
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Badge de horas sobre imagen */}
        <span className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${curso.color} shadow-lg`}>
          {curso.horasTotal}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-8 flex flex-col flex-1">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">{curso.icono}</div>
        <h3 className="text-xl font-black text-slate-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {curso.titulo}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
          {curso.desc}
        </p>
        <button className="mt-auto w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-600 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          <FaInfoCircle size={14} /> Ver Detalles
        </button>
      </div>

      {/* Línea decorativa de color al hover */}
      <div className={`absolute bottom-0 left-0 h-1.5 w-0 bg-gradient-to-r ${curso.color} group-hover:w-full transition-all duration-500 rounded-b-[32px]`} />
    </motion.div>
  );
}