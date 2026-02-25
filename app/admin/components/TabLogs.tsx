import React from "react";
import { FaHistory } from "react-icons/fa";

interface TabLogsProps {
  userRole: string;
  logsRecientes: any[];
}

export function TabLogs({ userRole, logsRecientes }: TabLogsProps) {
  if (userRole !== 'admin_general' && userRole !== 'director') return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 animate-in fade-in">
      <h3 className="font-bold text-slate-700 flex items-center gap-2">
        <FaHistory className="text-blue-500"/> Historial de Actividad
      </h3>
      
      <div className="space-y-3">
        {logsRecientes.map(log => (
          <div key={log.id} className="border-b pb-3 last:border-0 border-slate-100">
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-bold text-slate-800">
                {log.accion} 
                <span className="font-normal text-slate-500 ml-2">por {log.nombre_usuario}</span> 
              </p>
              <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-600 italic">"{log.detalles}"</p> 
          </div>
        ))}
      </div>
    </div>
  );
}