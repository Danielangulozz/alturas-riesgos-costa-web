import React from "react";
import {
  FaClipboardList, FaCalendarAlt, FaUserPlus, FaUsers, FaUserCheck,
  FaUserCog, FaHistory, FaMoneyBillWave, FaUser
} from "react-icons/fa";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  notificacionesNuevas: number;
  setNotificacionesNuevas: (count: number) => void;
  userRole: string;
}

export function Sidebar({
  activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen,
  notificacionesNuevas, setNotificacionesNuevas, userRole
}: SidebarProps) {
  const menuItems = [
    { id: 'solicitudes', icon: <FaClipboardList />, label: 'Solicitudes Web', roles: ['admin_general', 'director'] },
    { id: 'agenda', icon: <FaCalendarAlt />, label: 'Calendario / Agenda', roles: ['admin_general', 'director', 'coordinator'] },
    { id: 'estudiantes', icon: <FaUserPlus />, label: 'Matricular Nuevo', roles: ['admin_general', 'director', 'coordinator', 'trainer'] },
    { id: 'lista', icon: <FaUsers />, label: 'Base de Datos', roles: ['admin_general', 'director', 'coordinator'] },
    { id: 'listados', icon: <FaUserCheck />, label: 'Planillas de Clase', roles: ['admin_general', 'director', 'coordinator', 'trainer'] },
    { id: 'equipo', icon: <FaUserCog />, label: 'Gestionar Equipo', roles: ['admin_general', 'director'] },
    { id: 'logs', icon: <FaHistory />, label: 'Auditoría / Logs', roles: ['admin_general', 'director'] },
    { id: 'precios', icon: <FaMoneyBillWave />, label: 'Precios Cursos', roles: ['admin_general', 'director'] },
    { id: 'config', icon: <FaUser />, label: 'Mi Perfil', roles: ['admin_general', 'director', 'coordinator', 'trainer'] },
  ];

  return (
    <>
      {/* Overlay para móvil cuando el menú está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-300 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-2xl flex-shrink-0 border-r border-slate-800
      `}>
        
        {/* LOGO AYR ADMIN */}
        <div className="p-2 border-b border-slate-800/50 flex flex-col items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <img src="/logo-blanco.webp" alt="AR COSTA" className="w-16 h-16 object-contain" />
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tighter">
              <span className="text-[#FFD700]">A</span>
              <span className="text-[#00558A]">Y</span>
              <span className="text-[#C41E3A]">R</span>
              <span className="ml-1 text-white font-light text-sm tracking-widest uppercase">Admin</span>
            </h1>
            <div className="flex h-[2px] w-full mt-1">
              <div className="flex-1 bg-[#FFD700]"></div>
              <div className="flex-1 bg-[#00558A]"></div>
              <div className="flex-1 bg-[#C41E3A]"></div>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <button 
              key={item.id} 
              onClick={() => { 
                setActiveTab(item.id); 
                setIsSidebarOpen(false); 
                // Si entran a la base de datos, reiniciamos el contador a 0
                if (item.id === 'lista') setNotificacionesNuevas(0); 
              }} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <span className={activeTab === item.id ? 'text-[#FFD700]' : ''}>{item.icon}</span> 
              <span className="flex-1 text-left">{item.label}</span>

              {/* BADGE ROJO */}
              {item.id === 'lista' && notificacionesNuevas > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-red-500/50 shadow-lg">
                  {notificacionesNuevas}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50 text-center">
          <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">© 2026 Alturas y Riesgos de la Costa S.A.S</p>
        </div>
      </aside>
    </>
  );
}