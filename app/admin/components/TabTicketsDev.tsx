import React, { useState } from "react";
import { FaTicketAlt, FaCheckCircle, FaSpinner, FaReply, FaUser, FaShieldAlt, FaTrashAlt, FaClock } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface TabTicketsDevProps {
  tickets: any[];
  fetchData: () => void;
  triggerConfirm: (title: string, msg: string, onConfirm: () => void, type?: any) => void;
}

export function TabTicketsDev({ tickets, fetchData, triggerConfirm }: TabTicketsDevProps) {
  const [respuesta, setRespuesta] = useState<{ [key: string]: string }>({});
  const [enviando, setEnviando] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  const formatFechaHora = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

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
      fetchData();
    }
    setEnviando(null);
  };

  const eliminarTicket = async (id: string) => {
    triggerConfirm(
      "Eliminar Ticket",
      "¿Estás seguro de eliminar este ticket permanentemente? Esta acción no se puede deshacer.",
      async () => {
        setEliminando(id);
        const { error } = await supabase
          .from('tickets_soporte')
          .delete()
          .eq('id', id);

        if (error) {
          toast.error("No se pudo eliminar el ticket.");
        } else {
          toast.success("Ticket eliminado.");
          fetchData();
        }
        setEliminando(null);
      },
      "danger"
    );
  };

  if (tickets.length === 0) {
    return (
      <div className="rounded-3xl p-16 text-center border border-slate-200 bg-white shadow-sm animate-in fade-in">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <FaTicketAlt size={30} className="text-blue-300" />
        </div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
          No hay tickets pendientes
        </p>
        <p className="text-xs text-slate-400 mt-2">Todo funciona correctamente.</p>
        <button onClick={() => fetchData()} className="mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Refrescar Manualmente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-[#0F172A] rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center shrink-0">
            <FaShieldAlt size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Centro de Desarrollador</h2>
            <p className="text-slate-400 text-sm mt-1">Soporte técnico y reporte de fallos.</p>
          </div>
        </div>
        <button 
          onClick={() => fetchData()}
          className="relative z-10 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-colors"
        >
          Sincronizar Datos
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {tickets.map((t) => (
          <div key={t.id} className={`group rounded-3xl border ${t.estado === 'Resuelto' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md`}>
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
              <button 
                onClick={() => eliminarTicket(t.id)}
                disabled={eliminando === t.id}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2 transition-all"
                title="Eliminar Ticket"
              >
                {eliminando === t.id ? <FaSpinner className="animate-spin" /> : <FaTrashAlt size={12}/>}
              </button>
            </div>

            {/* Cuerpo del Ticket */}
            <div className="p-5 flex-1">
              <div className="flex items-center justify-between mb-3 text-sm text-slate-600 font-bold">
                <div className="flex items-center gap-2">
                  <FaUser className="text-slate-400" /> {t.usuario} <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">{t.rol}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <FaClock /> {formatFechaHora(t.created_at)}
                </div>
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
