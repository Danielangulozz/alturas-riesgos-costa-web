import React, { useMemo } from "react";
import { FaPlus, FaCalendarAlt, FaTrash, FaClock } from "react-icons/fa";

interface TabAgendaProps {
  cursoSeleccionadoParaEditar: string;
  setCursoSeleccionadoParaEditar: (val: string) => void;
  catalogoCursos: any[];
  agendaData: any; 
  setAgendaData: React.Dispatch<React.SetStateAction<any>>;
  guardarEnAgenda: () => void;
  agendaBD: any[];
  borrarRegistro: (tabla: string, id: string) => void;
}

export function TabAgenda({
  cursoSeleccionadoParaEditar, setCursoSeleccionadoParaEditar, catalogoCursos,
  agendaData, setAgendaData, guardarEnAgenda, agendaBD, borrarRegistro
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

  return (
    <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
      {/* Formulario de Creación */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 h-fit shadow-sm">
        <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-700">
          <FaPlus className="text-blue-500"/> Programar Bloque
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
              <label htmlFor="fecha_inicio" className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha Inicio</label>
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
            <FaCalendarAlt/> Crear en Agenda
          </button>
        </div>
      </div>

      {/* Visualización de la Agenda */}
      <div className="md:col-span-2 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Cursos Próximos</h3>
          <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">Total: {agendaProcesada.length} bloques</span>
        </div>

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
                      <FaClock size={8}/> {item.duracionDias} {item.duracionDias === 1 ? 'Día' : 'Días'}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.curso}</p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                        {item.fechaOriginal} {item.fecha_fin && item.fechaOriginal !== item.fecha_fin ? <><span className="text-slate-400 mx-1">➔</span> {item.fecha_fin}</> : null}
                      </p>
                      
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.diasFaltantes === 0 ? 'bg-rose-100 text-rose-600' : 
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
                  onClick={() => borrarRegistro('agenda', item.id)} 
                  className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Eliminar bloque"
                >
                  <FaTrash size={15}/>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}