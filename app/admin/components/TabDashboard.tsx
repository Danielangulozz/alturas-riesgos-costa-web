import React from "react";
import { FaShieldAlt, FaCalendarAlt, FaUsers, FaFire, FaClock, FaClipboardList, FaChartLine, FaArrowRight } from "react-icons/fa";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TabDashboardProps {
  userName: string;
  userRole: string;
  statsDashboard: any;
  logsRecientes: any[];
  setActiveTab: (tab: string) => void;
}

export function TabDashboard({
  userName,
  userRole,
  statsDashboard,
  logsRecientes,
  setActiveTab
}: TabDashboardProps) {

  // Tooltip corporativo
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-700 shadow-2xl text-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
          <p className="text-sm font-black text-[#FFD700]">
            {payload[0].value} <span className="text-slate-300 font-medium text-[10px] uppercase">Registros</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* SECCIÓN SUPERIOR: BIENVENIDA Y STATS CRÍTICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* WELCOME CARD - PROFESIONAL */}
        <div className="lg:col-span-8 bg-[#0F172A] rounded-2xl p-8 text-white relative overflow-hidden shadow-sm border border-slate-800 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 pointer-events-none">
            <FaShieldAlt size={240} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] mb-6 border border-blue-500/20 text-blue-400">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                SISTEMA OPERATIVO ACTIVO
              </div>
              <h2 className="text-3xl font-black mb-3 tracking-tight">Bienvenido, <span className="text-[#FFD700]">{userName ? userName.split(' ')[0] : 'Admin'}</span></h2>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed font-medium">
                {userRole === 'trainer' 
                  ? "Revisa tu itinerario de formación y descarga las planillas de asistencia para hoy."
                  : `Panel de control institucional. Se han detectado ${statsDashboard.solicitudesPendientes} trámites administrativos pendientes en la cola de gestión.`
                }
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button 
                onClick={() => setActiveTab('listados')} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 active:scale-95"
              >
                Calendario de Operaciones <FaArrowRight size={10} />
              </button>
              <button 
                onClick={() => setActiveTab('config')} 
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-700 active:scale-95"
              >
                Configuración del Sistema
              </button>
            </div>
          </div>
        </div>

        {/* INDICADORES RÁPIDOS - PROFESIONAL */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Alumnos Total */}
          <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-500/30 transition-all animate-in fade-in slide-in-from-right-4 duration-500 delay-100 group">
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FaUsers size={18}/>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiantes</span>
            </div>
            <div className="mt-auto">
              <span className="text-4xl font-black text-slate-900 tracking-tighter block">{statsDashboard.totalAlumnos}</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Base de Datos General</p>
            </div>
          </div>

          {/*Logs / Auditoría */}
          <div 
            onClick={() => setActiveTab('logs')}
            className="flex-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-amber-500/30 transition-all cursor-pointer animate-in fade-in slide-in-from-right-4 duration-500 delay-200 group"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <FaFire size={18}/>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditoría</span>
            </div>
            <div>
              <span className="text-4xl font-black text-slate-900 tracking-tighter block">{statsDashboard.cambiosHoy || logsRecientes.length}</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Incidencias hoy</p>
              <span className="text-[9px] font-bold text-amber-600 mt-2 block group-hover:translate-x-1 transition-transform tracking-widest">CONSULTAR LOGS →</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INTERMEDIA: GRÁFICA Y SOLICITUDES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRÁFICA PROFESIONAL */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><FaChartLine className="text-blue-600"/> Seguimiento de Matrículas</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest leading-none">Análisis histórico mensual</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" /> Inscritos
               </div>
            </div>
          </div>
          
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsDashboard.historialInscripciones || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInscritos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="mes" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="inscritos" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorInscritos)" 
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#2563EB' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SOLICITUDES - TIPO DASHBOARD */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100"><FaClipboardList size={16}/></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestión Comercial</span>
            </div>
            <h3 className="text-6xl font-black text-slate-900 tracking-tighter mb-2">{statsDashboard.solicitudesPendientes}</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Solicitudes Web en espera de resolución <span className="text-emerald-600">activa</span>.</p>
          </div>
          
          <button 
            onClick={() => setActiveTab('solicitudes')} 
            className="w-full py-4 mt-8 bg-slate-900 hover:bg-[#FFD700] text-white hover:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 group"
          >
            Atender Solicitudes <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: CALENDARIO RESUMIDO */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><FaClock className="text-blue-600"/> Itinerario de Entrenamientos</h3>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">Fase de Operación</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsDashboard.proximosCursos?.length > 0 ? (
            statsDashboard.proximosCursos.slice(0, 3).map((curso:any) => (
              <div key={curso.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                <div className="bg-white px-3 py-2 rounded-lg text-center shadow-sm min-w-[65px] border border-slate-100 group-hover:bg-blue-600 transition-colors">
                  <span className="block text-[9px] font-black text-blue-600 uppercase group-hover:text-white">{new Date(curso.fecha).toLocaleDateString('es-ES', {month:'short'})}</span>
                  <span className="block text-xl font-black text-slate-800 leading-none mt-1 group-hover:text-white font-mono">{new Date(curso.fecha).getDate()+1}</span>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-tight">{curso.curso}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                       <FaClock size={8}/> {curso.hora}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                       {curso.intensidad_horaria}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No hay operaciones programadas para este ciclo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}