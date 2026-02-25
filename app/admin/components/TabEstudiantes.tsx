import React from "react";
import { FaUserPlus } from "react-icons/fa";

interface TabEstudiantesProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  registrarEstudiante: (e: React.FormEvent) => void;
  cursoSeleccionadoParaEditar: string;
  setCursoSeleccionadoParaEditar: (val: string) => void;
  catalogoCursos: any[];
}

export function TabEstudiantes({
  formData, setFormData, registrarEstudiante,
  cursoSeleccionadoParaEditar, setCursoSeleccionadoParaEditar, catalogoCursos
}: TabEstudiantesProps) {
  
  return (
    <div className="max-w-4xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mx-auto animate-in fade-in">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaUserPlus className="text-blue-600"/> Matriculación Manual
      </h3>
      <form onSubmit={registrarEstudiante} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Agregado "input", "id" y "name" */}
        <input id="nombre" name="nombre" required placeholder="Nombre Completo" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.nombre} onChange={(e)=>setFormData({...formData, nombre: e.target.value})} />
        <input id="cedula" name="cedula" required placeholder="Cédula" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.cedula} onChange={(e)=>setFormData({...formData, cedula: e.target.value})} />
        
        <div className="flex flex-col gap-1">
          <label htmlFor="fecha_nacimiento" className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Fecha de Nacimiento</label>
          <input id="fecha_nacimiento" name="fecha_nacimiento" required type="date" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.fecha_nacimiento} onChange={(e)=>setFormData({...formData, fecha_nacimiento: e.target.value})} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="sexo" className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Género</label>
          <select id="sexo" name="sexo" required className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" value={formData.sexo} onChange={(e)=>setFormData({...formData, sexo: e.target.value})}>
            <option value="">Seleccione Género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <input id="email" name="email" required type="email" placeholder="Correo Electrónico" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} />
        <input id="telefono" name="telefono" required placeholder="WhatsApp (Ej: 3001234567)" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.telefono} onChange={(e)=>setFormData({...formData, telefono: e.target.value})} />

        <div className="flex flex-col gap-1">
          <label htmlFor="horario_preferencia" className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Horario de Preferencia</label>
          <select id="horario_preferencia" name="horario_preferencia" required className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" value={formData.horario_preferencia} onChange={(e)=>setFormData({...formData, horario_preferencia: e.target.value})}>
            <option value="">Seleccione Horario</option>
            <option value="Mañana (7:00 AM)">Mañana (7:00 AM)</option>
            <option value="Tarde (1:00 PM)">Tarde (1:00 PM)</option>
          </select>
        </div>

        <select 
          id="curso"
          name="curso"
          required
          className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-bold mt-5" 
          value={cursoSeleccionadoParaEditar} 
          onChange={(e) => {
            setCursoSeleccionadoParaEditar(e.target.value);
            setFormData({...formData, curso: e.target.value});
          }}
        >
          <option value="">Seleccione el curso...</option>
          {catalogoCursos.map(c => (
            <option key={c.id} value={c.nombre_curso}>{c.nombre_curso}</option>
          ))}
        </select>

        <input id="ciudad_residencia" name="ciudad_residencia" placeholder="CIUDAD o DIRECCIÓN" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.ciudad_residencia} onChange={(e)=>setFormData({...formData, ciudad_residencia: e.target.value})} />
        <input id="barrio" name="barrio" placeholder="Barrio" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.barrio} onChange={(e)=>setFormData({...formData, barrio: e.target.value})} />

        <input id="empresa" name="empresa" placeholder="Empresa (Opcional)" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.empresa} onChange={(e)=>setFormData({...formData, empresa: e.target.value})} />
        <input id="nit" name="nit" placeholder="NIT Empresa" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.nit} onChange={(e)=>setFormData({...formData, nit: e.target.value})} />

        <div className="md:col-span-2">
          <label htmlFor="estadoPago" className="text-[10px] font-bold text-slate-400 uppercase ml-1">Estado inicial de pago</label>
          <select id="estadoPago" name="estadoPago" className="w-full p-3 bg-slate-50 border rounded-xl outline-none mt-1" value={formData.estadoPago} onChange={(e)=>setFormData({...formData, estadoPago: e.target.value})}>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
          </select>
        </div>

        <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg uppercase tracking-widest mt-4">
          Realizar Pre-Inscripción Directa
        </button>
      </form>
    </div>
  );
}