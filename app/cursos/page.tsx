"use client";

import React, { useState } from "react";
import Image from "next/image"; 
import { FaTimes, FaCheckCircle, FaClock, FaBookOpen, FaHardHat, FaInfoCircle } from "react-icons/fa";

export default function CursosPage() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any>(null);

  const cursos = [
    {
      titulo: "Trabajador autorizado",
      desc: "Capacitación para personal autorizado a ejecutar labores operativas en alturas.",
      horasTotal: "32 horas",
      icono: "🦺",
      horasTeoricas: 12.5,
      horasPracticas: 19.5,
      requisitos: [ "Fotocopia de Cédula (CC)", "ARL Vigente (Riesgo V)", "EMO (Examen Médico) con aptitud para alturas", "Certificado de afiliación a EPS" ],
      imagen: "/trabajador.webp" 
    },
    {
      titulo: "Reentrenamiento",
      desc: "Actualización obligatoria de conocimientos para mantener la certificación vigente.",
      horasTotal: "8 horas",
      icono: "🔄",
      horasTeoricas: 1.6,
      horasPracticas: 6.4,
      requisitos: [ "Fotocopia de Cédula (CC)", "ARL Vigente", "Certificado de curso anterior", "EMO con aptitud para alturas", "Certificado de afiliación a EPS", "Haber realizado el curso de Trabajador Autorizado previamente" ],
      imagen: "/reentrenamiento.webp"
    },
    {
      titulo: "Coordinador de alturas",
      desc: "Formación para coordinar, controlar y supervisar trabajos en altura según normativa.",
      horasTotal: "80 horas",
      icono: "📋",
      horasTeoricas: 32,
      horasPracticas: 48,
      requisitos: [ "Fotocopia de Cédula (CC)", "Certificado de Trabajador Autorizado", "Experiencia mínima certificada (1 año)", "Carta laboral", "ARL Vigente", "EMO con aptitud para alturas", "Certificado de afiliación a EPS", "Certificado 20h SST" ],
      imagen: "/coordinador.webp"
    },
    {
      titulo: "Jefes de área",
      desc: "Para responsables de tomar decisiones administrativas sobre trabajos en altura.",
      horasTotal: "8 horas",
      icono: "👷‍♂️",
      horasTeoricas: 8,
      horasPracticas: 0,
      requisitos: [ "Cédula (CC)", "ARL Vigente", "EMO con aptitud para alturas", "Certificado de afiliación a EPS", "Certificado trabajador autorizado", "Certificado 20h SST" ],
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

        {/* GRID DE CURSOS */}
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
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {curso.icono}
              </div>
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
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setCursoSeleccionado(null)}
          ></div>

          {/* CONTENEDOR PRINCIPAL DEL MODAL */}
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row animate-in zoom-in duration-300 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
            
            {/* COLUMNA IZQUIERDA (IMAGEN) 
                
                CAMBIOS CLAVE:
                1. 'overflow-hidden': Corta todo lo que sobre.
                2. 'rounded-t-[32px] md:rounded-l-[32px] md:rounded-tr-none': Define la forma EXACTA del contenedor.
                3. 'relative z-0': Crea un nuevo contexto de apilamiento.
                4. style={{ isolation: 'isolate' }}: El TRUCO DE MAGIA. Esto fuerza a Chrome/Safari a respetar el borde redondeado incluso si la imagen hija es gigante.
            */}
            <div 
                className="md:w-2/5 relative min-h-[250px] md:min-h-full flex flex-col overflow-hidden rounded-t-[32px] md:rounded-l-[32px] md:rounded-tr-none z-0"
                style={{ isolation: 'isolate' }} 
            >
              
              {/* IMAGEN DE FONDO */}
              <div className="absolute inset-0 w-full h-full -z-10">
                <Image 
                  src={cursoSeleccionado.imagen} 
                  alt={cursoSeleccionado.titulo}
                  fill
                  priority // Carga inmediata
                  sizes="(max-width: 768px) 100vw, 40vw"
                  // object-cover: Evita que se estire (aspect ratio correcto), corta lo que sobra.
                  className="object-cover"
                />
                
                {/* Gradiente (también se recortará automáticamente por el padre) */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              </div>

              {/* CONTENIDO TEXTO (Encima de la imagen) */}
              <div className="relative z-10 mt-auto p-8 text-white">
                <span className="inline-block px-3 py-1 bg-blue-600/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg border border-blue-400/30">
                  Certificado Oficial
                </span>
                <h2 className="text-3xl font-black leading-tight mb-2 uppercase tracking-tighter drop-shadow-md">
                  {cursoSeleccionado.titulo}
                </h2>
                <p className="text-slate-200 text-sm font-bold flex items-center gap-2 drop-shadow-sm">
                  <FaClock className="text-blue-400" /> {cursoSeleccionado.horasTotal} de Intensidad
                </p>
              </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="md:w-3/5 p-8 md:p-10 bg-white md:rounded-r-[32px]">
                <button 
                    onClick={() => setCursoSeleccionado(null)}
                    className="absolute top-4 right-4 z-20 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <FaTimes size={20}/>
                </button>

                {/* Info... */}
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

                <a 
                    href="/contacto" 
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