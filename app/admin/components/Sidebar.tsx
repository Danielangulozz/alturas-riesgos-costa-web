import React from "react";
import {
  FaClipboardList, FaCalendarAlt, FaUserPlus, FaUsers, FaUserCheck,
  FaUserCog, FaHistory, FaMoneyBillWave, FaUser, FaChevronLeft, FaChevronRight
} from "react-icons/fa";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  notificacionesNuevas: number;
  setNotificacionesNuevas: (count: number) => void;
  userRole: string;
}

export function Sidebar({
  activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen,
  isCollapsed, setIsCollapsed,
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
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Overlay para móvil cuando el menú está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#0F172A] text-slate-300 
        transform transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-2xl flex-shrink-0 border-r border-slate-800
        ${isCollapsed ? "lg:w-20" : "lg:w-72 w-80"}
      `}>
        
        {/* LOGO AYR ADMIN */}
        <div className="relative p-4 border-b border-slate-800/50 flex flex-col items-center gap-3 shrink-0">
          <div className="cursor-pointer flex flex-col items-center" onClick={() => setActiveTab('dashboard')}>
             <img 
               src="/logo-blanco.webp" 
               alt="AR COSTA" 
               className={`transition-all duration-300 object-contain ${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'}`} 
             />
             <div className={`text-center transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 scale-0 overflow-hidden' : 'opacity-100 mt-2'}`}>
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

          {/* Botón Toggle para escritorio */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-10 bg-blue-600 text-white w-6 h-6 rounded-full items-center justify-center border-2 border-[#0F172A] shadow-lg hover:scale-110 transition-transform active:scale-95"
          >
            {isCollapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
          </button>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden hide-scrollbar">
          <div className="space-y-2">
            {menuItems.filter(item => item.roles.includes(userRole)).map((item) => (
              <button 
                key={item.id} 
                onClick={() => { 
                  setActiveTab(item.id); 
                  setIsSidebarOpen(false); 
                  if (item.id === 'lista') setNotificacionesNuevas(0); 
                }} 
                title={isCollapsed ? item.label : ""}
                className={`w-full flex items-center transition-all duration-200 group relative
                  ${isCollapsed ? 'justify-center p-3.5' : 'gap-3 px-4 py-3.5'}
                  rounded-2xl font-bold uppercase tracking-wider
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 translate-x-1' 
                    : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                  }
                `}
              >
                <span className={`transition-all duration-300 ${activeTab === item.id ? 'text-[#FFD700] scale-110' : 'group-hover:scale-110 text-xl'}`}>
                  {item.icon}
                </span> 

                <span className={`flex-1 text-left text-[11px] whitespace-nowrap transition-all duration-300 
                  ${isCollapsed ? 'opacity-0 scale-0 w-0 absolute left-14' : 'opacity-100 relative'}`}>
                  {item.label}
                </span>

                {/* BADGE ROJO */}
                {item.id === 'lista' && notificacionesNuevas > 0 && (
                  <span className={`bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-red-500/50 shadow-lg 
                    ${isCollapsed ? 'absolute -top-1 -right-1' : ''}`}>
                    {notificacionesNuevas}
                  </span>
                )}

                {/* Tooltip personalizado al hover si está colapsado */}
                {isCollapsed && (
                  <div className="absolute left-16 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl border border-white/10">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className={`p-4 border-t border-slate-800/50 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase text-center">© 2026 Alturas y Riesgos de la Costa</p>
        </div>
      </aside>
    </>
  );
}