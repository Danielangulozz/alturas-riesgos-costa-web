"use client";

import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaArrowLeft, FaLock, FaDatabase, FaUserShield, FaCookieBite, FaEnvelope } from "react-icons/fa";
import Link from "next/link";

const secciones = [
  {
    icon: <FaDatabase size={16}/>,
    numero: "1",
    titulo: "Información que Recopilamos",
    color: "text-blue-500",
    bg: "bg-blue-50",
    contenido: (
      <>
        <p className="text-slate-500 leading-relaxed mb-4">
          Para la prestación de nuestros servicios de capacitación y certificación en trabajo seguro en alturas, recopilamos los siguientes tipos de datos:
        </p>
        <ul className="space-y-3">
          {[
            { label: "Datos de Identificación", desc: "Nombres, apellidos, número de cédula de ciudadanía o extranjería." },
            { label: "Datos de Contacto", desc: "Dirección física, correo electrónico, número de teléfono fijo y móvil." },
            { label: "Datos Socioeconómicos", desc: "Empresa donde labora, cargo, ARL a la que está afiliado." },
            { label: "Datos Sensibles (Salud)", desc: "Conceptos de aptitud médica (EMO) necesarios para verificar la idoneidad física para trabajo en alturas, conforme a la Resolución 4272 de 2021." },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-3 text-sm">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-2" />
              <span className="text-slate-500"><strong className="text-slate-700">{item.label}:</strong> {item.desc}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    icon: <FaUserShield size={16}/>,
    numero: "2",
    titulo: "Finalidad del Tratamiento",
    color: "text-violet-500",
    bg: "bg-violet-50",
    contenido: (
      <>
        <p className="text-slate-500 leading-relaxed mb-4">Los datos personales recolectados serán utilizados para:</p>
        <ul className="space-y-3">
          {[
            "Gestionar la inscripción y matrícula a los cursos de formación.",
            "Reportar la certificación ante el Ministerio del Trabajo y plataformas gubernamentales pertinentes.",
            "Verificar la vigencia de la seguridad social y aptitud médica.",
            "Generar los certificados físicos y digitales.",
            "Enviar notificaciones sobre vencimientos, reentrenamientos y novedades normativas.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-500">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0 mt-2" />
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    icon: <FaLock size={16}/>,
    numero: "3",
    titulo: "Seguridad de la Información",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    contenido: (
      <p className="text-slate-500 leading-relaxed text-sm">
        Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger sus datos personales
        contra acceso no autorizado, pérdida, alteración o divulgación. Utilizamos protocolos de encriptación
        <strong className="text-slate-700"> (SSL)</strong> en nuestro sitio web y bases de datos seguras con
        acceso restringido al personal autorizado.
      </p>
    ),
  },
  {
    icon: <FaCookieBite size={16}/>,
    numero: "4",
    titulo: "Uso de Cookies",
    color: "text-amber-500",
    bg: "bg-amber-50",
    contenido: (
      <p className="text-slate-500 leading-relaxed text-sm">
        Nuestro sitio web puede utilizar cookies para mejorar la experiencia del usuario, analizar el tráfico
        y personalizar el contenido. El usuario puede configurar su navegador para rechazar las cookies,
        aunque esto podría limitar algunas funcionalidades de la plataforma.
      </p>
    ),
  },
];

export default function PoliticaPrivacidadPage() {
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes growWidth {
          from { width: 0; } to { width: 100%; }
        }
        .line-grow { animation: growWidth 0.9s cubic-bezier(.22,1,.36,1) 0.5s forwards; width: 0; }
      `}</style>

      <section className="relative min-h-screen bg-slate-50 overflow-x-hidden">

        {/* Blobs */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[140px] opacity-60 -z-10 -mr-40 -mt-40 pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-[120px] opacity-50 -z-10 -ml-32 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">

          {/* Back */}
          <div
            className={`transition-all duration-500 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-8 transition-colors"
            >
              <FaArrowLeft size={10} className="transition-transform group-hover:-translate-x-1"/>
              Volver al inicio
            </Link>
          </div>

          {/* Header */}
          <div
            className={`mb-12 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
              Documento Legal
            </div>

            <h1
              className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4"
              style={{ letterSpacing: "-0.03em" }}
            >
              Política de{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Privacidad
                </span>
                <span className="line-grow absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"/>
              </span>
            </h1>

            <p
              className={`text-slate-400 text-sm transition-all duration-700 delay-200 ${headerVisible ? "opacity-100" : "opacity-0"}`}
            >
              Última actualización: Enero 2026
            </p>
          </div>

          {/* Card introductoria */}
          <div
            className={`bg-[#0F172A] rounded-[2rem] p-7 mb-8 flex items-start gap-5 transition-all duration-700 delay-300 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="w-11 h-11 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
              <FaShieldAlt size={18}/>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-white">ALTURAS Y RIESGOS DE LA COSTA S.A.S</strong>, identificada con NIT{" "}
              <strong className="text-white">901.713.234-2</strong>, está comprometida con la protección de la
              privacidad y los datos personales de sus usuarios, estudiantes y clientes, conforme a la{" "}
              <strong className="text-blue-400">Ley 1581 de 2012</strong> y el{" "}
              <strong className="text-blue-400">Decreto 1377 de 2013</strong>.
            </p>
          </div>

          {/* Secciones */}
          <div className="space-y-4">
            {secciones.map((s, i) => (
              <div
                key={s.numero}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                style={{
                  transitionDelay: `${300 + i * 80}ms`,
                }}
              >
                {/* Header de sección */}
                <div className="flex items-center gap-4 px-7 py-5 border-b border-slate-100">
                  <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center ${s.color} flex-shrink-0`}>
                    {s.icon}
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      Art. {s.numero}
                    </span>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                      {s.titulo}
                    </h2>
                  </div>
                </div>

                {/* Contenido */}
                <div className="px-7 py-6">
                  {s.contenido}
                </div>
              </div>
            ))}
          </div>

          {/* Contacto legal */}
          <div className="mt-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 flex-shrink-0">
                <FaEnvelope size={14}/>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Consultas sobre privacidad</p>
                <a
                  href="mailto:contacto@alturasyriesgos.com"
                  className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  contacto@alturasyriesgos.com
                </a>
              </div>
            </div>
            <Link
              href="/datos"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex-shrink-0"
            >
              Manual de Datos
              <FaArrowLeft size={9} className="rotate-180 transition-transform group-hover:translate-x-1"/>
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 font-medium mt-10">
            © {new Date().getFullYear()} Alturas y Riesgos de la Costa S.A.S — Sincelejo, Sucre, Colombia.
          </p>

        </div>
      </section>
    </>
  );
}