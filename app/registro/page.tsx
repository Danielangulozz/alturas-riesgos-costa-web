"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import {
  FaCloudUploadAlt, FaCheckCircle, FaSearch, FaFilePdf,
  FaShieldAlt, FaInfoCircle, FaArrowRight, FaExternalLinkAlt,
  FaIdCard, FaSync, FaTimesCircle
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
  codigoDoc, infoDoc, urlArchivo, uploading, onSubida, verificacion, oldUrl, onReutilizar
}: {
  codigoDoc: string; infoDoc: DocumentoInfo; urlArchivo?: string;
  uploading: string | null; onSubida: (e: React.ChangeEvent<HTMLInputElement>, cod: string) => void;
  verificacion?: { status: string; by?: string; at?: string };
  oldUrl?: string; onReutilizar?: (cod: string, url: string) => void;
}) {
  const estaListo  = !!urlArchivo;
  const subiendo   = uploading === codigoDoc;
  const bloqueado  = !!uploading && !subiendo;
  
  const status = verificacion?.status || (estaListo ? 'enviado' : 'pendiente');

  // Definición de mapas de estilos para evitar circularidad
  const estilosMap = {
    pendiente: { border: "border-slate-100 bg-white", header: "bg-slate-100 text-slate-400", badge: "bg-slate-100 text-slate-400", text: "Pendiente", icon: <FaFilePdf size={14}/> },
    enviado:   { border: "border-blue-200 bg-blue-50/40", header: "bg-blue-100 text-blue-600", badge: "bg-blue-100 text-blue-700", text: "Enviado", icon: <FaCloudUploadAlt size={14}/> },
    approved:  { border: "border-emerald-200 bg-emerald-50/40", header: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-600 text-white", text: "Aprobado", icon: <FaCheckCircle size={14}/> },
    rejected:  { border: "border-red-200 bg-red-50/40", header: "bg-red-100 text-red-600", badge: "bg-red-600 text-white", text: "Rechazado", icon: <FaTimesCircle size={14}/> }
  };

  const estilos = estilosMap[status as keyof typeof estilosMap] || estilosMap.pendiente;

  return (
    <div className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${estilos.border}`}>
      {/* Línea de color superior */}
      <div className={`absolute top-0 left-0 h-0.5 transition-all duration-500 w-full ${
        status === 'approved' ? 'bg-emerald-500' : status === 'rejected' ? 'bg-red-500' : status === 'enviado' ? 'bg-blue-500' : 'bg-transparent group-hover:bg-slate-200'
      }`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${estilos.header}`}>
              {estilos.icon}
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 leading-tight">{infoDoc.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{infoDoc.desc}</p>
            </div>
          </div>
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${estilos.badge}`}>
            {estilos.text}
          </span>
        </div>

        <label className={`
          relative flex items-center justify-center gap-2 w-full py-3 rounded-xl
          cursor-pointer font-black text-[10px] uppercase tracking-widest
          transition-all duration-200 overflow-hidden
          ${bloqueado   ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
          : subiendo    ? "bg-slate-100 text-slate-500 cursor-wait"
          : status === 'rejected' ? "bg-red-600 text-white hover:bg-red-700 shadow-lg"
          : estaListo   ? "bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
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
              {status === 'rejected' ? "Subir de nuevo" : estaListo ? "Reemplazar" : "Subir Archivo"}
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

        {oldUrl && !estaListo && onReutilizar && (
          <button
            onClick={() => onReutilizar(codigoDoc, oldUrl)}
            className="w-full mt-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 border border-blue-100"
            disabled={!!uploading}
          >
            <FaSync size={10} className={uploading === codigoDoc ? "animate-spin" : ""} /> 
            Reutilizar de curso previo
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Contenido principal ───
function ContenidoSubida() {
  const searchParams = useSearchParams();

  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [fechaNacimientoBusqueda, setFechaNacimientoBusqueda] = useState("");
  const [datosUsuario,   setDatosUsuario]   = useState<UsuarioData | null>(null);
  const [listaCursos,    setListaCursos]    = useState<UsuarioData[]>([]);
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
    try {
      // Intentar en preinscripciones
      const { data: pre } = await supabase.from("preinscripciones").select("*").eq("id", id).maybeSingle();
      if (pre) {
        setDatosUsuario({ ...pre, tabla_origen: 'preinscripciones' });
        toast.success(`Hola, ${pre.nombre.split(" ")[0]} 👋`);
        return;
      }
      // Intentar en estudiantes
      const { data: est } = await supabase.from("estudiantes").select("*").eq("id", id).maybeSingle();
      if (est) {
        setDatosUsuario({ ...est, tabla_origen: 'estudiantes' });
        toast.success(`Hola, ${est.nombre.split(" ")[0]} 👋`);
      } else {
        toast.error("No encontramos tu registro.");
      }
    } catch (err) {
      console.error("Error buscarPorId:", err);
    } finally {
      setLoading(false);
    }
  };

  const buscarPorCedula = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cedula = cedulaBusqueda.trim();
    if (!cedula) return toast.error("Escribe tu cédula");
    if (!fechaNacimientoBusqueda) return toast.error("Ingresa tu fecha de nacimiento");
    
    setLoading(true);
    try {
      console.log("Buscando cédula:", cedula);
      // 1. Buscar en preinscripciones
      const { data: pre, error: preError } = await supabase.from("preinscripciones")
        .select("*").eq("cedula", cedula).order("created_at", { ascending: false });
      
      // 2. Buscar en estudiantes
      const { data: est, error: estError } = await supabase.from("estudiantes")
        .select("*").eq("cedula", cedula).order("created_at", { ascending: false });

      const todos = [
        ...(pre || []).map(p => ({ ...p, tabla_origen: 'preinscripciones' })),
        ...(est || []).map(e => ({ ...e, tabla_origen: 'estudiantes' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (todos.length === 0) {
        toast.error("No encontramos tu registro. Verifica el número.");
        return;
      }

      // Validación de seguridad por Fecha de Nacimiento
      const coincideFecha = todos.some(t => t.fecha_nacimiento === fechaNacimientoBusqueda);
      if (!coincideFecha) {
        toast.error("Credenciales incorrectas. Verifica tu cédula y fecha de nacimiento.");
        return;
      }

      setListaCursos(todos);
      setDatosUsuario(todos[0]);
      toast.success(`Hola, ${todos[0].nombre.split(" ")[0]} 👋`);
    } catch (err) { 
      console.error("Error búsqueda:", err);
      toast.error("Error de conexión"); 
    } finally { 
      setLoading(false); 
    }
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
    const tabla  = (datosUsuario as any).tabla_origen || 'preinscripciones';

    console.log("Iniciando subida:", { codigoDoc, colBD, tabla, fileName: file.name });

    if (file.size > 10 * 1024 * 1024) return toast.error("Archivo muy pesado. Máx 10MB.");

    setUploading(codigoDoc);
    const tId = toast.loading("Subiendo documento...", { position: "bottom-center" });

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${datosUsuario.cedula}/${codigoDoc}_${Date.now()}.${ext}`;

      // 1. SUBIR A STORAGE
      console.log("Subiendo a Storage bucket 'docs_students'...");
      const { error: uploadError } = await supabase.storage
        .from("docs_students")
        .upload(fileName, file, { 
          cacheControl: "3600", 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        console.error("Storage Error:", uploadError);
        alert(`Error Storage: ${uploadError.message}`);
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      console.log("Subida exitosa. Obteniendo URL pública...");
      const { data: urlData } = supabase.storage.from("docs_students").getPublicUrl(fileName);
      console.log("URL generada:", urlData.publicUrl);
      if (!datosUsuario.id) throw new Error("ID de usuario no encontrado. Recarga la página.");

      // 2. ACTUALIZAR BASE DE DATOS
      console.log(`Actualizando tabla '${tabla}' con ID ${datosUsuario.id}...`);
      const { error: dbError } = await supabase
        .from(tabla)
        .update({ [colBD]: urlData.publicUrl })
        .eq("id", datosUsuario.id);

      if (dbError) {
        console.error("Database Update Error:", dbError);
        alert(`Error Base de Datos: ${dbError.message}\nCódigo: ${dbError.code}\nDetalles: ${dbError.details}`);
        throw new Error(`Error al guardar: ${dbError.message}`);
      }

      console.log("Actualización de base de datos exitosa.");
      
      // Actualizar estado local inmediatamente
      setDatosUsuario(prev => {
        if (!prev) return null;
        const nuevo = { ...prev, [colBD]: urlData.publicUrl };
        console.log("Nuevo estado local del usuario:", nuevo);
        return nuevo;
      });

      toast.success("¡Documento guardado!", { id: tId });
      
    } catch (err: any) {
      console.error("Proceso fallido:", err);
      alert(`Fallo Total: ${err.message}`);
      toast.error(err.message || "Error al subir", { id: tId });
    } finally {
      setUploading(null);
      if (e.target) e.target.value = "";
    }
  };

  const manejarReutilizacion = async (codigoDoc: string, url: string) => {
    if (!datosUsuario) return;
    const colBD = MAPA_DOCUMENTOS[codigoDoc].col;
    const tabla = (datosUsuario as any).tabla_origen || 'preinscripciones';

    setUploading(codigoDoc);
    const tId = toast.loading("Asociando documento...");

    try {
      const { error: dbError } = await supabase
        .from(tabla)
        .update({ [colBD]: url })
        .eq("id", datosUsuario.id);

      if (dbError) throw dbError;

      setDatosUsuario(prev => {
        if (!prev) return null;
        return { ...prev, [colBD]: url };
      });
      
      setListaCursos(prev => prev.map(c => c.id === datosUsuario.id ? { ...c, [colBD]: url } : c));
      toast.success("Documento reutilizado correctamente", { id: tId });
      
    } catch (err: any) {
      toast.error(err.message || "Error al asociar", { id: tId });
    } finally {
      setUploading(null);
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
              <div className="space-y-3">
                <div className="relative group">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14}/>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ej: 1102839100"
                    value={cedulaBusqueda}
                    onChange={(e) => setCedulaBusqueda(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-base font-bold placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">PIN</div>
                  <input
                    type="date"
                    required
                    value={fechaNacimientoBusqueda}
                    onChange={(e) => setFechaNacimientoBusqueda(e.target.value)}
                    title="Fecha de Nacimiento"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-base font-bold placeholder:font-normal placeholder:text-slate-400 cursor-text"
                  />
                </div>
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
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">
                      {datosUsuario.tabla_origen === 'estudiantes' ? 'Estudiante Activo' : 'Pre-inscrito'} 
                      <span className="ml-2 text-slate-500 font-mono text-[8px]">ID: {datosUsuario.id.substring(0,8)}</span>
                    </p>
                    <h2 className="text-base font-black text-white leading-none uppercase" style={{ letterSpacing: "-0.01em" }}>
                      {datosUsuario.nombre}
                    </h2>
                    
                    {listaCursos.length > 1 ? (
                      <select 
                        value={datosUsuario.id}
                        onChange={(e) => {
                          const seleccionado = listaCursos.find(c => c.id === e.target.value);
                          if(seleccionado) setDatosUsuario(seleccionado);
                        }}
                        className="mt-1.5 w-full bg-slate-800 text-blue-200 text-xs p-1.5 font-bold rounded-lg border border-slate-700 outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                      >
                        {listaCursos.map(c => (
                          <option key={c.id} value={c.id}>{c.curso} ({c.tabla_origen === 'estudiantes' ? 'Activo' : 'Pendiente'})</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">{datosUsuario.curso}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setDatosUsuario(null); setListaCursos([]); }}
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
            {requeridos.map((cod, idx) => {
              let verificacion = {};
              try {
                const rawV = datosUsuario.doc_verification;
                const vObj = typeof rawV === 'string' ? JSON.parse(rawV) : rawV;
                verificacion = vObj?.[MAPA_DOCUMENTOS[cod].col] || {};
              } catch (e) {
                verificacion = {};
              }

              return (
                <AnimateIn key={cod} from="fadeUp" delay={idx * 70}>
                  <DocCard
                    codigoDoc={cod}
                    infoDoc={MAPA_DOCUMENTOS[cod]}
                    urlArchivo={datosUsuario[MAPA_DOCUMENTOS[cod].col]}
                    uploading={uploading}
                    onSubida={manejarSubida}
                    verificacion={verificacion as any}
                    oldUrl={listaCursos.find(c => c.id !== datosUsuario.id && !!c[MAPA_DOCUMENTOS[cod].col])?.[MAPA_DOCUMENTOS[cod].col]}
                    onReutilizar={manejarReutilizacion}
                  />
                </AnimateIn>
              );
            })}
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