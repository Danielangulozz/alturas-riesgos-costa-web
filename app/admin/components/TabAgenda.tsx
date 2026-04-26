import React, { useMemo, useState } from "react";
import { FaPlus, FaCalendarAlt, FaTrash, FaClock, FaList, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface TabAgendaProps {
  cursoSeleccionadoParaEditar: string;
  setCursoSeleccionadoParaEditar: (val: string) => void;
  catalogoCursos: any[];
  agendaData: any;
  setAgendaData: React.Dispatch<React.SetStateAction<any>>;
  guardarEnAgenda: () => void;
  agendaBD: any[];
  borrarRegistro: (tabla: string, id: string) => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info' | 'success') => void;
}

export function TabAgenda({
  cursoSeleccionadoParaEditar, setCursoSeleccionadoParaEditar, catalogoCursos,
  agendaData, setAgendaData, guardarEnAgenda, agendaBD, borrarRegistro, triggerConfirm
}: TabAgendaProps) {

  // --- LÓGICA DE FILTRADO, ORDENAMIENTO Y CÁLCULO DE FECHAS ---
  const agendaProcesada = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return agendaBD
      .map(item => {
        const fechaBase = item.fecha || item.fecha_inicio;
        if (!fechaBase) return null;

        const fechaInicio = new Date(`${fechaBase}T00:00:00`);
        const fechaFin = item.fecha_fin ? new Date(`${item.fecha_fin}T00:00:00`) : fechaInicio;

        const diferenciaMsInicio = fechaInicio.getTime() - hoy.getTime();
        const diasFaltantes = Math.ceil(diferenciaMsInicio / (1000 * 60 * 60 * 24));

        const diferenciaMsDuracion = fechaFin.getTime() - fechaInicio.getTime();
        const duracionDias = Math.ceil(diferenciaMsDuracion / (1000 * 60 * 60 * 24)) + 1;

        return {
          ...item,
          fechaOriginal: fechaBase,
          fechaInicioObj: fechaInicio,
          fechaFinObj: fechaFin,
          diasFaltantes,
          duracionDias
        };
      })
      .filter(item => item !== null && item.fechaFinObj >= hoy)
      .sort((a, b) => a.fechaInicioObj.getTime() - b.fechaInicioObj.getTime());

  }, [agendaBD]);

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Funciones del calendario
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Ajustar para que Lunes sea el primer día de la semana (0 = Lunes, 6 = Domingo)
  const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: startDayIndex }, (_, i) => i);

  const getEventosParaDia = (dia: number) => {
    const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return agendaBD.filter(item => {
      const inicio = new Date(`${item.fecha || item.fecha_inicio}T00:00:00`);
      const fin = new Date(`${item.fecha_fin || item.fecha || item.fecha_inicio}T00:00:00`);
      const actual = new Date(`${fechaStr}T00:00:00`);
      return actual >= inicio && actual <= fin;
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
      {/* Formulario de Creación */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 h-fit shadow-sm">
        <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-700">
          <FaPlus className="text-blue-500" /> Programar Bloque
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="curso_agenda" className="text-[10px] font-black text-slate-400 uppercase ml-1">Curso del Catálogo</label>
            <select
              id="curso_agenda"
              name="curso_agenda"
              className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={cursoSeleccionadoParaEditar || ""}
              onChange={(e) => {
                // ¡AQUÍ ESTÁ LA MAGIA! Actualizamos ambos estados a la vez.
                setCursoSeleccionadoParaEditar(e.target.value);
                setAgendaData((prev: any) => ({ ...prev, curso: e.target.value }));
              }}
            >
              <option value="">Seleccione un curso...</option>
              {catalogoCursos?.map(c => (
                <option key={c.id} value={c.nombre_curso}>{c.nombre_curso}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fecha_inicio" className="text-[10px] font-black text-blue-500 uppercase ml-1">Fecha Inicio</label>
              <input 
                id="fecha_inicio"
                name="fecha_inicio"
                type="date"
                className="w-full p-3 bg-slate-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                value={agendaData?.fecha_inicio || agendaData?.fecha || ""}
                onChange={(e) => setAgendaData((prev: any) => ({
                  ...prev,
                  fecha_inicio: e.target.value,
                  fecha: e.target.value
                }))}
              />
            </div>
            <div>
              <label htmlFor="fecha_fin" className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha Fin</label>
              <input
                id="fecha_fin"
                name="fecha_fin"
                type="date"
                className="w-full p-3 bg-slate-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                value={agendaData?.fecha_fin || ""}
                onChange={(e) => setAgendaData((prev: any) => ({
                  ...prev,
                  fecha_fin: e.target.value
                }))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="hora_agenda" className="text-[10px] font-black text-slate-400 uppercase ml-1">Hora de Ingreso</label>
            <input
              id="hora_agenda"
              name="hora_agenda"
              type="time"
              className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={agendaData?.hora || ""}
              onChange={(e) => setAgendaData((prev: any) => ({
                ...prev,
                hora: e.target.value
              }))}
            />
          </div>

          <button
            onClick={guardarEnAgenda}
            className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl font-bold shadow-lg hover:bg-blue-900 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <FaCalendarAlt /> Crear en Agenda
          </button>
        </div>
      </div>

      {/* Visualización de la Agenda */}
      <div className="md:col-span-2 flex flex-col h-full space-y-4">

        {/* HEADER AGENDA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
              {viewMode === 'calendar' ? <FaCalendarAlt className="text-blue-600" /> : <FaList className="text-blue-600" />}
              Agenda General
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold border border-blue-100">
              Total: {agendaProcesada.length} bloques activos
            </span>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FaCalendarAlt size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FaList size={14} />
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="grid gap-3 overflow-y-auto max-h-[600px] pr-2">
            {agendaProcesada.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium">No hay clases próximas programadas.</p>
              </div>
            ) : (
              agendaProcesada.map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-blue-400 hover:shadow-md transition-all group relative overflow-hidden">

                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.diasFaltantes <= 3 ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>

                  <div className="flex items-center gap-4 pl-3">
                    <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[85px] border border-slate-100 flex flex-col items-center justify-center">
                      <p className="text-[12px] font-black text-blue-700 uppercase">{item.hora}</p>
                      <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
                        <FaClock size={8} /> {item.duracionDias} {item.duracionDias === 1 ? 'Día' : 'Días'}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.curso}</p>

                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                          {item.fechaOriginal} {item.fecha_fin && item.fechaOriginal !== item.fecha_fin ? <><span className="text-slate-400 mx-1">➔</span> {item.fecha_fin}</> : null}
                        </p>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.diasFaltantes === 0 ? 'bg-rose-100 text-rose-600' :
                            item.diasFaltantes <= 3 ? 'bg-amber-100 text-amber-600' :
                              'bg-emerald-100 text-emerald-600'
                          }`}>
                          {item.diasFaltantes === 0 ? '¡Hoy!' :
                            item.diasFaltantes < 0 ? 'En curso' :
                              `En ${item.diasFaltantes} ${item.diasFaltantes === 1 ? 'día' : 'días'}`}
                        </span>
                      </div>

                    </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerConfirm(
                        "Eliminar Bloque",
                        `¿Estás seguro de eliminar el bloque de ${item.curso} el día ${item.fechaOriginal}?`,
                        () => borrarRegistro('agenda', item.id),
                        'danger'
                      );
                    }}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Eliminar bloque"
                  >
                    <FaTrash size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1 flex flex-col animate-in zoom-in-95 duration-300">
            {/* HEADER MES */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={prevMonth} className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition-colors">
                <FaChevronLeft size={14} />
              </button>
              <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                {currentDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
              </h4>
              <button onClick={nextMonth} className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition-colors">
                <FaChevronRight size={14} />
              </button>
            </div>

            {/* CALENDARIO GRID */}
            <div className="grid grid-cols-7 gap-2 text-center flex-1 h-full min-h-0">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
                <div key={dia} className="text-[10px] font-black text-slate-400 uppercase py-1">
                  {dia}
                </div>
              ))}

              {blanksArray.map(b => (
                <div key={`blank-${b}`} className="bg-slate-50/30 rounded-xl border border-transparent"></div>
              ))}

              {daysArray.map(dia => {
                const eventos = getEventosParaDia(dia);
                const esHoy = new Date().getDate() === dia && new Date().getMonth() === month && new Date().getFullYear() === year;
                const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                const isSelected = agendaData?.fecha_inicio === fechaStr;

                return (
                  <div 
                    key={dia} 
                    onClick={() => {
                        setAgendaData((prev: any) => ({
                            ...prev,
                            fecha_inicio: fechaStr,
                            fecha: fechaStr,
                            fecha_fin: fechaStr
                        }));
                    }}
                    className={`p-1.5 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer overflow-hidden ${isSelected ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)] bg-blue-50/50' : esHoy ? 'bg-blue-50/20 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <div className={`text-right text-[10px] font-black ${isSelected ? 'text-blue-600' : esHoy ? 'text-blue-500' : 'text-slate-400'}`}>
                      <span className={esHoy && !isSelected ? 'bg-blue-500 text-white w-4 h-4 inline-flex items-center justify-center rounded-full' : isSelected ? 'bg-blue-600 text-white w-4 h-4 inline-flex items-center justify-center rounded-full' : ''}>{dia}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto min-h-0 hide-scrollbar">
                      {eventos.map((ev, i) => {
                         const getCourseColor = (curso: string) => {
                             const colors = [
                                 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 
                                 'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-500'
                             ];
                             let hash = 0;
                             for (let i = 0; i < curso.length; i++) hash = curso.charCodeAt(i) + ((hash << 5) - hash);
                             return colors[Math.abs(hash) % colors.length];
                         };
                         const bgColor = getCourseColor(ev.curso || "default");
                         
                         return (
                            <div key={i} className={`${bgColor} text-white text-[8px] font-bold p-1 rounded truncate relative group`} title={`${ev.curso} (${ev.hora})`}>
                              {ev.hora} - {ev.curso}
                              <button
                                onClick={(e) => { e.stopPropagation(); borrarRegistro('agenda', ev.id); }}
                                className="absolute right-0 top-0 bottom-0 px-1.5 bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <FaTrash size={8} />
                              </button>
                            </div>
                         )
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}