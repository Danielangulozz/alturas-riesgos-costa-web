"use client";

import React, { useState } from "react";
import { FaTimes, FaCheckCircle, FaClock, FaBookOpen, FaHardHat, FaInfoCircle } from "react-icons/fa";

export default function CursosPage() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any>(null);

  // SOLO LOS 4 CURSOS PRINCIPALES CON LA DATA DETALLADA
  const cursos = [
    {
      titulo: "Trabajador autorizado",
      desc: "Capacitación para personal autorizado a ejecutar labores operativas en alturas.",
      horasTotal: "32 horas",
      icono: "🦺",
      // DETALLES INTERNOS
      horasTeoricas: 12.5,
      horasPracticas: 19.5,
      requisitos: [
        "Fotocopia de Cédula (CC)",
        "ARL Vigente (Riesgo V)",
        "EMO (Examen Médico) con aptitud para alturas",
        "Certificado de afiliación a EPS"
      ],
      imagen: "/trabajador.webp" // Asegúrate de poner una foto real aquí luego
    },
    {
      titulo: "Reentrenamiento",
      desc: "Actualización obligatoria de conocimientos para mantener la certificación vigente.",
      horasTotal: "8 horas",
      icono: "🔄",
      horasTeoricas: 1.6,
      horasPracticas: 6.4,
      requisitos: [
        "Fotocopia de Cédula (CC)",
        "ARL Vigente",
        "Certificado de curso anterior (Vencido o por vencer)",
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
      requisitos: [
        "Fotocopia de Cédula (CC)",
        "Certificado de Trabajador Autorizado",
        "Experiencia mínima certificada (1 año)",
        "Carta laboral",
        "ARL Vigente",
        "EMO con aptitud para alturas",
        "Certificado de afiliación a EPS",
        "Certificado 20h SST (Si no lo tiene, puede hacerlo con nosotros antes del curso)"
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
      requisitos: [
        "Cédula (CC)",
        "ARL Vigente",
        "EMO con aptitud para alturas",
        "Certificado de afiliación a EPS",
        "Certificado trabajador autorizado",
        "Certificado 20h SST (Si no lo tiene, puede hacerlo con nosotros antes del curso)",
        "Certificado coordinador de alturas (opcional pero recomendado)",
        "Certificado reentrenamiento (opcional pero recomendado)",
        "Certificado curso primero auxilios (opcional pero recomendado)",

      ],
      imagen: "/jefes.webp"
    },
  ];

  return (
    <section className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mt-12 mx-auto px-6 py-20">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Nuestros Programas de Formación
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Capacitación certificada bajo la <span className="font-bold text-blue-600">Resolución 4272 de 2021</span>. 
            Selecciona un curso para ver el temario y requisitos.
          </p>
        </div>

        {/* GRID DE CURSOS (SOLO 4) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cursos.map((curso) => (
            <div
              key={curso.titulo}
              onClick={() => setCursoSeleccionado(curso)}
              className="
                group bg-white rounded-3xl p-6
                border border-slate-200 cursor-pointer
                shadow-sm hover:shadow-2xl hover:shadow-blue-900/10
                transition-all duration-300
                hover:-translate-y-2
                flex flex-col relative overflow-hidden
              "
            >
              {/* Decoración Hover */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

              {/* ICONO */}
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {curso.icono}
              </div>

              {/* BADGE HORAS */}
              <span className="w-fit mb-3 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                {curso.horasTotal}
              </span>

              <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                {curso.titulo}
              </h3>

              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {curso.desc}
              </p>

              <button className="mt-auto w-full py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm uppercase flex items-center justify-center gap-2 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FaInfoCircle/> Ver Detalles
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL DETALLE DEL CURSO --- */}
      {cursoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop con Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setCursoSeleccionado(null)}
          ></div>

          {/* Contenido Modal */}
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in duration-300 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
            
            {/* COLUMNA IZQUIERDA: FOTO Y RESUMEN */}
            <div className="md:w-2/5 relative min-h-[250px] md:min-h-full flex flex-col">
              {/* Imagen de fondo */}
              <div className="absolute inset-0">
                <img 
                  src={cursoSeleccionado.imagen} 
                  alt={cursoSeleccionado.titulo}
                  className="w-full h-full object-cover"
                />
                {/* Gradiente para asegurar legibilidad del texto blanco */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
              </div>

              {/* Contenido sobre la imagen */}
              <div className="relative z-10 mt-auto p-8 text-white">
                <span className="inline-block px-3 py-1 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg">
                  Certificado Oficial
                </span>
                <h2 className="text-3xl font-black leading-tight mb-2 uppercase tracking-tighter">
                  {cursoSeleccionado.titulo}
                </h2>
                <p className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <FaClock className="text-blue-400" /> {cursoSeleccionado.horasTotal} de Intensidad
                </p>
              </div>
            </div>

            {/* COLUMNA DERECHA: DETALLES */}
            <div className="md:w-3/5 p-8 md:p-10 bg-white">
                <button 
                    onClick={() => setCursoSeleccionado(null)}
                    className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <FaTimes size={20}/>
                </button>

                {/* DESGLOSE HORARIO */}
                <div className="mb-8">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FaClock/> Distribución del Tiempo
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <span className="block text-3xl font-black text-blue-600">{cursoSeleccionado.horasTeoricas}h</span>
                            <span className="text-xs font-bold text-blue-400 uppercase">Teóricas</span>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <span className="block text-3xl font-black text-emerald-600">{cursoSeleccionado.horasPracticas}h</span>
                            <span className="text-xs font-bold text-emerald-400 uppercase">Prácticas</span>
                        </div>
                    </div>
                </div>

                {/* REQUISITOS */}
                <div className="mb-8">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FaBookOpen/> Requisitos de Inscripción
                    </h3>
                    <ul className="space-y-3">
                        {cursoSeleccionado.requisitos.map((req: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                                <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0"/>
                                {req}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* BOTÓN DE ACCIÓN */}
                <a 
                    href="/contacto" // O redirige al WhatsApp directamente
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-900/30 hover:-translate-y-1"
                >
                    <FaHardHat/> Inscribirme Ahora
                </a>

            </div>
          </div>
        </div>
      )}

    </section>
  );
}