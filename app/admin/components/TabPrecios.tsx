import React from "react";
import { FaMoneyBillWave } from "react-icons/fa";

interface TabPreciosProps {
  userRole: string;
  catalogoCursos: any[];
  actualizarPrecioMaestro: (id: string, nuevoPrecio: string) => void;
}

export function TabPrecios({ userRole, catalogoCursos, actualizarPrecioMaestro }: TabPreciosProps) {
  if (userRole !== 'admin_general' && userRole !== 'developer' && userRole !== 'director') return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in">
      <div className="p-6 border-b bg-slate-50">
        <h3 className="font-bold text-slate-700 flex items-center gap-2"><FaMoneyBillWave className="text-blue-600"/> Lista de Precios Base</h3>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
            <th className="px-6 py-4">Curso</th>
            <th className="px-6 py-4">Precio Base</th>
            <th className="px-6 py-4">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {catalogoCursos.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 font-bold text-slate-700">{c.nombre_curso}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-blue-600 font-bold">
                  $ <input 
                      id={`precio-${c.id}`}
                      name={`precio-${c.id}`}
                      type="number" 
                      defaultValue={c.precio_base} 
                      onBlur={(e) => actualizarPrecioMaestro(c.id, e.target.value)} 
                      className="bg-transparent border-b border-blue-200 w-24 outline-none focus:border-blue-600 transition-colors" 
                    />
                </div>
              </td>
              <td className="px-6 py-4"><span className="text-[10px] text-slate-400 italic">Auto-guardar al salir del campo</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}