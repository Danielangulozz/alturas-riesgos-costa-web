"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { generarPDFCertificado } from "@/lib/certificadoLogic";
import {
  FaSearch, FaDownload, FaCheckCircle, FaSpinner,
  FaIdCard, FaCalendarCheck, FaClock, FaExclamationTriangle,
  FaWhatsapp, FaEnvelope, FaArrowRight, FaShieldAlt
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// ─── AnimateIn (mismo sistema que el resto del sitio) ───
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function AnimateIn({ children, delay = 0, from = "fadeUp", className = "" }: {
  children: React.ReactNode; delay?: number;
  from?: "fadeUp" | "fadeLeft" | "fadeRight" | "fadeIn"; className?: string;
}) {
  const { ref, inView } = useInView();
  const base: Record<string, string> = {
    fadeUp:    "translate-y-6 opacity-0",
    fadeLeft:  "-translate-x-6 opacity-0",
    fadeRight: "translate-x-6 opacity-0",
    fadeIn:    "opacity-0",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${inView ? "translate-y-0 translate-x-0 opacity-100" : base[from]}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// ─── Contenido con lógica de búsqueda ───
function SearchContent() {
  const searchParams = useSearchParams();

  const [query, setQuery]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [resultado, setResultado]       = useState<any>(null);
  const [bloqueAgenda, setBloqueAgenda] = useState<any>(null);
  const [horasCurso, setHorasCurso]     = useState("40 horas");
  const [error, setError]               = useState("");
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) { setQuery(q); handleSearch(q); }
  }, [searchParams]);

  const handleSearch = async (busquedaManual?: string) => {
    const valor = (busquedaManual || query).trim();
    if (!valor) return toast.error("Ingresa una cédula o código");

    setLoading(true);
    setError("");
    setResultado(null);
    setBloqueAgenda(null);
    setHorasCurso("Calculando...");

    try {
      let { data: cert } = await supabase
        .from("preinscripciones")
        .select(`*, agenda(*)`)
        .eq("certificado_codigo", valor)
        .eq("certificado_generado", true)
        .single();

      if (!cert) {
        const { data: certCedula } = await supabase
          .from("preinscripciones")
          .select(`*, agenda(*)`)
          .eq("cedula", valor)
          .eq("certificado_generado", true)
          .order("certificado_fecha_emision", { ascending: false })
          .limit(1)
          .single();
        if (certCedula) cert = certCedula;
      }

      if (cert) {
        let horasReales = "40 horas";
        const { data: config } = await supabase
          .from("configuracion_cursos")
          .select("horas_duracion")
          .eq("nombre_curso", cert.curso)
          .single();

        if (config?.horas_duracion)            horasReales = config.horas_duracion;
        else if (cert.agenda?.intensidad_horaria) horasReales = cert.agenda.intensidad_horaria;

        setHorasCurso(horasReales);
        setResultado(cert);
        setBloqueAgenda(cert.agenda ?? {
          fecha: cert.certificado_fecha_emision,
          fecha_fin: cert.certificado_fecha_emision,
          intensidad_horaria: horasReales,
        });
        toast.success("Certificado Auténtico ✓");
      } else {
        setError("El código o documento consultado NO existe en nuestra base de datos oficial. Podría tratarse de un documento fraudulento.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const descargarCopia = async () => {
    if (!resultado || !bloqueAgenda) return;
    const t = toast.loading("Generando PDF original...");
    try {
      await generarPDFCertificado(resultado, bloqueAgenda);
      toast.dismiss(t);
      toast.success("Descarga iniciada");
    } catch {
      toast.error("Error al generar PDF");
    }
  };

  return (
    <div className="relative max-w-xl w-full mx-auto z-10 pb-20">

      {/* ── HEADER ── */}
      <div
        className={`text-center mb-10 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Sistema de Verificación
        </div>

        <h1
          className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4"
          style={{ letterSpacing: "-0.03em" }}
        >
          Valida tu{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Certificado
            </span>
            {/* Línea animada */}
            <span
              className={`absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000 delay-500 ${headerVisible ? "w-full" : "w-0"}`}
            />
          </span>
        </h1>

        <p
          className={`text-slate-500 max-w-sm mx-auto leading-relaxed text-sm transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          Consulta la autenticidad de cualquier certificado emitido por Alturas y Riesgos de la Costa en tiempo real.
        </p>
      </div>

      {/* ── BUSCADOR ── */}
      <AnimateIn from="fadeUp" delay={100}>
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">

          {/* Shield decorativo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <FaShieldAlt size={24} />
            </div>
          </div>

          <div className="space-y-4">
            {/* Input */}
            <div className="relative group">
              <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14}/>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Código de verificación o Cédula..."
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Botón */}
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="group w-full py-4 bg-slate-900 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-wait"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verificando...</>
                : <><FaSearch size={12}/> Consultar Certificado <FaArrowRight size={10} className="transition-transform group-hover:translate-x-1"/></>
              }
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 font-medium mt-4">
            Válido para certificados emitidos desde 2026 en adelante.
          </p>
        </div>
      </AnimateIn>

      {/* ── RESULTADO: ÉXITO ── */}
      {resultado && (
        <AnimateIn from="fadeUp" delay={0}>
          <div className="mt-6 bg-white rounded-[2rem] border border-emerald-100 shadow-sm overflow-hidden">

            {/* Header verde */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 flex items-center gap-4 border-b border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FaCheckCircle size={22} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Certificado Vigente
                </div>
                <h2 className="text-xl font-black text-slate-900 leading-none" style={{ letterSpacing: "-0.02em" }}>
                  {resultado.nombre}
                </h2>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="p-8 space-y-6">

              {/* Curso */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Certificación en</p>
                <p className="text-lg font-black text-slate-800 leading-tight" style={{ letterSpacing: "-0.01em" }}>
                  {resultado.curso}
                </p>
              </div>

              {/* Grid de detalles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha Emisión</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FaCalendarCheck className="text-emerald-500" size={12}/>
                    {resultado.certificado_fecha_emision}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Intensidad</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FaClock className="text-blue-500" size={12}/>
                    {horasCurso}
                  </p>
                </div>
              </div>

              {/* Código único */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código Único</span>
                <span className="font-mono text-xs font-bold text-slate-700">{resultado.certificado_codigo}</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* Botón descarga */}
              <button
                onClick={descargarCopia}
                className="group w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:-translate-y-0.5 shadow-xl"
              >
                <FaDownload size={12}/>
                Descargar PDF Original
                <FaArrowRight size={10} className="transition-transform group-hover:translate-x-1"/>
              </button>
            </div>
          </div>
        </AnimateIn>
      )}

      {/* ── RESULTADO: ERROR ── */}
      {error && (
        <AnimateIn from="fadeUp" delay={0}>
          <div className="mt-6 bg-white rounded-[2rem] border border-red-100 shadow-sm overflow-hidden">

            {/* Header rojo */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 px-8 py-6 flex items-center gap-4 border-b border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 flex-shrink-0">
                <FaExclamationTriangle size={20} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Advertencia de Seguridad
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-none" style={{ letterSpacing: "-0.01em" }}>
                  Documento No Encontrado
                </h3>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="p-8 space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                {error}
              </p>

              <div className="h-px bg-slate-100" />

              <p className="text-xs font-bold text-slate-500">¿Crees que es un error? Contáctanos:</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:admin@alturasyriesgos.com?subject=Error Verificación&body=Código consultado: ${query}`}
                  className="group flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:border-slate-400 transition-all"
                >
                  <FaEnvelope size={12} className="text-slate-400"/> Reportar por Correo
                </a>
                <a
                  href={`https://wa.me/573148475070?text=Hola, problema verificando: ${query}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-lg"
                >
                  <FaWhatsapp size={13}/> Contactar Soporte
                  <FaArrowRight size={9} className="transition-transform group-hover:translate-x-1"/>
                </a>
              </div>
            </div>
          </div>
        </AnimateIn>
      )}

      {/* Footer */}
      <p className={`text-center text-xs text-slate-400 font-medium mt-10 transition-all duration-700 delay-500 ${headerVisible ? "opacity-100" : "opacity-0"}`}>
        © {new Date().getFullYear()} Alturas y Riesgos de la Costa S.A.S | Todos los derechos reservados
      </p>
    </div>
  );
}

// ─── Página principal ───
export default function CertificadosPage() {
  return (
    <section className="relative min-h-screen bg-slate-50 px-6 pt-28 flex flex-col items-center overflow-x-hidden">
      <Toaster position="bottom-center" />

      {/* Blob decorativo (mismo que las otras páginas) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[140px] opacity-70 -z-10 -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-[120px] opacity-50 -z-10 -ml-32 pointer-events-none" />

      {/* Grid de puntos sutil */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none -z-10"
        style={{ backgroundImage: "radial-gradient(#64748b 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-12 h-12 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Cargando sistema...</p>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </section>
  );
}