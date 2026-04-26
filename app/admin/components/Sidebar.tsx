import React from "react";
import {
  FaClipboardList, FaCalendarAlt, FaUserPlus, FaUsers, FaUserCheck,
  FaUserCog, FaHistory, FaMoneyBillWave, FaUser, FaChevronLeft, FaChevronRight, FaChartPie, FaQuestionCircle, FaBug
} from "react-icons/fa";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  notifLista: number;
  setNotifLista: (count: number) => void;
  notifTickets: number;
  setNotifTickets: (count: number) => void;
  notifSolicitudes: number;
  setNotifSolicitudes: (count: number) => void;
  userRole: string;
}

export function Sidebar({
  activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen,
  isCollapsed, setIsCollapsed,
  notifLista, setNotifLista,
  notifTickets, setNotifTickets,
  notifSolicitudes, setNotifSolicitudes,
  userRole
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: <FaChartPie />, label: 'Panel Principal', roles: ['admin_general', 'developer'] },
    { id: 'solicitudes', icon: <FaClipboardList />, label: 'Solicitudes Web', roles: ['admin_general', 'developer', 'director'] },
    { id: 'agenda', icon: <FaCalendarAlt />, label: 'Calendario / Agenda', roles: ['admin_general', 'developer', 'director', 'coordinator'] },
    { id: 'estudiantes', icon: <FaUserPlus />, label: 'Matricular Nuevo', roles: ['admin_general', 'developer', 'director', 'coordinator', 'trainer'] },
    { id: 'lista', icon: <FaUsers />, label: 'Base de Datos', roles: ['admin_general', 'developer', 'director', 'coordinator'] },
    { id: 'listados', icon: <FaUserCheck />, label: 'Planillas de Clase', roles: ['admin_general', 'developer', 'director', 'coordinator', 'trainer'] },
    { id: 'equipo', icon: <FaUserCog />, label: 'Gestionar Equipo', roles: ['admin_general', 'developer', 'director'] },
    { id: 'logs', icon: <FaHistory />, label: 'Auditoría / Logs', roles: ['admin_general', 'developer', 'director'] },
    { id: 'precios', icon: <FaMoneyBillWave />, label: 'Precios Cursos', roles: ['admin_general', 'developer', 'director'] },
    { id: 'tickets', icon: <FaBug />, label: 'Soporte Dev', roles: ['admin_general', 'developer'] },
    { id: 'config', icon: <FaUser />, label: 'Mi Perfil', roles: ['admin_general', 'developer', 'director', 'coordinator', 'trainer'] },
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
        lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-2xl flex-shrink-0 border-r border-slate-800/50
        ${isCollapsed ? "lg:w-20" : "lg:w-72 w-80"}
        overflow-hidden
      `}>
        {/* EFECTOS DE FONDO CORPORATIVOS (Igual que el login) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* LOGO ARC CORPORATIVO */}
        <div className="relative p-6 border-b border-white/5 flex flex-col items-center shrink-0 z-10">
          <div className="cursor-pointer flex items-center gap-3 w-full" onClick={() => setActiveTab('dashboard')}>
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-slate-400 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity" />
              <img
                src="/LOGOSOLO.png"
                alt="ARC"
                className={`transition-all duration-300 object-contain drop-shadow-xl ${isCollapsed ? 'w-10 h-10 mx-auto' : 'w-12 h-12'}`}
              />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col animate-in slide-in-from-left-4 duration-300">
                <h1 className="text-white font-black text-lg tracking-widest leading-tight uppercase">
                  <span className="text-slate-400">ARC</span> SYSTEM
                </h1>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] -mt-0.5">
                  by Alturas y Riesgos
                </p>
              </div>
            )}
          </div>

          {/* Botón Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-[#1e293b] text-slate-400 w-6 h-6 rounded-full items-center justify-center border border-white/10 shadow-xl hover:text-white hover:bg-slate-600 transition-all z-20"
          >
            {isCollapsed ? <FaChevronRight size={8} /> : <FaChevronLeft size={8} />}
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden hide-scrollbar relative z-10">
          <div className="space-y-1">
            {menuItems.filter(item => item.roles.includes(userRole)).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                  if (item.id === 'lista') setNotifLista(0);
                  if (item.id === 'solicitudes') setNotifSolicitudes(0);
                  if (item.id === 'tickets') setNotifTickets(0);
                }}
                className={`
                  w-full flex items-center transition-all duration-200 relative group
                  ${isCollapsed ? "justify-center px-0 py-3" : "px-4 py-3"}
                  ${activeTab === item.id
                    ? "text-white bg-white/10 rounded-xl"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] rounded-xl"}
                `}
              >
                {/* Indicador lateral activo */}
                {activeTab === item.id && (
                  <div className={`absolute left-0 w-1 h-6 bg-slate-400 rounded-r-full shadow-[0_0_10px_rgba(148,163,184,0.5)] transition-all`} />
                )}

                <span className={`transition-all duration-300 ${activeTab === item.id ? 'text-blue-400 scale-110' : 'group-hover:text-slate-300 text-lg'}`}>
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className={`ml-4 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.label}
                  </span>
                )}

                {/* Badge para Base de Datos */}
                {item.id === 'lista' && notifLista > 0 && (
                  <span className={`bg-amber-500/20 text-amber-500 text-[10px] font-black px-1.5 py-0.5 rounded-lg border border-amber-500/20 absolute 
                    ${isCollapsed ? '-top-1 -right-1' : 'right-4 animate-pulse'}`}>
                    {notifLista}
                  </span>
                )}

                {/* Badge para Solicitudes */}
                {item.id === 'solicitudes' && notifSolicitudes > 0 && (
                  <span className={`bg-purple-500/20 text-purple-400 text-[10px] font-black px-1.5 py-0.5 rounded-lg border border-purple-500/20 absolute 
                    ${isCollapsed ? '-top-1 -right-1' : 'right-4 animate-pulse'}`}>
                    {notifSolicitudes}
                  </span>
                )}

                {/* Badge para Tickets */}
                {item.id === 'tickets' && notifTickets > 0 && (
                  <span className={`bg-red-500/20 text-red-500 text-[10px] font-black px-1.5 py-0.5 rounded-lg border border-red-500/20 absolute 
                    ${isCollapsed ? '-top-1 -right-1' : 'right-4 animate-pulse'}`}>
                    {notifTickets}
                  </span>
                )}

                {/* Tooltip para colapsado */}
                {isCollapsed && (
                  <div className="absolute left-16 px-4 py-2 bg-[#1e293b] text-white text-[10px] font-black rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-2xl border border-white/10 translate-x-2 group-hover:translate-x-0">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* FOOTER DEL SIDEBAR (ESTATUS DE CONEXIÓN) */}
        {!isCollapsed && (
          <div className="p-6 border-t border-white/5 relative z-10">
            <div className="flex flex-col gap-1 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Base de Datos</span>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">Cloud SQL / Realtime</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">En Línea</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[8px] text-slate-700 font-bold tracking-[0.2em] uppercase text-center opacity-40">ARC System v2.4.1</p>
          </div>
        )}
      </aside>
    </>
  );
}
