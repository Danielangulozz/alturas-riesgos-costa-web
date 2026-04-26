import React from 'react';
import { FaTimes, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCertificate, FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';

interface ModalDetalleEstudianteProps {
  isOpen: boolean;
  onClose: () => void;
  grupoEstudiante: any[]; // Todos los cursos de este estudiante
}

export function ModalDetalleEstudiante({ isOpen, onClose, grupoEstudiante }: ModalDetalleEstudianteProps) {
  if (!isOpen || !grupoEstudiante || grupoEstudiante.length === 0) return null;

  const estudiante = grupoEstudiante[0]; // Datos personales son los mismos en todos

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-6 flex items-start justify-between border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm border border-blue-200/50 dark:border-blue-700/30">
              {estudiante.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight">
                {estudiante.nombre}
              </h2>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><FaIdCard className="text-slate-400" /> {estudiante.cedula}</span>
                {estudiante.telefono && <span className="flex items-center gap-1.5"><FaPhone className="text-slate-400" /> {estudiante.telefono}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all shadow-sm border border-slate-200 dark:border-slate-700">
            <FaTimes size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* INFO EXTRA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FaEnvelope /> Correo Electrónico</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{estudiante.email || "No registrado"}</p>
            </div>
            <div className="bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FaMapMarkerAlt /> Ubicación</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{estudiante.ciudad_residencia || "No registrada"} {estudiante.barrio ? `- ${estudiante.barrio}` : ""}</p>
            </div>
          </div>

          {/* CURSOS */}
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <FaGraduationCap className="text-blue-500" size={18} /> Historial de Cursos <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">{grupoEstudiante.length}</span>
            </h3>
            
            <div className="space-y-4">
              {grupoEstudiante.map(curso => (
                <div key={curso.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors bg-slate-50/50 dark:bg-slate-800/20 relative overflow-hidden group">
                  
                  {/* Decorator line */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${curso.certificado_generado ? 'bg-emerald-500' : curso.resultado_final === 'RETIRADO' ? 'bg-red-500' : 'bg-blue-500'}`} />

                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-4 pl-3">
                    <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm leading-tight pr-4">{curso.curso}</h4>
                    <div className="flex-shrink-0">
                      {curso.certificado_generado ? (
                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 tracking-widest border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
                          <FaCertificate size={12} /> CERTIFICADO
                        </span>
                      ) : curso.resultado_final === "RETIRADO" ? (
                        <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 tracking-widest border border-red-200 dark:border-red-500/30 shadow-sm">
                          RETIRADO
                        </span>
                      ) : curso.agenda_id ? (
                        <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 tracking-widest border border-blue-200 dark:border-blue-500/30 shadow-sm">
                          <FaCalendarAlt size={10} /> EN CURSO
                        </span>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 tracking-widest border border-slate-200 dark:border-slate-600 shadow-sm">
                          PENDIENTE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 text-xs text-slate-500 dark:text-slate-400 gap-3 pl-3 bg-white dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="flex items-center gap-2"><FaCalendarAlt size={12} className="text-slate-400"/> <strong>Registrado:</strong> {curso.created_at ? new Date(curso.created_at).toLocaleDateString() : 'N/A'}</p>
                    <p className="flex items-center gap-2"><strong>Aptitud:</strong> {curso.resultado_final || 'Pendiente'}</p>
                    <p className="flex items-center gap-2"><strong>Pago:</strong> {curso.estado_pago || 'Pendiente'}</p>
                    {curso.certificado_generado && (
                      <>
                        <p className="flex items-center gap-2"><FaCertificate size={12} className="text-emerald-500"/> <strong>Emitido:</strong> {curso.certificado_fecha_emision}</p>
                        <p className="flex items-center gap-2"><FaCertificate size={12} className="text-amber-500"/> <strong>Vence:</strong> {curso.certificado_fecha_vencimiento}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
