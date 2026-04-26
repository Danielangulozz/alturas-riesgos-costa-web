import React from "react";
import * as htmlToImage from 'html-to-image';
import { FaShieldAlt, FaCalendarAlt, FaUsers, FaFire, FaClock, FaClipboardList, FaChartLine, FaArrowRight, FaExclamationTriangle, FaWhatsapp } from "react-icons/fa";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

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

  if (userRole !== 'admin_general' && userRole !== 'developer') return null;

  // Función para descargar gráficas como PNG usando html-to-image (más moderno y soporta nuevos colores CSS)
  const downloadPNG = async (id: string, fileName: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    // Ocultar temporalmente los botones de descarga
    const buttons = element.querySelectorAll('.download-btn');
    buttons.forEach((b: any) => b.style.opacity = '0');

    try {
      // Usamos toPng de html-to-image
      const dataUrl = await htmlToImage.toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al exportar gráfica:", err);
    } finally {
      // Restaurar visibilidad de botones
      buttons.forEach((b: any) => b.style.opacity = '');
    }
  };

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
                Panel de control institucional. Se han detectado {statsDashboard.solicitudesPendientes} trámites administrativos pendientes en la cola de gestión.
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
                <FaUsers size={18} />
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
                <FaFire size={18} />
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
        <div id="card-matriculas" className="lg:col-span-8 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><FaChartLine className="text-blue-600" /> Seguimiento de Matrículas</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest leading-none">Análisis histórico mensual</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadPNG('card-matriculas', 'seguimiento_matriculas')}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-slate-200 download-btn"
                title="Descargar Gráfica"
              >
                <FaChartLine size={12} />
              </button>
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
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
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
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100"><FaClipboardList size={16} /></span>
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

      {/* SECCIÓN DE ANALÍTICA AVANZADA: COMPARATIVA Y DISTRIBUCIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">

        {/* GRÁFICA DE BARRAS: PRODUCTIVIDAD */}
        <div id="card-rendimiento" className="lg:col-span-7 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><FaChartLine className="text-blue-600" /> Rendimiento Operativo</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest leading-none">Matrículas vs Certificaciones</p>
            </div>
            <button
              onClick={() => downloadPNG('card-rendimiento', 'rendimiento_operativo')}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-slate-200 download-btn"
              title="Descargar Gráfica"
            >
              <FaChartLine size={12} />
            </button>
          </div>

          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsDashboard.comparativaMensual || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Bar dataKey="inscritos" name="Inscritos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="certificados" name="Certificados" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICA DE PIE: DISTRIBUCIÓN DE CURSOS */}
        <div id="card-distribucion" className="lg:col-span-5 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">Distribución de Cursos</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest leading-none">Top 5 Cursos más demandados</p>
            </div>
            <button
              onClick={() => downloadPNG('card-distribucion', 'distribucion_cursos')}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-slate-200 download-btn"
              title="Descargar Gráfica"
            >
              <FaChartLine size={12} />
            </button>
          </div>

          <div className="w-full h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsDashboard.distribucionCursos || []}
                  cx="30%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1000}
                >
                  {(statsDashboard.distribucionCursos || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Leyenda manual - Reposicionada arriba a la derecha y más alejada */}
            <div className="absolute top-0 right-0 w-[45%] flex flex-col gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100 backdrop-blur-sm pointer-events-none">
              {statsDashboard.distribucionCursos?.slice(0, 5).map((c: any, i: number) => (
                <div key={i} className="flex items-start gap-2 py-1">
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1 shadow-sm" style={{ backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][i % 5] }} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-black text-slate-700 uppercase leading-tight line-clamp-2">{c.name}</span>
                    <span className="text-[7px] font-bold text-slate-400 mt-0.5">{c.value} Alumnos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: CALENDARIO RESUMIDO */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><FaClock className="text-blue-600" /> Itinerario de Entrenamientos</h3>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">Fase de Operación</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsDashboard.proximosCursos?.length > 0 ? (
            statsDashboard.proximosCursos.slice(0, 3).map((curso: any) => (
              <div key={curso.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                <div className="bg-white px-3 py-2 rounded-lg text-center shadow-sm min-w-[65px] border border-slate-100 group-hover:bg-blue-600 transition-colors">
                  <span className="block text-[9px] font-black text-blue-600 uppercase group-hover:text-white">{new Date(curso.fecha).toLocaleDateString('es-ES', { month: 'short' })}</span>
                  <span className="block text-xl font-black text-slate-800 leading-none mt-1 group-hover:text-white font-mono">{new Date(curso.fecha).getDate() + 1}</span>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-tight">{curso.curso}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
                      <FaClock size={8} /> {curso.hora}
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

      {/* SECCIÓN INFERIOR: REENTRENAMIENTO (POR VENCER) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
        <div className="flex items-center justify-between mb-6 border-b border-amber-200/50 pb-4">
          <div>
            <h3 className="text-sm font-black text-amber-900 flex items-center gap-2 uppercase tracking-widest">
              <FaExclamationTriangle className="text-amber-500" /> Próximos Vencimientos (30 días)
            </h3>
            <p className="text-[10px] text-amber-700/70 font-bold uppercase mt-1 tracking-widest leading-none">
              Oportunidad de Reentrenamiento Automático
            </p>
          </div>
          <span className="text-[10px] font-black text-white bg-amber-500 px-3 py-1.5 rounded-lg shadow-sm">
            {statsDashboard.estudiantesPorVencer?.length || 0} ALUMNOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsDashboard.estudiantesPorVencer?.length > 0 ? (
            statsDashboard.estudiantesPorVencer.map((est: any) => (
              <div key={est.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all">
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-slate-800 uppercase truncate">{est.nombre}</p>
                  <p className="text-[10px] font-bold text-amber-600 mt-0.5">
                    Vence: {new Date(est.certificado_fecha_vencimiento).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <a
                  href={`https://wa.me/57${est.telefono}?text=Hola%20${encodeURIComponent(est.nombre)},%20te%20recordamos%20que%20tu%20certificado%20de%20alturas%20está%20pronto%20a%20vencer.%20¡Agenda%20tu%20reentrenamiento%20con%20nosotros!`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-100 hover:bg-emerald-500 text-emerald-600 hover:text-white p-2.5 rounded-lg transition-colors"
                  title="Contactar para Reentrenamiento"
                >
                  <FaWhatsapp size={14} />
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-full py-6 text-center">
              <p className="text-[10px] text-amber-600/60 font-bold uppercase tracking-widest">No hay certificados por vencer este mes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
