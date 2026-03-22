"use client";

import React, { useState, useEffect } from "react";
import {
  FaBalanceScale, FaArrowLeft, FaEnvelope, FaMapMarkerAlt,
  FaUserShield, FaHandshake, FaShareAlt, FaExclamationTriangle
} from "react-icons/fa";
import Link from "next/link";

const derechosARCO = [
  {
    letra: "A",
    titulo: "Acceso",
    desc: "Conocer, actualizar y rectificar sus datos personales en cualquier momento.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    letra: "P",
    titulo: "Prueba",
    desc: "Solicitar prueba de la autorización otorgada para el tratamiento de sus datos.",
    color: "bg-violet-50 text-violet-600 border-violet-100",
  },
  {
    letra: "U",
    titulo: "Uso",
    desc: "Ser informado sobre el uso que se le ha dado a sus datos personales.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    letra: "R",
    titulo: "Revocación",
    desc: "Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios legales.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
];

const terceros = [
  "Ministerio del Trabajo — plataformas de registro de capacitación.",
  "Administradoras de Riesgos Laborales (ARL) para verificación de cobertura.",
  "Entidades auditoras o de control cuando la ley así lo exija.",
];

export default function TratamientoDatosPage() {
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
          <div className={`transition-all duration-500 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-8 transition-colors"
            >
              <FaArrowLeft size={10} className="transition-transform group-hover:-translate-x-1"/>
              Volver al inicio
            </Link>
          </div>

          {/* Header */}
          <div className={`mb-12 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
              Documento Legal
            </div>

            <h1
              className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4"
              style={{ letterSpacing: "-0.03em" }}
            >
              Manual de{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Tratamiento de Datos
                </span>
                <span className="line-grow absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"/>
              </span>
            </h1>

            <p className={`text-slate-400 text-sm transition-all duration-700 delay-200 ${headerVisible ? "opacity-100" : "opacity-0"}`}>
              Cumplimiento Ley 1581 de 2012 — Habeas Data
            </p>
          </div>

          {/* Marco legal — card oscura */}
          <div className={`bg-[#0F172A] rounded-[2rem] p-7 mb-6 flex items-start gap-5 transition-all duration-700 delay-300 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="w-11 h-11 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
              <FaBalanceScale size={18}/>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Marco Legal</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong className="text-white">ALTURAS Y RIESGOS DE LA COSTA S.A.S</strong> actúa como Responsable
                del Tratamiento de los datos personales. Esta política se rige por la{" "}
                <strong className="text-blue-400">Constitución Política de Colombia (Art. 15 y 20)</strong>,
                la <strong className="text-blue-400">Ley 1581 de 2012</strong>,
                el <strong className="text-blue-400">Decreto 1377 de 2013</strong> y demás normas concordantes.
              </p>
            </div>
          </div>

          {/* Derechos ARCO */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="flex items-center gap-4 px-7 py-5 border-b border-slate-100">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 flex-shrink-0">
                <FaUserShield size={15}/>
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                Derechos de los Titulares (ARCO)
              </h2>
            </div>
            <div className="p-7">
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Como titular de sus datos personales, usted tiene derecho a:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {derechosARCO.map((d) => (
                  <div key={d.letra} className={`flex items-start gap-4 p-4 rounded-2xl border ${d.color}`}>
                    <span className="text-xl font-black flex-shrink-0 leading-none mt-0.5">{d.letra}</span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1">{d.titulo}</p>
                      <p className="text-xs leading-relaxed opacity-80">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Datos sensibles */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="flex items-center gap-4 px-7 py-5 border-b border-slate-100">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                <FaExclamationTriangle size={14}/>
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                Tratamiento de Datos Sensibles
              </h2>
            </div>
            <div className="px-7 py-6">
              <p className="text-sm text-slate-500 leading-relaxed">
                Se informa al Titular que <strong className="text-slate-700">no está obligado</strong> a
                autorizar el tratamiento de datos sensibles. Sin embargo, para los cursos de alturas,
                el tratamiento de datos relacionados con la{" "}
                <strong className="text-slate-700">aptitud médica (salud)</strong> es estrictamente necesario
                para cumplir con la normatividad vigente y garantizar su seguridad durante el entrenamiento.
                Estos datos serán tratados con la máxima reserva y seguridad.
              </p>
            </div>
          </div>

          {/* Transmisión a terceros */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="flex items-center gap-4 px-7 py-5 border-b border-slate-100">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 flex-shrink-0">
                <FaShareAlt size={14}/>
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                Transmisión a Terceros
              </h2>
            </div>
            <div className="px-7 py-6">
              <p className="text-sm text-slate-500 mb-4">Sus datos podrán ser transmitidos a:</p>
              <ul className="space-y-3">
                {terceros.map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-500">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-2"/>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Canales de atención — card oscura */}
          <div className="bg-[#0F172A] rounded-[2rem] p-7 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
                <FaHandshake size={15}/>
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">
                Canales de Atención — Habeas Data
              </h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Para ejercer sus derechos de conocer, actualizar, rectificar y suprimir sus datos, contáctenos:
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <FaEnvelope size={13}/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Correo Electrónico</p>
                  <a
                    href="mailto:admin@alturasyriesgos.com"
                    className="text-sm font-bold text-white hover:text-blue-400 transition-colors"
                  >
                    admin@alturasyriesgos.com
                  </a>
                </div>
              </div>
              <div className="h-px bg-white/8"/>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <FaMapMarkerAlt size={13}/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Oficina Principal</p>
                  <p className="text-sm font-bold text-white">Cra 17 #27-35 · Sincelejo, Sucre</p>
                </div>
              </div>
            </div>
          </div>

          {/* Link a política de privacidad */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 font-medium">
              Consulta también nuestra{" "}
              <strong className="text-slate-700">Política de Privacidad</strong> para más detalles sobre cómo protegemos tu información.
            </p>
            <Link
              href="/privacidad"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex-shrink-0"
            >
              Ver Política
              <FaArrowLeft size={9} className="rotate-180 transition-transform group-hover:translate-x-1"/>
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 font-medium mt-10">
            La presente política rige a partir de su publicación. · © {new Date().getFullYear()} Alturas y Riesgos de la Costa S.A.S
          </p>

        </div>
      </section>
    </>
  );
}