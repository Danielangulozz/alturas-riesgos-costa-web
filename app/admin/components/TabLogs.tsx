import React, { useState } from "react";
import { FaHistory, FaSearch, FaUserShield, FaRegCalendarCheck, FaUserEdit, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface TabLogsProps {
  userRole: string;
  logsRecientes: any[];
  hasMoreLogs: boolean;
  fetchMasLogs: () => Promise<void>;
}

export function TabLogs({ userRole, logsRecientes, hasMoreLogs, fetchMasLogs }: TabLogsProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await fetchMasLogs();
    setIsLoadingMore(false);
  };
  const [searchTerm, setSearchTerm] = useState("");

  if (userRole !== 'admin_general' && userRole !== 'developer' && userRole !== 'director') return null;

  const filteredLogs = logsRecientes.filter(log => {
    const term = searchTerm.toLowerCase();
    return log.accion.toLowerCase().includes(term) ||
      log.nombre_usuario.toLowerCase().includes(term) ||
      log.detalles.toLowerCase().includes(term);
  });

  const getActionIconAndColor = (accion: string) => {
    const acc = accion.toLowerCase();
    if (acc.includes('aprobó') || acc.includes('rechazó') || acc.includes('editó')) return { icon: <FaUserEdit />, color: 'bg-blue-50 text-blue-600 border-blue-200' };
    if (acc.includes('matricula') || acc.includes('registró')) return { icon: <FaUserShield />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    if (acc.includes('agenda')) return { icon: <FaRegCalendarCheck />, color: 'bg-purple-50 text-purple-600 border-purple-200' };
    return { icon: <FaInfoCircle />, color: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-in fade-in">

      {/* HEADER Y BUSCADOR */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <FaHistory size={16} />
              </div>
              Registro de Actividad
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Auditoría completa del sistema y acciones del equipo</p>
          </div>
        </div>

        <div className="relative group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Buscar por usuario, acción o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* LISTA DE LOGS CON SCROLL PERSONALIZADO */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
        <style>{`
          .flex-1::-webkit-scrollbar { width: 6px; }
          .flex-1::-webkit-scrollbar-track { background: transparent; }
          .flex-1::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
        `}</style>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, i) => {
                const { icon, color } = getActionIconAndColor(log.accion);

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i < 10 ? i * 0.05 : 0 }}
                    className="group flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white"
                  >
                    {/* ICONO ACCIÓN */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 transition-transform group-hover:scale-110 ${color}`}>
                      {icon}
                    </div>

                    {/* CONTENIDO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{log.accion}</span>
                          <span className="text-xs text-slate-400 font-medium">por</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                            {log.nombre_usuario}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('es-CO', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-50 mt-2">
                        {log.detalles}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <FaSearch size={24} />
                </div>
                <p className="text-slate-500 font-medium">No se encontraron registros de actividad.</p>
              </div>
            )}
          </AnimatePresence>

          {/* BOTÓN CARGAR MÁS */}
          {hasMoreLogs && filteredLogs.length > 0 && (
            <div className="pt-8 pb-4 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="group relative px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Cargando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Cargar Registros Anteriores
                    <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}