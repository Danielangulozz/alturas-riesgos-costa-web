import React, { useState } from "react";
import { FaUserCog, FaPlus, FaUserPlus, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface TabEquipoProps {
  userRole: string;
  listaPerfiles: any[];
  fetchData: () => void;
  formEquipo: any;
  setFormEquipo: React.Dispatch<React.SetStateAction<any>>;
  isModalEquipoOpen: boolean;
  setIsModalEquipoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleCrearUsuarioManual: (email: string, pass: string, nombre: string) => void;
}

export function TabEquipo({
  userRole, listaPerfiles, fetchData, formEquipo, setFormEquipo,
  isModalEquipoOpen, setIsModalEquipoOpen, handleCrearUsuarioManual
}: TabEquipoProps) {

  const [confirmarEliminar, setConfirmarEliminar] = useState<any>(null);

  if (userRole !== 'admin_general' && userRole !== 'developer' && userRole !== 'director') return null;

  const eliminarColaborador = async (perfil: any) => {
    const tId = toast.loading("Eliminando colaborador...");
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', perfil.id);
      if (error) throw error;
      toast.success(`${perfil.full_name} eliminado`, { id: tId });
      setConfirmarEliminar(null);
      fetchData();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: tId });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FaUserCog className="text-blue-600"/> Gestión de Personal
          </h3>
          <p className="text-xs text-slate-400 mt-1">Administra los accesos y rangos de tu equipo.</p>
        </div>
        <button 
          onClick={() => { setFormEquipo({ email: "", pass: "", nombre: "" }); setIsModalEquipoOpen(true); }}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all"
        >
          <FaPlus/> Registrar Colaborador
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
            <tr>
              <th className="px-6 py-4">Colaborador</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rango</th>
              <th className="px-6 py-4">Cambiar Rango</th>
              <th className="px-6 py-4 text-center">Eliminar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listaPerfiles.length > 0 ? listaPerfiles.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition group">
                <td className="px-6 py-4 font-bold text-slate-700 uppercase">{p.full_name}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{p.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    p.role === 'admin_general' ? 'bg-red-100 text-red-600' :
                    p.role === 'developer'     ? 'bg-slate-900 text-emerald-400 font-mono tracking-widest' :
                    p.role === 'director'      ? 'bg-purple-100 text-purple-600' :
                    p.role === 'coordinator'   ? 'bg-blue-100 text-blue-600' 
                                               : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    className="p-2 bg-slate-50 border rounded-xl text-xs font-bold outline-none border-transparent hover:border-blue-200"
                    value={p.role}
                    onChange={async (e) => {
                      const { error } = await supabase.from('profiles').update({ role: e.target.value }).eq('id', p.id);
                      if (!error) { toast.success("Rol actualizado"); fetchData(); }
                    }}
                  >
                    <option value="trainer">trainer</option>
                    <option value="coordinator">coordinator</option>
                    <option value="director">director</option>
                    <option value="admin_general">admin_general</option>
                    <option value="developer">developer</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => setConfirmarEliminar(p)}
                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar colaborador"
                  >
                    <FaTrash size={13}/>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 italic text-xs">
                  No hay perfiles registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR COLABORADOR */}
      {isModalEquipoOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/80 z-[120] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-md w-full shadow-2xl border border-white/20 animate-in zoom-in duration-300">
            {/* Header del Modal */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5"></div>
              <div className="bg-white/20 text-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30 rotate-3 shadow-sm">
                <FaUserPlus size={24}/>
              </div>
              <h3 className="text-xl font-black text-white tracking-tighter uppercase relative z-10">Nuevo Equipo</h3>
              <p className="text-[9px] text-blue-100 font-bold uppercase tracking-[0.2em] relative z-10">Acceso AR Costa</p>
            </div>
            
            {/* Formulario */}
            <div className="p-6 space-y-4 bg-slate-50">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <div className="relative">
                  <input type="text" placeholder="Ej: Juan Pérez"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700 text-sm transition-all shadow-sm placeholder:text-slate-300 placeholder:font-medium"
                    value={formEquipo.nombre}
                    onChange={(e) => setFormEquipo({...formEquipo, nombre: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input type="email" placeholder="correo@arcosta.com"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700 text-sm transition-all shadow-sm placeholder:text-slate-300 placeholder:font-medium"
                  value={formEquipo.email}
                  onChange={(e) => setFormEquipo({...formEquipo, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña Temporal</label>
                <input type="password" placeholder="••••••••"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700 text-sm transition-all shadow-sm placeholder:text-slate-300 placeholder:font-medium"
                  value={formEquipo.pass}
                  onChange={(e) => setFormEquipo({...formEquipo, pass: e.target.value})}
                />
              </div>
              <div className="pt-3 space-y-2">
                <button 
                  onClick={() => handleCrearUsuarioManual(formEquipo.email, formEquipo.pass, formEquipo.nombre)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Crear Cuenta
                </button>
                <button 
                  onClick={() => setIsModalEquipoOpen(false)}
                  className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {confirmarEliminar && (
        <div className="fixed inset-0 bg-[#0F172A]/80 z-[130] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-red-100 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-rose-600"></div>
            <div className="text-center mb-8 mt-2">
              <div className="bg-red-50 text-red-500 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
                <FaTrash size={32} className="animate-pulse"/>
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">¿Despedir Equipo?</h3>
              <p className="text-xs text-slate-400 font-bold mt-2 tracking-widest">
                ESTÁS A PUNTO DE ELIMINAR A
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl mt-4 border border-slate-100">
                <p className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  {confirmarEliminar.full_name}
                </p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">{confirmarEliminar.email}</p>
              </div>
              <p className="text-[10px] text-red-500 font-black tracking-widest uppercase mt-4 bg-red-50 py-2 rounded-xl">
                Acción Irreversible
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarEliminar(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarColaborador(confirmarEliminar)}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-500/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}