"use client";

import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { 
  FaCloudUploadAlt, FaCheckCircle, FaSearch, FaSpinner, 
  FaFilePdf, FaShieldAlt, FaInfoCircle, FaLock 
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// Mapeo de columnas
const MAPA_DOCUMENTOS: any = {
  cc: { label: "Cédula de Ciudadanía (Ambas caras)", col: "url_cc", desc: "PDF o Imagen legible" },
  arl: { label: "Certificado ARL Vigente", col: "url_arl", desc: "No mayor a 30 días" },
  emo: { label: "Examen Médico (Apto Alturas)", col: "url_emo", desc: "Concepto médico vigente" },
  eps: { label: "Certificado Afiliación EPS", col: "url_eps", desc: "Estado: Activo" },
  cert_altura: { label: "Certificado Alturas Anterior", col: "url_cert_altura", desc: "Para reentrenamientos" },
  cert_sst: { label: "Certificado 20h SST", col: "url_cert_sst", desc: "Para coordinadores" },
};

function ContenidoSubida() {
  const searchParams = useSearchParams();
  
  // Estados
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [datosUsuario, setDatosUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // Auto-búsqueda si hay ID en la URL
  useEffect(() => {
    const idUrl = searchParams.get("id");
    if (idUrl) buscarPorId(idUrl);
  }, [searchParams]);

  const buscarPorId = async (id: string) => {
    setLoading(true);
    const { data } = await supabase.from("preinscripciones").select("*").eq("id", id).single();
    if (data) setDatosUsuario(data);
    else toast.error("Solicitud no encontrada");
    setLoading(false);
  };

  const buscarPorCedula = async (e?: React.FormEvent) => {
  if(e) e.preventDefault();
  if (!cedulaBusqueda) return toast.error("Escribe tu cédula");
  
  setLoading(true);
  const { data, error } = await supabase.from("preinscripciones")
    .select("*")
    .eq("cedula", cedulaBusqueda)
    .single();

  if (error || !data) {
    toast.error("No encontramos tu registro. ¿Ya te inscribiste?");
    setDatosUsuario(null);
  } else {
    setDatosUsuario(data);
    toast.success(`¡Hola, ${data.nombre}!`);
  }
  setLoading(false);
};

  const obtenerDocumentosRequeridos = (nombreCurso: string) => {
    let requeridos = ["cc", "arl", "emo", "eps"];
    const curso = nombreCurso?.toLowerCase() || "";
    if (curso.includes("reentrenamiento")) requeridos.push("cert_altura");
    else if (curso.includes("coordinador") || curso.includes("jefe")) {
      requeridos.push("cert_altura");
      requeridos.push("cert_sst");
    }
    return requeridos;
  };

  const manejarSubida = async (e: React.ChangeEvent<HTMLInputElement>, codigoDoc: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const colBD = MAPA_DOCUMENTOS[codigoDoc].col;

    // Validación básica de tamaño (ej: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("El archivo es muy pesado. Máximo 5MB.");
    }

    setUploading(codigoDoc);
    const tId = toast.loading("Subiendo documento...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${datosUsuario.cedula}/${codigoDoc}_${Date.now()}.${fileExt}`;

      // 1. Subir al Storage
      const { error: uploadError } = await supabase.storage
        .from('docs_students')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL
      const { data: urlData } = supabase.storage
        .from('docs_students')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;

      // 3. Guardar en Base de Datos
      const { error: dbError } = await supabase
        .from('preinscripciones')
        .update({ [colBD]: publicUrl })
        .eq('id', datosUsuario.id);

      if (dbError) throw dbError;

      // 4. Actualizar estado visual
      setDatosUsuario({ ...datosUsuario, [colBD]: publicUrl });
      toast.success("¡Guardado exitosamente!", { id: tId });

    } catch (error: any) {
      console.error(error);
      toast.error("Error al subir. Intenta de nuevo.", { id: tId });
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-2 py-2 md:py-12 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* CARD PRINCIPAL */}
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <div className="bg-[#0F172A] p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase mb-2">
              Gestión de Documentos
            </h1>
            <p className="text-blue-200 text-xs md:text-sm font-medium tracking-wide uppercase">
              Plataforma segura de cargue de archivos
            </p>
          </div>
        </div>

        <div className="p-200 md:p-0">
          
          {/* ESTADO 1: BUSCADOR */}
          {!datosUsuario ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-2">
                <FaSearch size={30} />
              </div>
              
              <div className="text-center space-y-2 max-w-md">
                <h3 className="text-xl font-bold text-slate-800">Bienvenido al Portal</h3>
                <p className="text-slate-500 text-sm">
                  Para iniciar, ingresa tu número de documento de identidad para cargar los requisitos específicos de tu curso.
                </p>
              </div>
              
              <form onSubmit={buscarPorCedula} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
                <input 
                  type="number" 
                  placeholder="Ej: 100200300" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-bold text-slate-700 placeholder:font-normal" 
                  value={cedulaBusqueda} 
                  onChange={(e) => setCedulaBusqueda(e.target.value)} 
                />
                <button 
                  type="submit"
                  disabled={loading} 
                  className="bg-[#1E3A8A] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-900 transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : "Buscar"}
                </button>
              </form>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-4 bg-slate-50 px-4 rounded-full">
                <FaLock /> Tus datos viajan encriptados y seguros.
              </div>
            </div>
          ) : (
            
            /* ESTADO 2: PANEL DE CARGA */
            <div className="animate-in fade-in zoom-in duration-500">
              
              {/* Info del Usuario */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded">Postulante</span>
                  <h2 className="text-2xl font-black text-slate-800 mt-2">{datosUsuario.nombre}</h2>
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Curso: {datosUsuario.curso}
                  </p>
                </div>
                <button 
                  onClick={() => setDatosUsuario(null)} 
                  className="text-xs font-bold text-slate-400 hover:text-red-500 underline transition-colors"
                >
                  Cerrar Sesión / Buscar otro
                </button>
              </div>

              {/* Grid de Documentos */}
              <div className="grid md:grid-cols-2 gap-5">
                {obtenerDocumentosRequeridos(datosUsuario.curso).map((codigoDoc) => {
                  const infoDoc = MAPA_DOCUMENTOS[codigoDoc];
                  const urlArchivo = datosUsuario[infoDoc.col]; // <-- AQUÍ SE VERIFICA SI YA EXISTE
                  const estaListo = !!urlArchivo;

                  return (
                    <div 
                      key={codigoDoc} 
                      className={`
                        relative group border-2 rounded-2xl p-6 transition-all duration-300
                        ${estaListo 
                          ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70' 
                          : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`
                            p-3 rounded-xl flex-shrink-0 transition-colors
                            ${estaListo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}
                          `}>
                            {estaListo ? <FaCheckCircle size={20} /> : <FaFilePdf size={20} />}
                          </div>
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${estaListo ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {estaListo ? 'Completado' : 'Pendiente'}
                            </p>
                            <p className="text-sm font-bold text-slate-700 leading-tight">
                              {infoDoc.label}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {infoDoc.desc}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Botón de Acción */}
                      <label className={`
                        flex items-center justify-center gap-2 w-full py-3.5 rounded-xl cursor-pointer font-bold text-xs transition-all relative overflow-hidden
                        ${uploading === codigoDoc 
                          ? 'bg-slate-100 text-slate-400 cursor-wait' 
                          : estaListo 
                            ? 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50' 
                            : 'bg-[#0F172A] text-white hover:bg-[#1E3A8A] shadow-md hover:shadow-lg transform active:scale-[0.98]'}
                      `}>
                        {uploading === codigoDoc ? (
                          <>
                            <FaSpinner className="animate-spin" /> Subiendo...
                          </>
                        ) : (
                          <>
                            <FaCloudUploadAlt size={16} />
                            {estaListo ? "Actualizar Archivo" : "Seleccionar Archivo"}
                          </>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,image/jpeg,image/png" 
                          onChange={(e) => manejarSubida(e, codigoDoc)} 
                          disabled={!!uploading} 
                        />
                      </label>

                      {/* Enlace si ya existe */}
                      {estaListo && (
                        <div className="mt-3 text-center animate-in fade-in">
                          <a 
                            href={urlArchivo} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-700 hover:underline"
                          >
                            <FaSearch size={10}/> Visualizar documento cargado
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex gap-3 p-4 bg-blue-50 rounded-xl items-start">
                <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  <b>Importante:</b> Una vez hayas cargado todos los documentos en verde, nuestro equipo administrativo recibirá una notificación automática. No es necesario que envíes comprobantes por WhatsApp.
                </p>
              </div>

            </div>
          )}
        </div>

        {/* FOOTER - POLÍTICA DE DATOS */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 text-center">
            <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <FaShieldAlt className="text-slate-400" size={20}/>
                <p className="text-[10px] text-slate-500 max-w-xl mx-auto leading-relaxed">
                    Al utilizar esta plataforma, autorizo de manera voluntaria, previa, explícita, informada e inequívoca a 
                    <b> AR COSTA S.A.S.</b> para tratar mis datos personales de acuerdo con su Política de Tratamiento de Datos Personales 
                    y la Ley 1581 de 2012 (Habeas Data). La información suministrada será utilizada exclusivamente para fines 
                    administrativos y de certificación.
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-2">© {new Date().getFullYear()} AR Costa S.A.S - Todos los derechos reservados.</p>
            </div>
        </div>

      </div>
    </div>
  );
}

// Wrapper para Suspense
export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-3">
        <FaSpinner className="animate-spin text-3xl text-[#0F172A]"/>
        <p className="text-xs font-bold tracking-widest uppercase">Cargando plataforma...</p>
      </div>
    }>
      <ContenidoSubida />
    </Suspense>
  );
}