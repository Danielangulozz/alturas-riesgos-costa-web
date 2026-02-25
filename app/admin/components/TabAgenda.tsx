import React from "react";
import { FaPlus, FaCalendarAlt, FaTrash } from "react-icons/fa";

interface TabAgendaProps {
  cursoSeleccionadoParaEditar: string;
  setCursoSeleccionadoParaEditar: (val: string) => void;
  catalogoCursos: any[];
  agendaData: { fecha_inicio: string; fecha_fin: string; hora: string };
  setAgendaData: React.Dispatch<React.SetStateAction<{ fecha_inicio: string; fecha_fin: string; hora: string }>>;
  guardarEnAgenda: () => void;
  agendaBD: any[];
  borrarRegistro: (tabla: string, id: string) => void;
}

export function TabAgenda({
  cursoSeleccionadoParaEditar, setCursoSeleccionadoParaEditar, catalogoCursos,
  agendaData, setAgendaData, guardarEnAgenda, agendaBD, borrarRegistro
}: TabAgendaProps) {
  
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
              value={cursoSeleccionadoParaEditar} 
              onChange={(e) => setCursoSeleccionadoParaEditar(e.target.value)}
            >
              <option value="">Seleccione un curso...</option>
              {catalogoCursos.map(c => (
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
                value={agendaData.fecha_inicio} 
                onChange={(e) => setAgendaData({...agendaData, fecha_inicio: e.target.value})} 
              />
            </div>
            <div>
              <label htmlFor="fecha_fin" className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha Fin</label>
              <input 
                id="fecha_fin"
                name="fecha_fin"
                type="date" 
                className="w-full p-3 bg-slate-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                value={agendaData.fecha_fin} 
                onChange={(e) => setAgendaData({...agendaData, fecha_fin: e.target.value})} 
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
              value={agendaData.hora} 
              onChange={(e) => setAgendaData({...agendaData, hora: e.target.value})} 
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
        {/* ... (El resto del código de la agenda queda igual) ... */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Cursos Programados</h3>
          <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">Total: {agendaBD.length} bloques</span>
        </div>

        <div className="grid gap-3 overflow-y-auto max-h-[600px] pr-2">
          {agendaBD.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center hover:border-blue-300 transition-all group">
              <div className="flex items-center gap-4">
                <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[80px] border border-slate-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase">{item.hora}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">{item.intensidad_horaria}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{item.curso}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {item.fecha} <span className="text-blue-300 mx-1">➔</span> {item.fecha_fin}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => borrarRegistro('agenda', item.id)} 
                className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <FaTrash size={14}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}