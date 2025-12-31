"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaCloudUploadAlt, FaCheckCircle, FaSearch, FaSpinner } from "react-icons/fa";

export default function PortalEstudiante() {
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [estudiante, setEstudiante] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [subiendoDoc, setSubiendoDoc] = useState<string | null>(null);

  const buscarEstudiante = async () => {
    if (!cedulaBusqueda) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("estudiantes")
      .select("*")
      .eq("cedula", cedulaBusqueda)
      .single();

    if (error || !data) {
      alert("Cédula no encontrada. Por favor, regístrate primero con el administrador.");
      setEstudiante(null);
    } else {
      setEstudiante(data);
    }
    setLoading(false);
  };

  // Definimos qué columna de la DB corresponde a cada documento
  const documentosPorCurso: any = {
    "Cedula": { label: "Cédula de Ciudadanía", dbCol: "url_cedula" },
    "Medico": { label: "Examen Médico (Apto)", dbCol: "url_medico" },
    "Seguridad": { label: "Seguridad Social (EPS/ARL)", dbCol: "url_seguridad_social" },
    "Otros": { label: "Otros Soportes", dbCol: "url_otros" }
  };

  // Lógica: qué documentos pedir según el curso
  const obtenerRequeridos = (curso: string) => {
    const docs = ["Cedula", "Seguridad"];
    if (curso.toLowerCase().includes("avanzado") || curso.toLowerCase().includes("reentrenamiento") || curso.toLowerCase().includes("coordinador")) {
      docs.push("Medico");
    }
    return docs;
  };

  const manejarSubida = async (e: React.ChangeEvent<HTMLInputElement>, tipoDoc: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const dbColumn = documentosPorCurso[tipoDoc].dbCol;
    
    setSubiendoDoc(tipoDoc);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${estudiante.cedula}_${tipoDoc}_${Date.now()}.${fileExt}`;

      // 1. Subir al Bucket 'documentos'
      const { error: uploadError } = await supabase.storage
        .from('docs_students')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL
      const { data: { publicUrl } } = supabase.storage.from('docs_students').getPublicUrl(fileName);

      // 3. Actualizar la columna específica en la tabla
      const { error: updateError } = await supabase
        .from('estudiantes')
        .update({ [dbColumn]: publicUrl })
        .eq('id', estudiante.id);

      if (updateError) throw updateError;

      // 4. Actualizar estado local para mostrar el check verde
      setEstudiante({ ...estudiante, [dbColumn]: publicUrl });
      alert("Archivo cargado con éxito.");
      
    } catch (error: any) {
      alert("Error al subir: " + error.message);
    } finally {
      setSubiendoDoc(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-4 md:pt-20 text-[#1e293b]">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-[#1e293b] p-8 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">Carga de Documentos</h1>
          <p className="text-blue-400 text-xs font-bold uppercase mt-2">AR Costa Entrenamiento</p>
        </div>

        <div className="p-8">
          {!estudiante ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-slate-500 mb-6">Ingresa tu número de identificación para gestionar tus documentos.</p>
              <input
                type="text"
                placeholder="Número de Cédula"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all text-center text-lg font-bold"
                value={cedulaBusqueda}
                onChange={(e) => setCedulaBusqueda(e.target.value)}
              />
              <button 
                onClick={buscarEstudiante}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <><FaSearch /> Verificar Estado</>}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Estudiante Registrado</p>
                <h2 className="text-xl font-bold text-slate-800">{estudiante.nombre}</h2>
                <p className="text-sm text-slate-500 font-medium">{estudiante.curso}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tus Archivos (PDF o Imagen)</p>
                
                {obtenerRequeridos(estudiante.curso).map((key) => {
                  const doc = documentosPorCurso[key];
                  const estaCargado = !!estudiante[doc.dbCol];

                  return (
                    <div key={key} className={`relative p-4 rounded-2xl border-2 transition-all ${estaCargado ? 'border-green-100 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-xs font-bold ${estaCargado ? 'text-green-700' : 'text-slate-600'}`}>
                          {doc.label}
                        </span>
                        {estaCargado && <FaCheckCircle className="text-green-500 shadow-sm" />}
                      </div>

                      <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl cursor-pointer font-bold text-[11px] transition-all ${
                        subiendoDoc === key ? 'bg-slate-200 text-slate-400' : 
                        estaCargado ? 'bg-white text-green-600 border border-green-200 hover:bg-green-100' : 'bg-[#1e293b] text-white hover:bg-slate-800'
                      }`}>
                        {subiendoDoc === key ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt size={16} />}
                        {estaCargado ? "Reemplazar Archivo" : "Subir Documento"}
                        <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => manejarSubida(e, key)} disabled={!!subiendoDoc} />
                      </label>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => setEstudiante(null)} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors italic">
                ← Consultar otra cédula
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}