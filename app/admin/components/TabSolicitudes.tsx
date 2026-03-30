import React from "react";
import { FaBuilding, FaUsers, FaTrash, FaPhoneAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { formatFechaElegante, calcularTotalSolicitud } from "../utils/formatters";
import { supabase } from "@/lib/supabase";

interface TabSolicitudesProps {
  solicitudes: any[];
  agendaBD: any[];
  fechasSeleccionadas: string[];
  setFechasSeleccionadas: React.Dispatch<React.SetStateAction<string[]>>;
  preciosEditados: { [key: string]: string };
  setPreciosEditados: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  catalogoCursos: any[];
  enviarWhatsAppMultifecha: (sol: any) => void;
  fetchData: () => void;
}

export function TabSolicitudes({
  solicitudes, agendaBD, fechasSeleccionadas, setFechasSeleccionadas,
  preciosEditados, setPreciosEditados, catalogoCursos, enviarWhatsAppMultifecha, fetchData
}: TabSolicitudesProps) {

  if (solicitudes.length === 0) {
    return (
      <div className="rounded-xl p-16 text-center border border-white/5 bg-[#1e2a38]/40">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          No hay solicitudes pendientes en este momento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {solicitudes.map((sol, idx) => {
        const total = preciosEditados[sol.id] || calcularTotalSolicitud(sol, 0, catalogoCursos);
        const esEmpresa = sol.tipo_cliente === "Empresa";

        return (
          <div
            key={sol.id}
            className="rounded-2xl border border-white/[0.07] overflow-hidden bg-[#1e2a38] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/25 hover:shadow-xl hover:shadow-black/30"
            style={{ animation: `slideUp 0.35s ease both ${idx * 0.07}s` }}
          >

            {/* ── HEADER ── */}
            <div className={`px-5 py-3 flex items-center justify-between border-b border-white/[0.06] ${esEmpresa ? 'bg-blue-950/30' : 'bg-white/[0.02]'}`}>
              <div className="flex items-center gap-3 flex-wrap">
                {esEmpresa ? (
                  <span className="inline-flex items-center gap-1.5 bg-blue-500/15 text-blue-300/90 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-400/25">
                    <FaBuilding size={8} /> Empresa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-white/[0.05] text-slate-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10">
                    <FaUsers size={8} /> Particular
                  </span>
                )}

                <div className="flex items-baseline gap-2 flex-wrap">
                  {esEmpresa && (
                    <>
                      <span className="text-[11px] font-black text-blue-300/80 uppercase tracking-[0.14em]">
                        {sol.empresa}
                      </span>
                      <span className="text-white/15 text-sm">·</span>
                    </>
                  )}
                  <span className="text-[13px] font-bold text-slate-300 uppercase tracking-tight">
                    {sol.nombre}
                  </span>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (confirm("¿Eliminar solicitud?")) {
                    await supabase.from('solicitudes').delete().eq('id', sol.id);
                    fetchData();
                  }
                }}
                className="text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all p-1.5 rounded-lg"
              >
                <FaTrash size={11} />
              </button>
            </div>

            {/* ── CUERPO ── */}
            <div className="flex flex-col md:flex-row">

              {/* COL CONTACTO */}
              <div className="p-4 md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.05] bg-black/10 flex flex-col gap-3">
                <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em]">Contacto</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-medium">
                    <span className="w-[18px] h-[18px] rounded-md bg-white/[0.05] flex items-center justify-center shrink-0">
                      <FaPhoneAlt size={8} className="text-white/25" />
                    </span>
                    {sol.telefono}
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-500 font-medium">
                    <span className="w-[18px] h-[18px] rounded-md bg-white/[0.05] flex items-center justify-center shrink-0">
                      <FaEnvelope size={8} className="text-white/25" />
                    </span>
                    <span className="truncate">{sol.email || 'No especificado'}</span>
                  </div>
                </div>
              </div>

              {/* COL CURSOS */}
              <div className="p-4 flex-1">
                <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] mb-4">Programas solicitados</p>
                <div className="space-y-3">
                  {(sol.cursos_detalles || [{ curso: sol.curso, cantidad: sol.numero_personas || 1 }]).map((c: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/[0.06] bg-black/15 p-3.5 transition-colors hover:border-white/10"
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight leading-snug">
                          {c.curso}
                        </span>
                        <span className="shrink-0 bg-blue-600/45 text-blue-200/80 text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest whitespace-nowrap">
                          {c.cantidad} CUPO{c.cantidad > 1 ? 'S' : ''}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {agendaBD.filter(a => a.curso === c.curso).length > 0 ? (
                          agendaBD.filter(a => a.curso === c.curso).map(op => (
                            <button
                              key={op.id}
                              onClick={() =>
                                fechasSeleccionadas.includes(op.id)
                                  ? setFechasSeleccionadas(prev => prev.filter(f => f !== op.id))
                                  : setFechasSeleccionadas(prev => [...prev, op.id])
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all duration-150 ${fechasSeleccionadas.includes(op.id)
                                  ? 'bg-amber-400/90 text-slate-900 border-amber-400/80 font-black scale-[1.04]'
                                  : 'bg-white/[0.04] text-slate-500 border-white/10 hover:border-white/25 hover:text-slate-300'
                                }`}
                            >
                              {formatFechaElegante(op.fecha).split(',')[1]} ({op.hora})
                            </button>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-600 italic">Sin fechas programadas</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COL COTIZACIÓN */}
              <div className="p-4 md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-white/[0.05] bg-black/10 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] mb-4">Propuesta</p>

                  <div className="flex gap-1.5 mb-3">
                    {[0, 10, 20].map(d => {
                      const price = calcularTotalSolicitud(sol, d, catalogoCursos);
                      return (
                        <button
                          key={d}
                          onClick={() => setPreciosEditados({ ...preciosEditados, [sol.id]: price })}
                          className={`flex-1 text-[9px] font-black py-1.5 rounded-lg border transition-all ${total === price
                              ? 'bg-blue-600/60 text-blue-200 border-blue-500/40'
                              : 'bg-white/[0.04] text-slate-600 border-white/[0.07] hover:text-slate-400 hover:bg-white/[0.07]'
                            }`}
                        >
                          {d === 0 ? 'Base' : `-${d}%`}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-black/20 rounded-xl border border-white/10 flex items-center gap-2 px-3 py-2.5 focus-within:border-blue-400/30 transition-colors">
                    <span className="text-white/25 font-black text-base leading-none">$</span>
                    <input
                      type="text"
                      className="bg-transparent outline-none w-full font-black text-slate-200 text-sm"
                      value={total}
                      onChange={(e) => setPreciosEditados({ ...preciosEditados, [sol.id]: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  onClick={() => enviarWhatsAppMultifecha(sol)}
                  className="w-full bg-[#25D366] hover:bg-[#1ebb5a] text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.97] shadow-lg shadow-green-900/20"
                >
                  <FaWhatsapp size={13} /> Enviar WhatsApp
                </button>
              </div>

            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}