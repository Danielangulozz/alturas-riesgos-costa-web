import React from "react";
import { FaBuilding, FaUsers, FaUserTie, FaTrash, FaPhoneAlt } from "react-icons/fa";
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

  return (
    <div className="grid gap-6 animate-in fade-in">
      {solicitudes.map((sol) => (
        <div key={sol.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {sol.tipo_cliente === "Empresa" ? (
                  <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                    <FaBuilding/> EMPRESA: {sol.empresa}
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                    <FaUsers/> PARTICULAR
                  </span>
                )}
              </div>
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FaUserTie className="text-slate-400" size={14}/> {sol.nombre}
              </h4>
            </div>
            <button 
              onClick={async () => { 
                if(confirm("¿Eliminar?")) { 
                  await supabase.from('solicitudes').delete().eq('id', sol.id); 
                  fetchData(); 
                }
              }} 
              className="text-slate-200 hover:text-red-500"
            >
              <FaTrash size={14}/>
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
            {sol.cursos_detalles ? sol.cursos_detalles.map((c: any, i: number) => (
              <div key={i} className="flex flex-col py-2 border-b last:border-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{c.curso}</span>
                  <span className="text-blue-600 font-black">{c.cantidad} pers.</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {agendaBD.filter(a => a.curso === c.curso).map(op => (
                    <button 
                      key={op.id} 
                      onClick={() => fechasSeleccionadas.includes(op.id) 
                        ? setFechasSeleccionadas(prev => prev.filter(f => f !== op.id)) 
                        : setFechasSeleccionadas(prev => [...prev, op.id])
                      } 
                      className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                        fechasSeleccionadas.includes(op.id) 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-slate-400'
                      }`}
                    >
                      {formatFechaElegante(op.fecha).split(',')[1]} ({op.hora})
                    </button>
                  ))}
                </div>
              </div>
            )) : (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold">{sol.curso} ({sol.numero_personas || 1} pers.)</span>
                <div className="flex flex-wrap gap-1">
                  {agendaBD.filter(a => a.curso === sol.curso).map(op => (
                    <button 
                      key={op.id} 
                      onClick={() => fechasSeleccionadas.includes(op.id) 
                        ? setFechasSeleccionadas(prev => prev.filter(f => f !== op.id)) 
                        : setFechasSeleccionadas(prev => [...prev, op.id])
                      } 
                      className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                        fechasSeleccionadas.includes(op.id) ? 'bg-blue-600 text-white' : 'bg-white'
                      }`}
                    >
                      {formatFechaElegante(op.fecha)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t pt-4">
            <div className="flex gap-2">
              {[0, 10, 20, 30].map(d => (
                <button 
                  key={d} 
                  onClick={() => setPreciosEditados({
                    ...preciosEditados, 
                    [sol.id]: calcularTotalSolicitud(sol, d, catalogoCursos)
                  })} 
                  className={`px-2 py-1 rounded text-[10px] font-bold border ${
                    preciosEditados[sol.id] === calcularTotalSolicitud(sol, d, catalogoCursos) 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-50'
                  }`}
                >
                  {d === 0 ? 'Base' : `${d}% OFF`}
                </button>                      
              ))}
            </div>
            <div className="bg-blue-50/50 px-4 py-2 rounded-xl border border-dashed border-blue-200">
              <div className="flex items-center gap-1 font-black text-blue-800 text-lg">
                <span>$</span>
                <input 
                  type="text" 
                  className="bg-transparent outline-none w-32" 
                  value={preciosEditados[sol.id] || calcularTotalSolicitud(sol, 0, catalogoCursos)} 
                  onChange={(e) => setPreciosEditados({...preciosEditados, [sol.id]: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <button 
            onClick={() => enviarWhatsAppMultifecha(sol)} 
            className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg transition-all"
          >
            <FaPhoneAlt/> Enviar Propuesta a WhatsApp
          </button>
        </div>
      ))}
    </div>
  );
}