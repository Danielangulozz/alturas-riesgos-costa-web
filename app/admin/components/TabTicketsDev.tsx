import React, { useState, useEffect } from "react";
import { FaTicketAlt, FaCheckCircle, FaSpinner, FaReply, FaUser, FaShieldAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatFechaElegante } from "../utils/formatters";

export function TabTicketsDev() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respuesta, setRespuesta] = useState<{ [key: string]: string }>({});
  const [enviando, setEnviando] = useState<string | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  const cargarTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tickets_soporte')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const resolverTicket = async (id: string) => {
    const respText = respuesta[id];
    if (!respText) return toast.error("Escribe una respuesta antes de resolver.");

    setEnviando(id);
    const { error } = await supabase
      .from('tickets_soporte')
      .update({ estado: 'Resuelto', respuesta: respText })
      .eq('id', id);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success("Ticket marcado como Resuelto.");
      cargarTickets();
    }
    setEnviando(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <FaSpinner className="animate-spin text-4xl mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">Cargando tickets de soporte...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-3xl p-16 text-center border border-slate-200 bg-white shadow-sm">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <FaTicketAlt size={30} className="text-blue-300" />
        </div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
          No hay tickets pendientes
        </p>
        <p className="text-xs text-slate-400 mt-2">Todo funciona correctamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-[#0F172A] rounded-3xl p-6 lg:p-8 flex items-center gap-4 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="w-16 h-16 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center shrink-0 relative z-10">
          <FaShieldAlt size={28} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black uppercase tracking-tight">Centro de Desarrollador</h2>
          <p className="text-slate-400 text-sm mt-1">Gestión de tickets, bugs y sugerencias reportadas por el equipo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets.map((t) => (
          <div key={t.id} className={`rounded-3xl border ${t.estado === 'Resuelto' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} shadow-sm overflow-hidden flex flex-col`}>
            {/* Header del Ticket */}
            <div className={`p-4 border-b flex justify-between items-center ${t.estado === 'Resuelto' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                  t.tipo.includes('Bug') ? 'bg-red-100 text-red-700 border-red-200' : 
                  t.tipo.includes('Mejora') ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                  'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {t.tipo}
                </span>
                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${t.estado === 'Resuelto' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {t.estado}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {formatFechaElegante(t.created_at)}
              </span>
            </div>

            {/* Cuerpo del Ticket */}
            <div className="p-5 flex-1">
              <div className="flex items-center gap-2 mb-3 text-sm text-slate-600 font-bold">
                <FaUser className="text-slate-400" /> {t.usuario} <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">{t.rol}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                {t.mensaje}
              </p>

              {t.imagen_url && (
                <div className="mt-3">
                  <button 
                    onClick={() => setImagenSeleccionada(t.imagen_url)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors border border-blue-100"
                  >
                    Ver Evidencia Adjunta
                  </button>
                </div>
              )}

              {t.estado === 'Resuelto' ? (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><FaCheckCircle /> Respuesta del Desarrollador</p>
                  <p className="text-sm text-emerald-800">{t.respuesta}</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={respuesta[t.id] || ""}
                    onChange={(e) => setRespuesta({ ...respuesta, [t.id]: e.target.value })}
                    placeholder="Escribe tu respuesta técnica o solución..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-700 h-24 resize-none placeholder:text-slate-300"
                  />
                  <button
                    onClick={() => resolverTicket(t.id)}
                    disabled={enviando === t.id}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {enviando === t.id ? <FaSpinner className="animate-spin" /> : <FaReply />} Resolver y Enviar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Visor de Imagen */}
      {imagenSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setImagenSeleccionada(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={imagenSeleccionada} alt="Evidencia" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            <button 
              onClick={() => setImagenSeleccionada(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors border border-white/20 backdrop-blur-md"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
