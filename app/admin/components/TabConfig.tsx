import React from "react";
import { FaUserCog, FaShieldAlt, FaUser, FaEnvelope, FaClock, FaSignOutAlt } from "react-icons/fa";

interface TabConfigProps {
  userName: string;
  userEmail: string;
  userRole: string;
  horaIngreso: string;
  cerrarSesion: () => void;
}

export function TabConfig({ userName, userEmail, userRole, horaIngreso, cerrarSesion }: TabConfigProps) {
  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header con Gradiente y Avatar */}
        <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] p-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <FaUserCog size={80} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-[#FFD700] rounded-3xl flex items-center justify-center text-[#0F172A] text-4xl font-black shadow-2xl rotate-3">
              {userName?.charAt(0)}
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black tracking-tighter uppercase">{userName}</h3>
              <div className="inline-block bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full mt-2">
                <p className="text-[10px] text-blue-300 uppercase font-black tracking-widest flex items-center gap-2">
                  <FaShieldAlt size={10}/> Sistema de Gestión de Riesgos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-2 bg-white">
          
          {/* Nombre Completo */}
          <div className="group flex items-center gap-5 p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-slate-200 transition-all">
            <div className="p-4 bg-white text-slate-400 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors">
              <FaUser size={15}/>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nombre del Colaborador</p>
              <p className="text-lg font-bold text-slate-700">{userName}</p>
            </div>
          </div>

          {/* Correo */}
          <div className="group flex items-center gap-5 p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-slate-200 transition-all">
            <div className="p-4 bg-white text-slate-400 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors">
              <FaEnvelope size={20}/>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correo Institucional</p>
              <p className="text-lg font-bold text-slate-700">{userEmail}</p>
            </div>
          </div>

          {/* Rango con Estilo de Badge */}
          <div className={`group flex items-center gap-5 p-5 rounded-[24px] border transition-all ${
            userRole === 'admin_general' ? 'bg-red-50/50 border-red-100' : 
            userRole === 'director' ? 'bg-purple-50/50 border-purple-100' : 'bg-blue-50/50 border-blue-100'
          }`}>
            <div className={`p-4 bg-white rounded-2xl shadow-sm ${
              userRole === 'admin_general' ? 'text-red-500' : 
              userRole === 'director' ? 'text-purple-500' : 'text-blue-500'
            }`}>
              <FaShieldAlt size={20}/>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rango de Acceso</p>
              <p className={`text-lg font-black uppercase tracking-tight ${
                userRole === 'admin_general' ? 'text-red-700' : 
                userRole === 'director' ? 'text-purple-700' : 'text-blue-700'
              }`}>
                {userRole === 'admin_general' ? 'Administrador General' : 
                userRole === 'director' ? 'Director Estratégico' :
                userRole === 'coordinator' ? 'Coordinador Académico' : 'Entrenador Especializado'}
              </p>
            </div>
          </div>

          {/* Sesión Info */}
          <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-slate-200 transition-all">
            <div className="p-4 bg-white text-slate-400 rounded-2xl shadow-sm">
              <FaClock size={20}/>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ingreso al Panel</p>
              <p className="text-sm font-mono text-slate-600 font-bold">{horaIngreso}</p>
            </div>
          </div>

          {/* Botón Salida */}
          <div className="pt-6 mt-4">
            <button 
              onClick={cerrarSesion} 
              className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 active:scale-95"
            >
              <FaSignOutAlt size={18} /> Finalizar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}