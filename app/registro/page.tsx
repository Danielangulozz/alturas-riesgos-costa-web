"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import {
  FaCloudUploadAlt, FaCheckCircle, FaSearch, FaFilePdf,
  FaShieldAlt, FaInfoCircle, FaArrowRight, FaExternalLinkAlt,
  FaIdCard, FaSync
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// ─── Tipos ───
interface DocumentoInfo { label: string; col: string; desc: string; }
interface UsuarioData   { id: string; nombre: string; cedula: string; curso: string; [key: string]: string | undefined; }

// ─── Catálogo de documentos ───
const MAPA_DOCUMENTOS: Record<string, DocumentoInfo> = {
  cc:          { label: "Cédula de Ciudadanía",    col: "url_cc",          desc: "Ambas caras (PDF o Foto)" },
  arl:         { label: "Certificado ARL",          col: "url_arl",         desc: "Vigente – menos de 30 días" },
  emo:         { label: "Examen Médico Ocupacional",col: "url_emo",         desc: "Con aptitud para alturas" },
  eps:         { label: "Certificado EPS",          col: "url_eps",         desc: "Estado: Activo" },
  cert_altura: { label: "Cert. Alturas Anterior",   col: "url_cert_altura", desc: "Solo reentrenamiento" },
  cert_sst:    { label: "Certificado 20h SST",      col: "url_cert_sst",    desc: "Solo coordinadores/jefes" },
};

// ─── AnimateIn (mismo sistema que el resto del sitio) ───
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
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

// ─── Barra de progreso ───
function ProgressBar({ total, listos }: { total: number; listos: number }) {
  const pct = total === 0 ? 0 : Math.round((listos / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Progreso</span>
        <span className="text-xs font-black text-slate-700">{listos}/{total} documentos</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && (
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
          <FaCheckCircle size={10}/> Documentación completa
        </p>
      )}
    </div>
  );
}

// ─── Tarjeta de documento ───
function DocCard({
  codigoDoc, infoDoc, urlArchivo, uploading, onSubida
}: {
  codigoDoc: string; infoDoc: DocumentoInfo; urlArchivo?: string;
  uploading: string | null; onSubida: (e: React.ChangeEvent<HTMLInputElement>, cod: string) => void;
}) {
  const estaListo  = !!urlArchivo;
  const subiendo   = uploading === codigoDoc;
  const bloqueado  = !!uploading && !subiendo;

  return (
    <div className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
      estaListo
        ? "border-emerald-200 bg-emerald-50/40"
        : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-md"
    }`}>

      {/* Línea de color superior */}
      <div className={`absolute top-0 left-0 h-0.5 transition-all duration-500 ${
        estaListo ? "w-full bg-gradient-to-r from-emerald-400 to-teal-400"
                  : "w-0 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full"
      }`} />

      <div className="p-5">
        {/* Header de la tarjeta */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
              estaListo ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
            }`}>
              {estaListo ? <FaCheckCircle size={14}/> : <FaFilePdf size={14}/>}
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 leading-tight">{infoDoc.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{infoDoc.desc}</p>
            </div>
          </div>

          {/* Badge estado */}
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
            estaListo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
          }`}>
            {estaListo ? "✓ Listo" : "Pendiente"}
          </span>
        </div>

        {/* Botón de subida */}
        <label className={`
          relative flex items-center justify-center gap-2 w-full py-3 rounded-xl
          cursor-pointer font-black text-[10px] uppercase tracking-widest
          transition-all duration-200 overflow-hidden
          ${bloqueado   ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
          : subiendo    ? "bg-slate-100 text-slate-500 cursor-wait"
          : estaListo   ? "bg-white border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        : "bg-slate-900 text-white hover:bg-blue-700 shadow-lg hover:-translate-y-0.5"}
        `}>
          {subiendo ? (
            <>
              <span className="w-3 h-3 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin"/>
              Subiendo...
            </>
          ) : (
            <>
              <FaCloudUploadAlt size={13}/>
              {estaListo ? "Reemplazar" : "Subir Archivo"}
              {!estaListo && !bloqueado && <FaArrowRight size={9} className="ml-1"/>}
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={(e) => onSubida(e, codigoDoc)}
            disabled={!!uploading}
          />
        </label>

        {/* Ver archivo actual */}
        {estaListo && (
          <a
            href={urlArchivo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors"
          >
            <FaExternalLinkAlt size={9}/> Ver documento actual
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Contenido principal ───
function ContenidoSubida() {
  const searchParams = useSearchParams();

  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [datosUsuario,   setDatosUsuario]   = useState<UsuarioData | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [uploading,      setUploading]      = useState<string | null>(null);
  const [headerVisible,  setHeaderVisible]  = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) buscarPorId(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const buscarPorId = async (id: string) => {
    setLoading(true);
    const { data } = await supabase.from("preinscripciones").select("*").eq("id", id).maybeSingle();
    if (data) { setDatosUsuario(data); toast.success(`Hola, ${data.nombre.split(" ")[0]} 👋`); }
    else toast.error("No encontramos tu registro.");
    setLoading(false);
  };

  const buscarPorCedula = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cedula = cedulaBusqueda.trim();
    if (!cedula) return toast.error("Escribe tu cédula");
    setLoading(true);
    try {
      const { data, error } = await supabase.from("preinscripciones")
        .select("*").eq("cedula", cedula).maybeSingle();
      if (error || !data) {
        toast.error("No encontramos tu registro.");
        setDatosUsuario(null);
      } else {
        setDatosUsuario(data);
        toast.success(`Hola, ${data.nombre.split(" ")[0]} 👋`);
      }
    } catch { toast.error("Error de conexión"); }
    finally  { setLoading(false); }
  };

  const obtenerRequeridos = (curso: string) => {
    const reqs = ["cc", "arl", "emo", "eps"];
    const c = (curso || "").toLowerCase();
    if (c.includes("reentrenamiento")) reqs.push("cert_altura");
    else if (c.includes("coordinador") || c.includes("jefe")) {
      reqs.push("cert_altura");
      reqs.push("cert_sst");
    }
    return reqs;
  };

  const manejarSubida = async (e: React.ChangeEvent<HTMLInputElement>, codigoDoc: string) => {
    if (!e.target.files?.length || !datosUsuario) return;
    const file   = e.target.files[0];
    const colBD  = MAPA_DOCUMENTOS[codigoDoc].col;

    if (file.size > 6 * 1024 * 1024) return toast.error("Archivo muy pesado. Máx 6MB.");

    setUploading(codigoDoc);
    const tId = toast.loading("Subiendo documento...", { position: "bottom-center" });

    try {
      const ext = file.type === "application/pdf" ? "pdf"
                : file.type === "image/png"        ? "png" : "jpg";
      const fileName = `${datosUsuario.cedula}/${codigoDoc}_${Date.now()}.${ext}`;
      const buffer   = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("docs_students")
        .upload(fileName, buffer, { cacheControl: "3600", upsert: true, contentType: file.type });

      if (uploadError) throw new Error("Error al subir a la nube.");

      const { data: urlData } = supabase.storage.from("docs_students").getPublicUrl(fileName);

      const { data: upd, error: dbError } = await supabase
        .from("preinscripciones")
        .update({ [colBD]: urlData.publicUrl })
        .eq("id", datosUsuario.id)
        .select();

      if (dbError || !upd?.length) throw new Error("No se pudo guardar. Revisa conexión.");

      setDatosUsuario(prev => prev ? { ...prev, [colBD]: urlData.publicUrl } : null);
      toast.success("¡Documento guardado!", { id: tId });
    } catch (err: any) {
      toast.error(err.message || "Error desconocido", { id: tId });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  // Calcular progreso
  const requeridos = datosUsuario ? obtenerRequeridos(datosUsuario.curso) : [];
  const listos     = requeridos.filter(cod => !!datosUsuario?.[MAPA_DOCUMENTOS[cod].col]).length;

  return (
    <div className="max-w-xl w-full mx-auto pb-20 pt-28 px-4">

      {/* ── HEADER ── */}
      <div
        className={`text-center mb-10 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Gestión Documental
        </div>

        <h1
          className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4"
          style={{ letterSpacing: "-0.03em" }}
        >
          Sube tus{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Documentos
            </span>
            <span
              className={`absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000 delay-500 ${headerVisible ? "w-full" : "w-0"}`}
            />
          </span>
        </h1>

        <p
          className={`text-slate-500 text-sm max-w-xs mx-auto leading-relaxed transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          Carga tu documentación de forma segura. Busca tu registro con tu número de cédula.
        </p>
      </div>

      {/* ── BUSCADOR ── */}
      {!datosUsuario ? (
        <AnimateIn from="fadeUp" delay={100}>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">

            {/* Ícono central */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <FaIdCard size={24}/>
              </div>
            </div>

            <div className="text-center mb-7">
              <h3 className="text-lg font-black text-slate-800 mb-1" style={{ letterSpacing: "-0.02em" }}>Identifícate</h3>
              <p className="text-slate-400 text-sm">Ingresa tu número de documento para continuar.</p>
            </div>

            <form onSubmit={buscarPorCedula} className="space-y-4">
              <div className="relative group">
                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14}/>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ej: 1102839100"
                  value={cedulaBusqueda}
                  onChange={(e) => setCedulaBusqueda(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-base font-bold text-center placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full py-4 bg-slate-900 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-wait"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Buscando...</>
                  : <><FaSearch size={12}/> Buscar Registro <FaArrowRight size={10} className="transition-transform group-hover:translate-x-1"/></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 font-medium mt-5">
              Tu registro debe existir en nuestra base de datos.
            </p>
          </div>
        </AnimateIn>
      ) : (

        /* ── VISTA DE DOCUMENTOS ── */
        <div className="space-y-5">

          {/* Tarjeta de perfil */}
          <AnimateIn from="fadeUp" delay={0}>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

              {/* Header degradado oscuro */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-7 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {datosUsuario.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Postulante</p>
                    <h2 className="text-base font-black text-white leading-none uppercase" style={{ letterSpacing: "-0.01em" }}>
                      {datosUsuario.nombre}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{datosUsuario.curso}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDatosUsuario(null)}
                  className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                >
                  <FaSync size={9}/> Cambiar
                </button>
              </div>

              {/* Barra de progreso */}
              <div className="px-7 py-5">
                <ProgressBar total={requeridos.length} listos={listos} />
              </div>
            </div>
          </AnimateIn>

          {/* Grid de documentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requeridos.map((cod, idx) => (
              <AnimateIn key={cod} from="fadeUp" delay={idx * 70}>
                <DocCard
                  codigoDoc={cod}
                  infoDoc={MAPA_DOCUMENTOS[cod]}
                  urlArchivo={datosUsuario[MAPA_DOCUMENTOS[cod].col]}
                  uploading={uploading}
                  onSubida={manejarSubida}
                />
              </AnimateIn>
            ))}
          </div>

          {/* Info */}
          <AnimateIn from="fadeUp" delay={requeridos.length * 70 + 100}>
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <FaInfoCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={14}/>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                Cuando todos los documentos estén en verde, tu expediente estará completo y será revisado por el equipo.
                <span className="font-black"> Máx. 6MB por archivo.</span>
              </p>
            </div>
          </AnimateIn>
        </div>
      )}

      {/* Footer */}
      <div
        className={`flex items-center justify-center gap-2 mt-10 transition-all duration-700 delay-500 ${headerVisible ? "opacity-100" : "opacity-0"}`}
      >
        <FaShieldAlt className="text-slate-300" size={12}/>
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Alturas y Riesgos de la Costa S.A.S — Plataforma segura
        </p>
      </div>
    </div>
  );
}

// ─── Página exportada ───
export default function Page() {
  return (
    <section className="relative min-h-screen bg-slate-50 overflow-x-hidden">
      <Toaster position="bottom-center"/>

      {/* Blobs igual que el resto del sitio */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[140px] opacity-60 -z-10 -mr-40 -mt-40 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-[120px] opacity-50 -z-10 -ml-32 pointer-events-none" />
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none -z-10"
        style={{ backgroundImage: "radial-gradient(#64748b 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-12 h-12 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"/>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Cargando...</p>
        </div>
      }>
        <ContenidoSubida />
      </Suspense>
    </section>
  );
}