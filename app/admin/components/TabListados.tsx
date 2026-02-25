import React from "react";
import { 
  FaUser, FaTimes, FaCheckCircle, FaTrashAlt, 
  FaFilePdf, FaExclamationTriangle, FaExternalLinkAlt 
} from "react-icons/fa";
import { registrarCertificacion, generarPDFCertificado, revocarCertificacion } from "@/lib/certificadoLogic";
import toast from "react-hot-toast";

interface TabListadosProps {
  estudianteSeleccionado: any;
  setEstudianteSeleccionado: React.Dispatch<React.SetStateAction<any>>;
  fechaSeleccionada: string;
  setFechaSeleccionada: React.Dispatch<React.SetStateAction<string>>;
  agendaBD: any[];
  estudiantes: any[];
  preinscripciones: any[];
  descargarPDFAsistencia: (bloque: any, inscritos: any[]) => void;
  fetchData: () => void;
}

export function TabListados({
  estudianteSeleccionado, setEstudianteSeleccionado, fechaSeleccionada, setFechaSeleccionada,
  agendaBD, estudiantes, preinscripciones, descargarPDFAsistencia, fetchData
}: TabListadosProps) {
  
  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* --- MODAL RÁPIDO DE DETALLES DEL ESTUDIANTE --- */}
      {estudianteSeleccionado && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                <FaUser size={24}/>
              </div>
              <button onClick={() => setEstudianteSeleccionado(null)} className="text-slate-400 hover:text-red-500">
                <FaTimes size={20}/>
              </button>
            </div>

            <h4 className="font-black text-slate-800 text-xl leading-tight mb-1 uppercase">{estudianteSeleccionado.nombre}</h4>
            <p className="text-blue-600 font-bold text-xs mb-4">{estudianteSeleccionado.curso}</p>
            
            {/* Datos Informativos */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Cédula:</span>
                <span className="text-slate-700 font-mono font-bold">{estudianteSeleccionado.cedula}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Pago:</span>
                <span className={`font-bold ${estudianteSeleccionado.estado_pago === 'Pendiente' ? 'text-red-500' : 'text-emerald-600'}`}>
                  {estudianteSeleccionado.estado_pago || 'Pendiente'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Estado Aptitud:</span>
                <span className={`font-black ${estudianteSeleccionado.resultado_final === 'APTO' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {estudianteSeleccionado.resultado_final || 'Pendiente'}
                </span>
              </div>
            </div>
            
            {/* --- ZONA DE ACCIONES DE CERTIFICACIÓN --- */}
            <div className="grid gap-3">
              {estudianteSeleccionado.certificado_generado ? (
                <>
                  <button 
                    onClick={() => {
                       const bloque = agendaBD.find(a => a.id === estudianteSeleccionado.agenda_id);
                       if(bloque) generarPDFCertificado(estudianteSeleccionado, bloque);
                       else toast.error("No se encontraron datos de la agenda");
                    }}
                    className="w-full py-3 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-black text-center flex items-center justify-center gap-2 hover:bg-emerald-200 transition-all uppercase text-xs tracking-widest"
                  >
                    <FaCheckCircle/> Descargar Certificado
                  </button>

                  <button 
                     onClick={async () => {
                        if(!confirm("⚠️ ¿Estás seguro de ANULAR este certificado?\n\nEl código QR dejará de funcionar inmediatamente.")) return;
                        const tId = toast.loading("Revocando certificado...");
                        try {
                            const estRevocado = await revocarCertificacion(estudianteSeleccionado.id);
                            setEstudianteSeleccionado(estRevocado);
                            fetchData(); 
                            toast.success("Certificado anulado correctamente", { id: tId });
                        } catch (err: any) {
                            toast.error(err.message, { id: tId });
                        }
                     }}
                     className="w-full py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-red-100 transition-all uppercase text-[10px] tracking-widest"
                  >
                     <FaTrashAlt/> Anular Certificado
                  </button>
                </>
              ) : (
                <button 
                  onClick={async () => {
                     if(confirm(`¿Confirmas la certificación de ${estudianteSeleccionado.nombre}?`)) {
                        const tId = toast.loading("Validando requisitos...");
                        try {
                          const bloque = agendaBD.find(a => a.id === estudianteSeleccionado.agenda_id);
                          if(!bloque) throw new Error("Agenda no encontrada");

                          const estActualizado = await registrarCertificacion(estudianteSeleccionado, bloque);
                          setEstudianteSeleccionado(estActualizado);
                          fetchData(); 
                          toast.success("¡Certificado Generado!", { id: tId });

                          if(confirm("Certificación exitosa. ¿Descargar PDF ahora?")) {
                             await generarPDFCertificado(estActualizado, bloque);
                          }
                        } catch (err: any) {
                          toast.error(err.message, { id: tId, duration: 4000 });
                        }
                     }
                  }}
                  disabled={estudianteSeleccionado.resultado_final !== 'APTO'} 
                  className={`w-full py-3 rounded-xl font-black text-center flex items-center justify-center gap-2 transition-all uppercase text-xs tracking-widest shadow-md ${
                    estudianteSeleccionado.resultado_final === 'APTO' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]' 
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <FaFilePdf/> Generar Certificación
                </button>
              )}

              <a 
                href={`https://wa.me/57${estudianteSeleccionado.telefono}`} 
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-xl font-bold text-center block hover:border-emerald-400 hover:text-emerald-500 transition-all uppercase text-xs tracking-widest"
              >
                Contactar WhatsApp
              </a>
            </div>

          </div>
        </div>
      )}

      {/* HEADER DE FECHA */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800">Planillas de Asistencia</h3>
          <p className="text-xs text-slate-400">Instructor: Selecciona la fecha de hoy para ver tu grupo.</p>
        </div>
        <input 
          type="date" 
          className="p-3 border-2 border-slate-100 rounded-2xl bg-slate-50 font-black text-sm outline-none focus:border-blue-500 transition-all" 
          value={fechaSeleccionada} 
          onChange={(e) => setFechaSeleccionada(e.target.value)} 
        />
      </div>

      {/* TARJETAS DE CLASES */}
      <div className="grid md:grid-cols-2 gap-6">
        {agendaBD.filter(a => a.fecha === fechaSeleccionada).map(bloque => {
          const inscritos = [
            ...estudiantes.filter(e => e.agenda_id === bloque.id),
            ...preinscripciones.filter(p => p.agenda_id === bloque.id)
          ];

          return (
            <div key={bloque.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="bg-[#1e293b] p-5 text-white flex justify-between items-center">
                <div>
                  <span className="font-black block uppercase text-[10px] text-blue-400 tracking-tighter">
                    {bloque.intensidad_horaria} | {bloque.hora}
                  </span>
                  <span className="font-bold text-base leading-none">{bloque.curso}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-blue-600 px-3 py-1 rounded-full font-black uppercase">
                    {inscritos.length} Alumnos
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1">
                {inscritos.length > 0 ? (
                  <div className="space-y-2">
                    {inscritos.map((e, idx) => (
                      <div 
                        key={e.id} 
                        onClick={() => setEstudianteSeleccionado(e)} 
                        className={`flex justify-between items-center p-3 rounded-2xl cursor-pointer transition-all border group ${
                          e.certificado_generado 
                            ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-white border-transparent hover:bg-blue-50 hover:border-blue-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-400">{idx + 1}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-700 uppercase">{e.nombre}</p>
                            {e.certificado_generado && (
                              <span className="text-[8px] font-black text-emerald-600 flex items-center gap-1">
                                <FaCheckCircle size={8}/> CERTIFICADO
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {e.resultado_final !== 'APTO' && (
                             <FaExclamationTriangle className="text-amber-400" size={12} title="No Apto / Pendiente"/>
                           )}
                           <FaExternalLinkAlt className="text-slate-200 group-hover:text-blue-400" size={10}/>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                      <p className="text-xs text-slate-300 italic">No hay estudiantes cargados para este bloque.</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 border-t flex justify-center">
                 <button 
                  onClick={() => descargarPDFAsistencia(bloque, inscritos)}
                  className="w-full py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                 >
                   <FaFilePdf size={14}/> Generar Planilla Oficial PDF
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}