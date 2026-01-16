"use client";

import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { 
  FaCloudUploadAlt, FaCheckCircle, FaSearch, FaSpinner, 
  FaFilePdf, FaShieldAlt, FaInfoCircle
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// Definimos interfaces para que TypeScript no moleste
interface DocumentoInfo {
  label: string;
  col: string;
  desc: string;
}

interface UsuarioData {
  id: string;
  nombre: string;
  cedula: string;
  curso: string;
  [key: string]: string | undefined; // Permite acceder a las columnas de URLs
}

const MAPA_DOCUMENTOS: Record<string, DocumentoInfo> = {
  cc: { label: "Cédula de Ciudadanía (Ambas caras)", col: "url_cc", desc: "PDF o Imagen legible" },
  arl: { label: "Certificado ARL Vigente", col: "url_arl", desc: "No mayor a 30 días" },
  emo: { label: "Examen Médico (Apto Alturas)", col: "url_emo", desc: "Concepto médico vigente" },
  eps: { label: "Certificado Afiliación EPS", col: "url_eps", desc: "Estado: Activo" },
  cert_altura: { label: "Certificado Alturas Anterior", col: "url_cert_altura", desc: "Para reentrenamientos" },
  cert_sst: { label: "Certificado 20h SST", col: "url_cert_sst", desc: "Para coordinadores" },
};

function ContenidoSubida() {
  const searchParams = useSearchParams();
  
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [datosUsuario, setDatosUsuario] = useState<UsuarioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

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
    if (e) e.preventDefault();
    const cedulaLimpia = cedulaBusqueda.trim();
    if (!cedulaLimpia) return toast.error("Escribe tu cédula");
    
    setLoading(true);
    try {
      const { data, error } = await supabase.from("preinscripciones")
        .select("*")
        .eq("cedula", cedulaLimpia)
        .maybeSingle();

      if (error || !data) {
        toast.error("No encontramos tu registro. Verifica el número.");
        setDatosUsuario(null);
      } else {
        setDatosUsuario(data);
        toast.success(`¡Hola, ${data.nombre}!`);
      }
    } catch {
      toast.error("Error al buscar");
    } finally {
      setLoading(false);
    }
  };

  const obtenerDocumentosRequeridos = (nombreCurso: string) => {
    const requeridos = ["cc", "arl", "emo", "eps"];
    const curso = nombreCurso?.toLowerCase() || "";
    if (curso.includes("reentrenamiento")) requeridos.push("cert_altura");
    else if (curso.includes("coordinador") || curso.includes("jefe")) {
      requeridos.push("cert_altura");
      requeridos.push("cert_sst");
    }
    return requeridos;
  };

  const manejarSubida = async (e: React.ChangeEvent<HTMLInputElement>, codigoDoc: string) => {
    if (!e.target.files || e.target.files.length === 0 || !datosUsuario) return;
    const file = e.target.files[0];
    const colBD = MAPA_DOCUMENTOS[codigoDoc].col;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("El archivo es muy pesado. Máximo 5MB.");
    }

    setUploading(codigoDoc);
    const tId = toast.loading("Subiendo documento...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${datosUsuario.cedula}/${codigoDoc}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('docs_students')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('docs_students')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from('preinscripciones')
        .update({ [colBD]: publicUrl })
        .eq('id', datosUsuario.id);

      if (dbError) throw dbError;

      setDatosUsuario({ ...datosUsuario, [colBD]: publicUrl });
      toast.success("¡Guardado exitosamente!", { id: tId });

    } catch (error: unknown) {
      console.error(error);
      toast.error("Error al subir. Intenta de nuevo.", { id: tId });
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-8 md:py-12 font-sans">
      <Toaster position="top-center" />
      
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
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

        <div className="p-6 md:p-12">
          {!datosUsuario ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-8">
              <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-2">
                <FaSearch size={30} />
              </div>
              <div className="text-center space-y-2 max-w-md">
                <h3 className="text-xl font-bold text-slate-800">Bienvenido al Portal</h3>
                <p className="text-slate-500 text-sm px-4">
                  Ingresa tu número de documento para cargar los requisitos de tu curso.
                </p>
              </div>
              <form onSubmit={buscarPorCedula} className="w-full max-w-md flex flex-col gap-3 px-2">
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="Ej: 100200300" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-bold text-slate-700 text-center md:text-left" 
                  value={cedulaBusqueda} 
                  onChange={(e) => setCedulaBusqueda(e.target.value)} 
                />
                <button 
                  type="submit"
                  disabled={loading} 
                  className="w-full bg-[#1E3A8A] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : "Iniciar Gestión"}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-8 flex flex-col items-center md:flex-row md:justify-between text-center md:text-left gap-4">
                <div>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-100 px-2 py-1 rounded-md">Postulante Activo</span>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 mt-2 uppercase">{datosUsuario.nombre}</h2>
                  <p className="text-xs font-bold text-slate-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Curso: {datosUsuario.curso}
                  </p>
                </div>
                <button onClick={() => setDatosUsuario(null)} className="text-[10px] font-black text-red-400 uppercase tracking-widest border-b border-red-200 pb-1">
                  Cambiar Documento
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {obtenerDocumentosRequeridos(datosUsuario.curso).map((codigoDoc) => {
                  const infoDoc = MAPA_DOCUMENTOS[codigoDoc];
                  const urlArchivo = datosUsuario[infoDoc.col];
                  const estaListo = !!urlArchivo;

                  return (
                    <div 
                      key={codigoDoc} 
                      className={`relative group border-2 rounded-2xl p-6 transition-all duration-300 ${estaListo ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100 bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl flex-shrink-0 ${estaListo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {estaListo ? <FaCheckCircle size={20} /> : <FaFilePdf size={20} />}
                          </div>
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${estaListo ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {estaListo ? 'Completado' : 'Pendiente'}
                            </p>
                            <p className="text-sm font-bold text-slate-700 leading-tight">{infoDoc.label}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{infoDoc.desc}</p>
                          </div>
                        </div>
                      </div>

                      <label className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl cursor-pointer font-bold text-xs transition-all ${uploading === codigoDoc ? 'bg-slate-100 text-slate-400' : estaListo ? 'bg-white text-emerald-600 border border-emerald-200' : 'bg-[#0F172A] text-white'}`}>
                        {uploading === codigoDoc ? <><FaSpinner className="animate-spin" /> Subiendo...</> : <><FaCloudUploadAlt size={16} /> {estaListo ? "Actualizar Archivo" : "Seleccionar Archivo"}</>}
                        <input type="file" className="hidden" accept=".pdf,image/jpeg,image/png" onChange={(e) => manejarSubida(e, codigoDoc)} disabled={!!uploading} />
                      </label>
                      {estaListo && (
                        <div className="mt-3 text-center">
                          <a href={urlArchivo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:underline">
                            <FaSearch size={10}/> Visualizar documento
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
                  <b>Importante:</b> Una vez cargados los documentos, nuestro equipo revisará la información.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-100 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <FaShieldAlt className="text-slate-400" size={20}/>
            <p className="text-[10px] text-slate-500 max-w-xl mx-auto leading-relaxed">
              Tratamiento de datos personales de acuerdo con la Ley 1581 de 2012.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-3xl"/></div>}>
      <ContenidoSubida />
    </Suspense>
  );
}