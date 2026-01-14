"use client";

import React, { useState, useEffect, Suspense } from "react"; // 1. IMPORTAR SUSPENSE
import { useSearchParams } from "next/navigation"; 
import { supabase } from "@/lib/supabase"; 
import { generarPDFCertificado } from "@/lib/certificadoLogic"; 
import { FaSearch, FaDownload, FaCheckCircle, FaTimesCircle, FaSpinner, FaIdCard, FaCalendarCheck } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// 2. CAMBIAMOS EL NOMBRE DE TU FUNCIÓN ORIGINAL A "SearchContent" O ALGO INTERNO
function SearchContent() {
  const searchParams = useSearchParams();
  
  // Estados
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [bloqueAgenda, setBloqueAgenda] = useState<any>(null); 
  const [error, setError] = useState("");

  // EFECTO: Detectar QR
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      handleSearch(q); 
    }
  }, [searchParams]);

  // FUNCIÓN DE BÚSQUEDA
  const handleSearch = async (busquedaManual?: string) => {
    const valor = busquedaManual || query;
    if (!valor) return toast.error("Ingresa una cédula o código");

    setLoading(true);
    setError("");
    setResultado(null);
    setBloqueAgenda(null);

    try {
      // A. Buscamos primero por CÓDIGO ÚNICO
      let { data: cert, error } = await supabase
        .from('preinscripciones')
        .select(`*, agenda(*)`) 
        .eq('certificado_codigo', valor)
        .eq('certificado_generado', true)
        .single();

      // B. Si no encuentra por código, buscamos por CÉDULA
      if (!cert) {
        const { data: certCedula } = await supabase
          .from('preinscripciones')
          .select(`*, agenda(*)`)
          .eq('cedula', valor)
          .eq('certificado_generado', true)
          .order('certificado_fecha_emision', { ascending: false }) 
          .limit(1)
          .single();
        
        if (certCedula) cert = certCedula;
      }

      if (cert) {
        setResultado(cert);
        if (cert.agenda) {
            setBloqueAgenda(cert.agenda);
        } else {
            setBloqueAgenda({ 
                fecha: cert.certificado_fecha_emision, 
                fecha_fin: cert.certificado_fecha_emision, 
                intensidad_horaria: "40 horas" 
            });
        }
        toast.success("Certificado Encontrado");
      } else {
        setError("No se encontró ningún certificado vigente con esos datos.");
      }

    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al buscar. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN DE DESCARGA
  const descargarCopia = async () => {
    if (!resultado || !bloqueAgenda) return;
    const t = toast.loading("Generando PDF...");
    try {
        await generarPDFCertificado(resultado, bloqueAgenda);
        toast.dismiss(t);
        toast.success("Descarga iniciada");
    } catch (e) {
        toast.error("Error al generar PDF");
    }
  };

  return (
    <div className="relative max-w-2xl w-full mx-auto z-10">

        {/* TARJETA DE BÚSQUEDA */}
        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10">
            
            <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Validación de Certificados</h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">Sistema oficial de verificación en tiempo real.</p>
            </div>

            <div className="space-y-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaIdCard className="text-slate-400 group-focus-within:text-blue-600 transition-colors"/>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Cédula de ciudadanía o Código..."
                        className="
                            w-full pl-11 pr-4 py-4 rounded-xl
                            bg-slate-50 border border-slate-200
                            text-slate-800 font-bold placeholder:text-slate-400 text-sm
                            focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800
                            transition-all duration-200
                        "
                    />
                </div>

                <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="
                        w-full py-4 rounded-xl
                        bg-slate-900 text-white font-bold text-sm uppercase tracking-widest
                        hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-800/20 hover:-translate-y-0.5
                        active:scale-[0.98] active:translate-y-0
                        disabled:opacity-70 disabled:cursor-not-allowed
                        transition-all duration-200
                        flex items-center justify-center gap-2
                    "
                >
                    {loading ? <FaSpinner className="animate-spin"/> : <FaSearch/>}
                    {loading ? "Verificando..." : "Consultar Base de Datos"}
                </button>
            </div>
        </div>

        {/* RESULTADO: ÉXITO */}
        {resultado && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-emerald-100 rounded-[24px] p-0 shadow-xl shadow-emerald-100/50 overflow-hidden">
                    
                    {/* Header Resultado */}
                    <div className="bg-emerald-50/50 p-6 flex items-center gap-4 border-b border-emerald-50">
                        <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                            <FaCheckCircle size={24}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Certificado Auténtico</p>
                            <h2 className="text-xl font-black text-slate-800 leading-none">{resultado.nombre}</h2>
                        </div>
                    </div>

                    {/* Cuerpo Resultado */}
                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Certificación en:</p>
                            <p className="text-lg font-bold text-slate-700 leading-tight">
                                {resultado.curso}
                            </p>
                        </div>

                        {/* FECHA EMISIÓN */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Fecha de Emisión</span>
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <FaCalendarCheck className="text-emerald-500"/>
                                {resultado.certificado_fecha_emision}
                            </span>
                        </div>

                        {/* CÓDIGO DE VERIFICACIÓN */}
                        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Código Verificación</span>
                            <span className="font-mono text-xs font-bold text-slate-800">{resultado.certificado_codigo}</span>
                        </div>

                        <button 
                            onClick={descargarCopia}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-blue-900 transition-colors"
                        >
                            <FaDownload/> Descargar PDF Original
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* RESULTADO: ERROR */}
        {error && (
             <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="bg-white border-l-4 border-red-500 rounded-xl p-6 shadow-lg shadow-red-100/50 flex items-start gap-4">
                    <FaTimesCircle className="text-red-500 text-xl mt-0.5"/>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase">Certificado No Encontrado</h3>
                        <p className="text-xs text-slate-500 mt-1">{error}</p>
                    </div>
                 </div>
             </div>
        )}

        <div className="mt-12 text-center">
            <p className="text-xs text-slate-400 font-medium">
                © {new Date().getFullYear()} Alturas y Riesgos de la Costa S.A.S
            </p>
        </div>
    </div>
  );
}

// 3. EXPORTAMOS LA PÁGINA PRINCIPAL QUE ENVUELVE TODO EN SUSPENSE
export default function CertificadosPage() {
  return (
    <section className="relative min-h-screen bg-[#F8FAFC] px-6 py-20 flex flex-col items-center justify-center">
      <Toaster position="bottom-center"/>
      
      {/* Fondo sutil */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      {/* AQUÍ ESTÁ LA SOLUCIÓN: Suspense Boundary */}
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
           <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4"/>
           <p className="text-slate-500 font-bold">Cargando sistema de verificación...</p>
        </div>
      }>
        <SearchContent />
      </Suspense>

    </section>
  );
}