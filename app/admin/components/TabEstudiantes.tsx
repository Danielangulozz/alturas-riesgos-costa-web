import React, { useState, useEffect } from "react";
import { FaUserPlus, FaCheckCircle, FaInfoCircle, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";

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
  const MUNICIPIOS_SUCRE = [
    "Sincelejo", "Buenavista", "Caimito", "Chalán", "Colosó", "Corozal", "Coveñas", "El Roble",
    "Galeras", "Guaranda", "La Unión", "Los Palmitos", "Majagual", "Morroa", "Ovejas", "Palmito",
    "Sampués", "San Benito Abad", "San Juan de Betulia", "San Marcos", "San Onofre", "San Pedro",
    "Sincé", "Sucre", "Tolú", "Toluviejo"
  ].sort();

  const BARRIOS_SINCELEJO = [
    "La Sabana", "Centro", "Chochó", "Majagual", "Florencia", "La Palma", "Las Peñitas", "El Cortijo", "El Bosque",
    "Pioneros", "Los Alpes", "Las Margaritas", "Boston", "San Vicente", "Camilo Torres", "El Cauca", "La María",
    "El Edén", "San Luis", "Bitar", "La Bucaramanga", "San Antonio", "Cielo Azul", "El Progreso", "La Fe",
    "La Pollita", "Mochila", "Los Libertadores", "Las Colinas", "Uribe Uribe"
  ].sort();

  useEffect(() => {
    // Component mounted
  }, []);

  const inputCls = "w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition-all text-[13px] font-medium placeholder:text-slate-400";
  const labelCls = "text-[10px] font-black text-slate-500 ml-1 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* CABECERA TÉCNICA */}
      <div className="flex items-center justify-between bg-white px-8 py-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#0F172A] text-white rounded-lg flex items-center justify-center">
            <FaUserPlus size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Registro de Matrícula</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Procedimiento de alta manual de estudiantes</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
          <FaInfoCircle className="text-blue-500" size={12} />
          <span className="text-[9px] font-bold text-blue-700 uppercase tracking-widest">Campos obligatorios marcados con *</span>
        </div>
      </div>

      <form onSubmit={registrarEstudiante} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUMNA IZQUIERDA: DATOS PERSONALES Y CONTACTO */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. SELECCIÓN DE ORIGEN / TIPO */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <label className={labelCls}>Naturaleza del Cliente / Financiación *</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "Independiente", label: "Independiente", icon: <FaUserPlus size={12} /> },
                { id: "Empresa", label: "Empresa / Corporativo", icon: <FaBriefcase size={12} /> },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo_cliente: opt.id })}
                  className={`flex items-center justify-center gap-3 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all ${(formData.tipo_cliente || "Independiente") === opt.id
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md"
                    : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. DATOS DE IDENTIDAD */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em]">Información de Identidad</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label htmlFor="nombre" className={labelCls}>Nombres y Apellidos *</label>
                <input id="nombre" name="nombre" required placeholder="Nombre completo del estudiante" className={inputCls} value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label htmlFor="cedula" className={labelCls}>Documento de Identidad *</label>
                <input id="cedula" name="cedula" required placeholder="Número de cédula" className={inputCls} value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label htmlFor="fecha_nacimiento" className={labelCls}>Fecha de Nacimiento *</label>
                <input id="fecha_nacimiento" name="fecha_nacimiento" required type="date" className={inputCls} value={formData.fecha_nacimiento} onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label htmlFor="sexo" className={labelCls}>Sexo / Género *</label>
                <select id="sexo" name="sexo" required className={inputCls} value={formData.sexo} onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}>
                  <option value="">Seleccione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. UBICACIÓN Y CONTACTO */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full" />
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em]">Contacto y Residencia</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label htmlFor="email" className={labelCls}>Email Corporativo / Personal *</label>
                <input id="email" name="email" required type="email" placeholder="correo@academia.com" className={inputCls} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label htmlFor="telefono" className={labelCls}>Línea Móvil / WhatsApp *</label>
                <input id="telefono" name="telefono" required placeholder="3XX XXX XXXX" className={inputCls} value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
              </div>

              <div className="space-y-1">
                <label htmlFor="ciudad_residencia" className={labelCls}>Ciudad / Dirección de Residencia *</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input list="municipios-sucre-admin" id="ciudad_residencia" name="ciudad_residencia" required placeholder="Ej: Sincelejo" className={`${inputCls} pl-8`} value={formData.ciudad_residencia} onChange={(e) => setFormData({ ...formData, ciudad_residencia: e.target.value })} />
                  <datalist id="municipios-sucre-admin">
                    {MUNICIPIOS_SUCRE.map(m => <option key={m} value={m} />)}
                  </datalist>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="barrio" className={labelCls}>Barrio / Localidad</label>
                <input list="barrios-sincelejo-admin" id="barrio" name="barrio" placeholder="Ej: La Sabana" className={inputCls} value={formData.barrio} onChange={(e) => setFormData({ ...formData, barrio: e.target.value })} />
                <datalist id="barrios-sincelejo-admin">
                  {BARRIOS_SINCELEJO.map(b => <option key={b} value={b} />)}
                </datalist>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PARAMETRIZACIÓN DEL CURSO Y FINANZAS */}
        <div className="lg:col-span-4 space-y-6">

          {/* 4. PARAMETRIZACIÓN ACADÉMICA */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6 border-l-2 border-[#FFD700] pl-3">Parametrización Académica</h4>

            <div className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="curso" className={labelCls}>Programa de Formación *</label>
                <select
                  id="curso"
                  name="curso"
                  required
                  className={`${inputCls} font-bold text-blue-700 bg-blue-50 border-blue-100`}
                  value={cursoSeleccionadoParaEditar}
                  onChange={(e) => {
                    setCursoSeleccionadoParaEditar(e.target.value);
                    setFormData({ ...formData, curso: e.target.value });
                  }}
                >
                  <option value="">Seleccione el curso...</option>
                  {catalogoCursos.map((c: any) => (
                    <option key={c.id} value={c.nombre_curso}>{c.nombre_curso}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="horario_preferencia" className={labelCls}>Jornada de Preferencia</label>
                <select id="horario_preferencia" name="horario_preferencia" className={inputCls} value={formData.horario_preferencia} onChange={(e) => setFormData({ ...formData, horario_preferencia: e.target.value })}>
                  <option value="">Seleccione jornada</option>
                  <option value="Mañana (7:00 AM)">Mañana (7:00 AM)</option>
                  <option value="Tarde (1:00 PM)">Tarde (1:00 PM)</option>
                  <option value="Jornada Completa">Jornada Completa</option>
                </select>
              </div>
            </div>

            {formData.tipo_cliente === "Empresa" && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 animate-in zoom-in duration-300 space-y-4">
                <div className="space-y-1">
                  <label htmlFor="empresa" className={labelCls}>Razón Social *</label>
                  <input id="empresa" name="empresa" required placeholder="Nombre de la empresa" className={inputCls} value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="nit" className={labelCls}>NIT / RUT *</label>
                  <input id="nit" name="nit" required placeholder="Identificación tributaria" className={inputCls} value={formData.nit} onChange={(e) => setFormData({ ...formData, nit: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          {/* 5. FINANZAS Y CIERRE */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 border-l-2 border-slate-800 pl-3">Estado Financiero</h4>

            <div className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="estado_pago" className={labelCls}>Situación de Pago</label>
                <div className="flex gap-2">
                  {['Pendiente', 'Pagado'].map(state => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => setFormData({ ...formData, estado_pago: state })}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${formData.estado_pago === state
                        ? (state === 'Pagado' ? "bg-emerald-600 text-white border-emerald-600" : "bg-amber-500 text-white border-amber-500")
                        : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="precio_pactado" className={labelCls}>Valor Pactado (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400 text-[12px]">$</span>
                  <input id="precio_pactado" name="precio_pactado" placeholder="Dejar vacío para tarifa base" className={`${inputCls} pl-7 font-black text-slate-800 text-sm`} value={formData.precio_pactado} onChange={(e) => setFormData({ ...formData, precio_pactado: e.target.value })} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#0F172A] hover:bg-[#1E293B] text-[#FFD700] rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              Registrar
              <FaCheckCircle size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}