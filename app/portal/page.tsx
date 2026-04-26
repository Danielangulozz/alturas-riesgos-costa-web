"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { generarPDFCertificado } from "@/lib/certificadoLogic";
import QRCode from 'qrcode';
import {
  FaIdCard, FaSearch, FaArrowRight, FaShieldAlt, FaSignOutAlt,
  FaCheckCircle, FaExclamationTriangle, FaDownload, FaHistory, FaUserGraduate, FaImage
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import * as htmlToImage from 'html-to-image';

// ─── Componente Animado ───
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

function AnimateIn({ children, delay = 0, from = "fadeUp", className = "" }: { children: React.ReactNode; delay?: number; from?: "fadeUp" | "fadeIn" | "fadeLeft" | "fadeRight"; className?: string; }) {
  const { ref, inView } = useInView();
  const base = { 
    fadeUp: "translate-y-6 opacity-0", 
    fadeIn: "opacity-0",
    fadeLeft: "-translate-x-6 opacity-0",
    fadeRight: "translate-x-6 opacity-0"
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

// ─── Carnet Digital Component ───
function CarnetDigital({ estudiante }: { estudiante: any }) {
  const [qrCodeData, setQrCodeData] = useState("");
  const carnetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generar el QR apuntando a la ruta de verificación
    const generateQR = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alturasyriesgos.vercel.app";
        const urlVerificacion = `${baseUrl}/certificados?q=${estudiante.cedula}`;
        const dataUrl = await QRCode.toDataURL(urlVerificacion, {
          width: 150,
          margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' }
        });
        setQrCodeData(dataUrl);
      } catch (err) {
        console.error("Error generando QR", err);
      }
    };
    generateQR();
  }, [estudiante]);

  const descargarCarnet = async () => {
    if (!carnetRef.current) return;
    const t = toast.loading("Generando imagen HD...");
    try {
      const dataUrl = await htmlToImage.toPng(carnetRef.current, {
        quality: 1,
        pixelRatio: 3, // Alta definición para celulares
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `Carnet_ARC_${estudiante.cedula}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("¡Imagen guardada en tu dispositivo!", { id: t });
    } catch (error) {
      console.error(error);
      toast.error("Error al descargar la imagen", { id: t });
    }
  };

  // Determinar si está vigente
  const esVigente = estudiante.certificado_generado && new Date(estudiante.certificado_fecha_vencimiento) > new Date();

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        ref={carnetRef}
        className="relative w-full max-w-[320px] aspect-[9/16] sm:aspect-auto sm:h-[450px] mx-auto overflow-hidden rounded-[2rem] shadow-2xl transition-all hover:-translate-y-1"
      >
      {/* Fondo y Estilos Corporativos */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-slate-800 to-slate-900" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/20 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2" />
      
      {/* Contenido del Carnet */}
      <div className="relative p-6 z-10 flex flex-col h-full text-white">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="bg-white p-1.5 rounded-lg shadow-lg">
            <img src="/LOGOSOLO.png" alt="ARC Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Carnet Digital</p>
            <p className="text-[10px] font-bold text-slate-300">ARC SYSTEM</p>
          </div>
        </div>

        {/* Info Principal */}
        <div className="mb-6 flex-1">
          <h2 className="text-lg sm:text-xl font-black uppercase leading-tight mb-1" style={{ letterSpacing: "-0.02em" }}>
            {estudiante.nombre}
          </h2>
          <p className="text-xs font-mono text-blue-400 mb-4">CC: {estudiante.cedula}</p>
          
          <div className="space-y-2">
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Curso Activo</p>
              <p className="text-[10px] font-bold text-slate-200 line-clamp-2 leading-tight uppercase">{estudiante.curso}</p>
            </div>
          </div>
        </div>

        {/* Footer del Carnet (QR y Status) */}
        <div className="flex justify-between items-end mt-auto pt-4 border-t border-white/10">
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Estado</p>
            {esVigente ? (
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded-md">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Vigente</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-md">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Inactivo/Vencido</span>
              </div>
            )}
            {estudiante.certificado_fecha_vencimiento && (
              <p className="text-[8px] font-bold text-slate-400 mt-1.5">Exp: {new Date(estudiante.certificado_fecha_vencimiento).toLocaleDateString()}</p>
            )}
          </div>

          <div className="bg-white p-1 rounded-xl shadow-lg shrink-0">
            {qrCodeData ? (
              <img src={qrCodeData} alt="QR Code" className="w-16 h-16 rounded-lg" />
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded-lg animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
      <button 
        onClick={descargarCarnet}
        className="w-full max-w-[320px] flex items-center justify-center gap-2 bg-[#FFD700] hover:bg-yellow-400 text-slate-900 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:-translate-y-0.5 shadow-lg shadow-yellow-500/20 active:scale-95"
      >
        <FaImage size={14} /> Guardar Carnet en Celular
      </button>
    </div>
  );
}

// ─── Portal Main Component ───
function PortalContent() {
  const [cedula, setCedula] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [cursosUsuario, setCursosUsuario] = useState<any[]>([]);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim()) return toast.error("Ingresa tu cédula");
    if (!fechaNacimiento) return toast.error("Ingresa tu fecha de nacimiento");

    setLoading(true);
    try {
      // Buscar en ambas tablas: preinscripciones y estudiantes
      const { data: pre } = await supabase.from("preinscripciones").select("*, agenda(*)").eq("cedula", cedula.trim());
      const { data: est } = await supabase.from("estudiantes").select("*, agenda(*)").eq("cedula", cedula.trim());

      const todos = [...(pre || []), ...(est || [])];

      if (todos.length === 0) {
        toast.error("No encontramos ningún registro con esta cédula.");
        setLoading(false);
        return;
      }

      // Validar PIN de Fecha de Nacimiento
      const coincideFecha = todos.some(t => t.fecha_nacimiento === fechaNacimiento);
      if (!coincideFecha) {
        toast.error("Credenciales incorrectas. Verifica tu cédula y fecha de nacimiento.");
        setLoading(false);
        return;
      }

      // Ordenar cursos por fecha de creación (más reciente primero)
      todos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setCursosUsuario(todos);
      setIsLoggedIn(true);
      toast.success(`¡Bienvenido, ${todos[0].nombre.split(" ")[0]}!`);

    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al portal.");
    } finally {
      setLoading(false);
    }
  };

  const handleDescargaPDF = async (curso: any) => {
    const t = toast.loading("Preparando tu certificado...");
    try {
      let horasReales = "40 horas";
      const { data: config } = await supabase.from("configuracion_cursos").select("horas_duracion").eq("nombre_curso", curso.curso).single();
      if (config?.horas_duracion) horasReales = config.horas_duracion;

      const bloqueAgenda = curso.agenda || { fecha: curso.certificado_fecha_emision, fecha_fin: curso.certificado_fecha_emision, intensidad_horaria: horasReales };
      
      await generarPDFCertificado(curso, bloqueAgenda);
      toast.dismiss(t);
      toast.success("Descarga completada");
    } catch (err) {
      toast.error("No se pudo generar el certificado. Contacta a soporte.", { id: t });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCursosUsuario([]);
    setCedula("");
    setFechaNacimiento("");
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md w-full mx-auto pb-20 pt-28 px-4 relative z-10">
        <div className={`text-center mb-10 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5 shadow-lg shadow-slate-900/20">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Portal del Estudiante
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-3" style={{ letterSpacing: "-0.03em" }}>
            Inicia Sesión en tu <span className="text-blue-600">Cuenta</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
            Accede a tu carnet digital, descarga tus certificados y consulta tu historial.
          </p>
        </div>

        <AnimateIn from="fadeUp" delay={100}>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Documento de Identidad</label>
                <div className="relative group">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14}/>
                  <input
                    type="text"
                    required
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ej: 1045123456"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-base font-bold placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN (Fecha de Nacimiento)</label>
                <div className="relative group">
                  <input
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-base font-bold placeholder:font-normal placeholder:text-slate-400 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-slate-900 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-wait"
              >
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Accediendo...</> : "Ingresar al Portal"}
              </button>
            </form>
          </div>
        </AnimateIn>
      </div>
    );
  }

  // Vista del Estudiante Logueado
  const estudianteActivo = cursosUsuario[0]; // El más reciente

  return (
    <div className="max-w-4xl w-full mx-auto pb-20 pt-28 px-4 relative z-10">
      
      {/* Header Logueado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <AnimateIn from="fadeLeft">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            Portal Estudiantil
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase" style={{ letterSpacing: "-0.03em" }}>
            ¡Hola, <span className="text-blue-600">{estudianteActivo.nombre.split(" ")[0]}</span>!
          </h1>
        </AnimateIn>
        
        <AnimateIn from="fadeRight" delay={100}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"
          >
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </AnimateIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Carnet Digital */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <AnimateIn from="fadeUp" delay={200}>
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <FaUserGraduate className="text-blue-500 text-xl" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Identificación</h3>
              </div>
              <CarnetDigital estudiante={estudianteActivo} />
              
              <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <FaShieldAlt className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-bold text-blue-800 uppercase leading-relaxed">
                  Este carnet digital contiene un código QR encriptado válido para inspecciones de seguridad en campo.
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>

        {/* Columna Derecha: Historial de Cursos */}
        <div className="lg:col-span-7">
          <AnimateIn from="fadeUp" delay={300}>
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-8 border-b border-slate-50 pb-4">
                <FaHistory className="text-slate-400 text-xl" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Historial Académico</h3>
              </div>

              <div className="space-y-4">
                {cursosUsuario.map((curso, idx) => (
                  <div key={curso.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-100 transition-all gap-4 group">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {new Date(curso.created_at).getFullYear()}
                      </p>
                      <h4 className="font-black text-slate-800 text-sm uppercase leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                        {curso.curso}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {curso.certificado_generado ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                            <FaCheckCircle size={8}/> Certificado Emitido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                            <FaExclamationTriangle size={8}/> En Proceso
                          </span>
                        )}
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          | Cod: {curso.certificado_codigo || "Pendiente"}
                        </span>
                      </div>
                    </div>

                    {curso.certificado_generado && (
                      <button
                        onClick={() => handleDescargaPDF(curso)}
                        className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <FaDownload size={12}/> Obtener PDF
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AnimateIn>
        </div>

      </div>
    </div>
  );
}

export default function PortalPage() {
  return (
    <section className="relative min-h-screen bg-slate-50 flex flex-col items-center overflow-x-hidden">
      <Toaster position="bottom-center" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[140px] opacity-70 -z-10 -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-[120px] opacity-50 -z-10 -ml-32 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none -z-10" style={{ backgroundImage: "radial-gradient(#64748b 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>}>
        <PortalContent />
      </Suspense>
    </section>
  );
}
