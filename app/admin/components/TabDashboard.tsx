import React from "react";
import { FaShieldAlt, FaCalendarAlt, FaUsers, FaFire, FaClock, FaClipboardList, FaChartLine } from "react-icons/fa";
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

  // Tooltip personalizado para que combine con el diseño
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{label}</p>
          <p className="text-sm font-bold text-blue-600">
            {payload[0].value} <span className="text-slate-600 font-medium text-xs">estudiantes</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-300 mb-8">
      
      {/* 1. BIENVENIDA */}
      <div className="md:col-span-2 bg-gradient-to-r from-blue-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><FaShieldAlt size={180} /></div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20">👋 Hola de nuevo</span>
          <h2 className="text-3xl font-black mb-2">Bienvenido, {userName ? userName.split(' ')[0] : ''}</h2>
          
          <p className="text-blue-200 text-sm max-w-sm leading-relaxed">
            {userRole === 'trainer' 
              ? "Aquí tienes tu programación de entrenamientos. Revisa tu agenda y prepárate para la próxima clase."
              : `Resumen general de la academia. Tienes ${statsDashboard.solicitudesPendientes} solicitudes web esperando gestión.`
            }
          </p>

          <button onClick={() => setActiveTab('listados')} className="mt-6 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase hover:bg-blue-50 transition shadow-lg flex items-center gap-2">
            <FaCalendarAlt /> Ver Calendario Completo
          </button>
        </div>
      </div>

      {/* 2. ESTADÍSTICAS RÁPIDAS */}
      {userRole !== 'trainer' && (
        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FaUsers size={20}/></div>
            <span className="text-[10px] font-black uppercase text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">Total</span>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{statsDashboard.totalAlumnos}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Alumnos en Base de Datos</p>
          </div>
        </div>
      )}

      {/* 3. NOTIFICACIONES LOGS */}
      {['admin_general', 'director'].includes(userRole) && (
        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden hover:border-purple-200 transition-all cursor-pointer" onClick={() => setActiveTab('logs')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="flex items-start justify-between relative z-10">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><FaFire size={20}/></div>
            {statsDashboard.cambiosHoy > 0 && (
              <span className="text-[10px] font-black uppercase text-white bg-red-500 px-2 py-1 rounded-lg animate-pulse shadow-red-200 shadow-lg">
                +{statsDashboard.cambiosHoy} Nuevos hoy
              </span>
            )}
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{logsRecientes.length}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Movimientos Recientes</p>
            <span className="text-[10px] font-bold text-purple-600 mt-2 hover:underline block">Ver historial →</span>
          </div>
        </div>
      )}


      {/* 4. PRÓXIMAS CLASES */}
      <div className={`bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm ${userRole === 'trainer' ? 'md:col-span-4' : 'md:col-span-2'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><FaClock className="text-blue-500"/> Próximos Entrenamientos</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Agenda Cercana</span>
        </div>
        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
          {statsDashboard.proximosCursos?.length > 0 ? (
            statsDashboard.proximosCursos.map((curso:any) => (
              <div key={curso.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="bg-white p-3 rounded-xl text-center shadow-sm min-w-[70px]">
                  <span className="block text-[10px] font-black text-blue-600 uppercase">{new Date(curso.fecha).toLocaleDateString('es-ES', {month:'short'})}</span>
                  <span className="block text-xl font-black text-slate-800 leading-none">{new Date(curso.fecha).getDate()+1}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">{curso.curso}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                    <FaClock size={10}/> {curso.hora} 
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
                    {curso.intensidad_horaria}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 italic">No hay cursos programados para los próximos días.</p>
          )}
        </div>
      </div>

      {/* 5. ACCESO DIRECTO SOLICITUDES */}
      {userRole !== 'trainer' && (
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-white rounded-[2.5rem] p-8 border border-emerald-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FaClipboardList size={16}/></span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Solicitudes Web</span>
          </div>
          <h3 className="text-5xl font-black text-slate-800 mb-2">{statsDashboard.solicitudesPendientes}</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">Personas esperando respuesta para inscribirse.</p>
          
          <button onClick={() => setActiveTab('solicitudes')} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition active:scale-95">
            Gestionar Solicitudes Ahora
          </button>
        </div>
      )}

            {/* --- NUEVO: GRÁFICA DE CRECIMIENTO --- */}
      {userRole !== 'trainer' && (
        <div className="md:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><FaChartLine className="text-blue-500"/> Evolución de Inscripciones</h3>
              <p className="text-xs text-slate-400 mt-1">Crecimiento de estudiantes a lo largo del tiempo</p>
            </div>
          </div>
          
          {/* Contenedor de Recharts */}
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              {/* AQUÍ ESTÁ LA MAGIA: Le pasamos los datos reales desde statsDashboard */}
              <AreaChart data={statsDashboard.historialInscripciones || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInscritos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="mes" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="inscritos" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorInscritos)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#1E3A8A' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}