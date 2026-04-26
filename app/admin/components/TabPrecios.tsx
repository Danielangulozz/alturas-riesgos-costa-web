import React from "react";
import { FaMoneyBillWave, FaTag, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";

interface TabPreciosProps {
  userRole: string;
  catalogoCursos: any[];
  actualizarPrecioMaestro: (id: string, nuevoPrecio: string) => void;
}

export function TabPrecios({ userRole, catalogoCursos, actualizarPrecioMaestro }: TabPreciosProps) {
  if (userRole !== 'admin_general' && userRole !== 'developer' && userRole !== 'director') return null;

  const handlePrecioChange = (id: string, nuevoPrecio: string, nombreCurso: string) => {
    actualizarPrecioMaestro(id, nuevoPrecio);
    toast.success(`Precio de "${nombreCurso}" actualizado`, { icon: '💰' });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <FaMoneyBillWave className="text-blue-600" /> Lista de Precios Base
          </h3>
          <p className="text-xs text-slate-400 mt-1">Edita el precio y los cambios se guardan automáticamente al salir del campo</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <FaTag className="text-slate-400" size={12} />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{catalogoCursos.length} Cursos</span>
        </div>
      </div>

      {/* CARDS RESPONSIVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalogoCursos.map((c) => (
          <div key={c.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-tight leading-snug">{c.nombre_curso}</h4>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <FaMoneyBillWave size={16} />
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Precio Base</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-300">$</span>
                <input
                  id={`precio-${c.id}`}
                  name={`precio-${c.id}`}
                  type="number"
                  defaultValue={c.precio_base}
                  onBlur={(e) => handlePrecioChange(c.id, e.target.value, c.nombre_curso)}
                  className="bg-transparent text-2xl font-black text-blue-600 outline-none w-full border-b-2 border-transparent focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-[9px] text-slate-400 font-bold">
                <FaSave size={8} /> Auto-guardado al salir del campo
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}