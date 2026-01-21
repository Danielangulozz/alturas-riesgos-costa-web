"use client";

import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { 
  FaCloudUploadAlt, FaCheckCircle, FaSearch, FaSpinner, 
  FaFilePdf, FaShieldAlt, FaInfoCircle
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

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
  [key: string]: string | undefined;
}

const MAPA_DOCUMENTOS: Record<string, DocumentoInfo> = {
  cc: { label: "Cédula de Ciudadanía", col: "url_cc", desc: "Ambas caras (PDF/Foto)" },
  arl: { label: "Certificado ARL", col: "url_arl", desc: "Vigente (< 30 días)" },
  emo: { label: "Examen Médico", col: "url_emo", desc: "Apto para Alturas" },
  eps: { label: "Certificado EPS", col: "url_eps", desc: "Estado: Activo" },
  cert_altura: { label: "Cert. Alturas Anterior", col: "url_cert_altura", desc: "Solo reentrenamiento" },
  cert_sst: { label: "Certificado 20h SST", col: "url_cert_sst", desc: "Solo coordinadores" },
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const buscarPorId = async (id: string) => {
    setLoading(true);
    const { data } = await supabase.from("preinscripciones").select("*").eq("id", id).maybeSingle();
    if (data) setDatosUsuario(data);
    setLoading(false);
  };

  const buscarPorCedula = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cedulaLimpia = cedulaBusqueda.trim(); // Limpieza básica
    if (!cedulaLimpia) return toast.error("Escribe tu cédula");
    
    setLoading(true);
    try {
      // Usamos .eq con filtro simple para máxima compatibilidad
      const { data, error } = await supabase.from("preinscripciones")
        .select("*")
        .eq("cedula", cedulaLimpia) // Asegúrate que en la BD 'cedula' sea texto o número compatible
        .maybeSingle();

      if (error || !data) {
        toast.error("No encontramos tu registro.");
        setDatosUsuario(null);
      } else {
        setDatosUsuario(data);
        toast.success(`Hola, ${data.nombre}`);
      }
    } catch {
      toast.error("Error de conexión");
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
    // 1. Validaciones básicas
    if (!e.target.files || e.target.files.length === 0 || !datosUsuario) return;
    const file = e.target.files[0];
    const colBD = MAPA_DOCUMENTOS[codigoDoc].col;

    // Validación de peso (6MB)
    if (file.size > 6 * 1024 * 1024) return toast.error("Archivo muy pesado. Máx 6MB.");

    setUploading(codigoDoc);
    const tId = toast.loading("Procesando archivo...", { position: "bottom-center" });

    try {
      // 2. DETECTAR EXTENSIÓN REAL (Vital para que no salga "Archivo dañado")
      let fileExt = 'jpg'; // Por defecto
      if (file.type === 'application/pdf') {
        fileExt = 'pdf';
      } else if (file.type === 'image/png') {
        fileExt = 'png';
      } else if (file.type === 'image/jpeg') {
        fileExt = 'jpg';
      }
      
      // 3. NOMBRE DE ARCHIVO LIMPIO
      // Usamos la cédula y el tiempo para que sea único
      const fileName = `${datosUsuario.cedula}/${codigoDoc}_${Date.now()}.${fileExt}`;

      // 4. PREPARAR EL BUFFER (El truco para móviles)
      // Convertimos el archivo a "datos crudos" para asegurar que viaje completo
      const fileBody = await file.arrayBuffer();

      // 5. SUBIDA BLINDADA
      const { data, error: uploadError } = await supabase.storage
        .from('docs_students')
        .upload(fileName, fileBody, {
          cacheControl: '3600',
          upsert: true, // Upsert true está bien si la política es FOR ALL
          contentType: file.type // IMPORTANTE: Le dice a Supabase si es PDF o Foto
        });

      if (uploadError) {
        console.error("Error Storage:", uploadError);
        throw new Error("Error al subir a la nube.");
      }

      // 6. GENERAR URL PÚBLICA
      const { data: urlData } = supabase.storage
        .from('docs_students')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;

      // 7. GUARDAR EN LA BASE DE DATOS (Con verificación .select)
      const { data: updateData, error: dbError } = await supabase
        .from('preinscripciones')
        .update({ [colBD]: publicUrl })
        .eq('id', datosUsuario.id)
        .select(); // <--- IMPORTANTE: Esto confirma si realmente se escribió

      // Si hay error O si el array devuelto está vacío, falló la escritura
      if (dbError || !updateData || updateData.length === 0) {
         console.error("Error DB:", dbError);
         throw new Error("No se pudo guardar el estado. Revisa conexión.");
      }

      // 8. ÉXITO (Solo si pasamos la verificación de arriba)
      setDatosUsuario(prev => prev ? ({ ...prev, [colBD]: publicUrl }) : null);
      toast.success("¡Documento guardado!", { id: tId });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error desconocido", { id: tId });
    } finally {
      setUploading(null);
      e.target.value = ""; // Limpiar el input
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <Toaster />
      
      <div className="max-w-2xl mt-24 w-full bg-white rounded-[4rem] shadow-xl overflow-hidden border border-slate-200">
        
        {/* HEADER */}
        <div className="bg-[#0F172A] p-8 max-w-3xl md:p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-xl md:text-3xl font-black text-white uppercase mb-1">
              Gestión Documental
            </h1>
            <p className="text-blue-200 text-[10px] md:text-sm font-bold uppercase tracking-widest">
              Plataforma de Carga Segura
            </p>
          </div>
        </div>

        <div className="p-5 md:p-10">
          {!datosUsuario ? (
            /* --- VISTA BUSCADOR (OPTIMIZADA MÓVIL) --- */
            <div className="flex flex-col items-center py-6 space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                <FaSearch size={24} />
              </div>
              
              <div className="text-center space-y-2 px-2">
                <h3 className="text-lg font-bold text-slate-800">Bienvenido</h3>
                <p className="text-slate-500 text-sm leading-tight">
                  Ingresa tu número de documento para comenzar.
                </p>
              </div>

              <form onSubmit={buscarPorCedula} className="w-full max-w-sm flex flex-col gap-3">
                <input 
                  type="text" // Cambiado a text para mejor control
                  inputMode="numeric" // Teclado numérico en móvil
                  pattern="[0-9]*"
                  placeholder="Ej: 1102839100" 
                  // text-base (16px) EVITA EL ZOOM EN IPHONE
                  className="w-full p-4 text-base bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-bold text-slate-700 text-center" 
                  value={cedulaBusqueda} 
                  onChange={(e) => setCedulaBusqueda(e.target.value.replace(/\D/g,''))} // Solo números
                />
                <button 
                  type="submit"
                  disabled={loading} 
                  className="w-full bg-[#1E3A8A] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 active:scale-95 transition-all shadow-lg shadow-blue-900/20"
                >
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : "BUSCAR REGISTRO"}
                </button>
              </form>
            </div>
          ) : (
            /* --- VISTA CARGA (OPTIMIZADA MÓVIL) --- */
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              
              {/* Tarjeta Usuario */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 text-center md:text-left">
                 <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-100 px-2 py-1 rounded">Postulante</span>
                 <h2 className="text-lg md:text-2xl font-black text-slate-800 mt-2 leading-tight uppercase">{datosUsuario.nombre}</h2>
                 <p className="text-xs text-slate-500 mt-1">{datosUsuario.curso}</p>
                 <button onClick={() => setDatosUsuario(null)} className="mt-3 text-[10px] font-bold text-red-400 border-b border-red-200">
                    Salir / Cambiar Cédula
                 </button>
              </div>

              {/* Grid Documentos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {obtenerDocumentosRequeridos(datosUsuario.curso).map((codigoDoc) => {
                  const infoDoc = MAPA_DOCUMENTOS[codigoDoc];
                  const urlArchivo = datosUsuario[infoDoc.col];
                  const estaListo = !!urlArchivo;

                  return (
                    <div 
                      key={codigoDoc} 
                      className={`relative border-2 rounded-2xl p-5 transition-all ${estaListo ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-white'}`}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2.5 rounded-xl ${estaListo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {estaListo ? <FaCheckCircle /> : <FaFilePdf />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{infoDoc.label}</p>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{infoDoc.desc}</p>
                        </div>
                      </div>

                      <label className={`
                        flex items-center justify-center gap-2 w-full py-3 rounded-xl cursor-pointer font-bold text-[10px] md:text-xs uppercase tracking-wide transition-all shadow-sm
                        ${uploading === codigoDoc ? 'bg-slate-100 text-slate-400' : estaListo ? 'bg-white text-emerald-600 border border-emerald-200' : 'bg-[#0F172A] text-white active:scale-95'}
                      `}>
                        {uploading === codigoDoc ? <><FaSpinner className="animate-spin" /> Subiendo...</> : <><FaCloudUploadAlt size={14} /> {estaListo ? "Cambiar Archivo" : "Subir Archivo"}</>}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*,application/pdf" // Acepta fotos y PDF
                          onChange={(e) => manejarSubida(e, codigoDoc)} 
                          disabled={!!uploading} 
                        />
                      </label>
                      
                      {estaListo && (
                        <a href={urlArchivo} target="_blank" rel="noopener noreferrer" className="block mt-2 text-center text-[10px] font-bold text-blue-500 hover:underline">
                          Ver documento actual
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl flex gap-3">
                <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  Cuando todos los íconos estén en verde, tu registro estará completo automáticamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <FaShieldAlt className="text-slate-300 mx-auto mb-2" size={16}/>
          <p className="text-[9px] text-slate-400 max-w-xs mx-auto">
            © 2026 AR Costa S.A.S. Tus datos están protegidos.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><FaSpinner className="animate-spin"/></div>}>
      <ContenidoSubida />
    </Suspense>
  );
}