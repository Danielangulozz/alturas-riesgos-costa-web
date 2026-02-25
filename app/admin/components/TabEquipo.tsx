import React from "react";
import { FaUserCog, FaPlus, FaUserPlus } from "react-icons/fa";
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
  
  if (userRole !== 'admin_general' && userRole !== 'director') return null;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* ... (Header igual) ... */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FaUserCog className="text-blue-600"/> Gestión de Personal
          </h3>
          <p className="text-xs text-slate-400 mt-1">Administra los accesos y rangos de tu equipo.</p>
        </div>
        
        <button 
          onClick={() => {
            setFormEquipo({ email: "", pass: "", nombre: "" });
            setIsModalEquipoOpen(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all"
        >
          <FaPlus/> Registrar Colaborador
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
            <tr>
              <th className="px-6 py-4">Colaborador</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rango</th>
              <th className="px-6 py-4">Cambiar Rango</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listaPerfiles.length > 0 ? listaPerfiles.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-700 uppercase">{p.full_name}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{p.email}</td>
                <td className="px-6 py-4">
                  {/* ... (Badge igual) ... */}
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    p.role === 'admin_general' ? 'bg-red-100 text-red-600' :
                    p.role === 'director' ? 'bg-purple-100 text-purple-600' :
                    p.role === 'coordinator' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    id={`rol-${p.id}`}
                    name={`rol-${p.id}`}
                    className="p-2 bg-slate-50 border rounded-xl text-xs font-bold outline-none border-transparent hover:border-blue-200"
                    value={p.role}
                    onChange={async (e) => {
                      const nuevoRol = e.target.value;
                      const { error } = await supabase.from('profiles').update({ role: nuevoRol }).eq('id', p.id);
                      if (!error) {
                        toast.success(`Rol actualizado`);
                        fetchData(); 
                      }
                    }}
                  >
                    <option value="trainer">trainer</option>
                    <option value="coordinator">coordinator</option>
                    <option value="director">director</option>
                    <option value="admin_general">admin_general</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-400 italic text-xs">No hay perfiles registrados aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalEquipoOpen && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
            <div className="text-center mb-8">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <FaUserPlus size={30}/>
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Nuevo Miembro</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Acceso AR COSTA</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="eq_nombre" className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
                <input 
                  id="eq_nombre"
                  name="eq_nombre"
                  type="text" 
                  placeholder="Ej: Juan Pérez" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                  value={formEquipo.nombre}
                  onChange={(e) => setFormEquipo({...formEquipo, nombre: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="eq_email" className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
                <input 
                  id="eq_email"
                  name="eq_email"
                  type="email" 
                  placeholder="correo@arcosta.com" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                  value={formEquipo.email}
                  onChange={(e) => setFormEquipo({...formEquipo, email: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="eq_pass" className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña Temporal</label>
                <input 
                  id="eq_pass"
                  name="eq_pass"
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                  value={formEquipo.pass}
                  onChange={(e) => setFormEquipo({...formEquipo, pass: e.target.value})}
                />
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => handleCrearUsuarioManual(formEquipo.email, formEquipo.pass, formEquipo.nombre)}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  CREAR CUENTA
                </button>
                <button 
                  onClick={() => setIsModalEquipoOpen(false)}
                  className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}