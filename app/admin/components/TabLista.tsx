import React from "react";
import { 
  FaSync, FaBuilding, FaUser, FaIdCard, FaMapMarkerAlt, 
  FaCheckCircle, FaEnvelope, FaTrash, FaShieldVirus 
} from "react-icons/fa";
import { obtenerRequeridos, getDocUrl } from "../utils/documentos";
import { formatFechaElegante } from "../utils/formatters";
import { DocButton } from "./DocButton";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';
import { FaFileExcel } from 'react-icons/fa'; // Asegúrate de importar el ícono

interface TabListaProps {
  busqueda: string;
  setBusqueda: (val: string) => void;
  fetchData: (manual?: boolean) => void;
  isRefreshing: boolean;
  listaUnificada: any[];
  agendaBD: any[];
  toggleVerificacion: (item: any, docId: string, docLabel: string) => void;
  actualizarEstadoEstudiante: (tabla: string, id: string, campo: string, valor: string, nombreEst: string) => void;
  generarReporte: (est: any) => void;
  borrarRegistro: (tabla: string, id: string) => void;
  modalARL: { isOpen: boolean; item: any };
  setModalARL: React.Dispatch<React.SetStateAction<{ isOpen: boolean; item: any }>>;
  datosARL: { nombre: string; nit: string };
  setDatosARL: React.Dispatch<React.SetStateAction<{ nombre: string; nit: string }>>;
  ejecutarCambioEstado: (item: any, docId: string, docLabel: string, newState: string) => void;
}

export function TabLista({
  busqueda, setBusqueda, fetchData, isRefreshing, listaUnificada, agendaBD,
  toggleVerificacion, actualizarEstadoEstudiante, generarReporte, borrarRegistro,
  modalARL, setModalARL, datosARL, setDatosARL, ejecutarCambioEstado
}: TabListaProps) {

  const exportarAExcel = () => {
    if (listaUnificada.length === 0) return toast.error("No hay datos para exportar");

    const toastId = toast.loading("Generando archivo Excel...");

    try {
      // 1. Mapear y limpiar los datos para Excel
      const datosExcel = listaUnificada.map(est => ({
        "Nombre Completo": est.nombre || "N/A",
        "Documento (C.C)": est.cedula || "N/A",
        "Teléfono": est.telefono || "N/A",
        "Email": est.email || "N/A",
        "Curso Seleccionado": est.curso || "N/A",
        "Empresa": est.empresa || "Independiente",
        "Estado de Pago": est.estado_pago || est.estadoPago || "Pendiente",
        "Aptitud Médica": est.resultado_final || "Pendiente",
        "Origen de Registro": est.etiqueta === 'WEB' ? 'Página Web' : 'Manual',
        "Fecha de Ingreso": est.created_at || est.fecha_registro ? new Date(est.created_at || est.fecha_registro).toLocaleDateString('es-CO') : "N/A"
      }));

      // 2. Crear la hoja y el libro de Excel
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Base de Datos");

      // 3. Ajustar el ancho de las columnas para que se vea bien
      const wscols = [
        { wch: 35 }, // Nombre
        { wch: 15 }, // Documento
        { wch: 15 }, // Teléfono
        { wch: 30 }, // Email
        { wch: 35 }, // Curso
        { wch: 25 }, // Empresa
        { wch: 15 }, // Pago
        { wch: 15 }, // Aptitud
        { wch: 20 }, // Origen
        { wch: 15 }  // Fecha
      ];
      worksheet['!cols'] = wscols;

      // 4. Descargar el archivo
      XLSX.writeFile(workbook, `Reporte_Estudiantes_${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.xlsx`);
      
      toast.success("¡Excel descargado con éxito!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al generar el Excel", { id: toastId });
    }
  };
  
  return (
    <div className="space-y-4 animate-in fade-in">
      {/* BARRA DE BÚSQUEDA Y SINCRONIZACIÓN */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Buscar por nombre o cédula..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
          className="w-full p-2 bg-slate-50 border rounded-xl outline-none" 
        />
        <button 
          onClick={exportarAExcel}
          className="flex items-center gap-2 bg-[#107C41] hover:bg-[#0e6b38] text-white px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-200/50 active:scale-95"
          title="Descargar tabla actual en Excel"
        >
          <FaFileExcel size={14} />
        </button>
        <button 
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${
            isRefreshing 
            ? 'bg-blue-100 text-blue-400 cursor-wait' 
            : 'bg-slate-100 text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-md border border-transparent hover:border-blue-100'
          }`}
        >
          <FaSync className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Sincronizando..." : " "}
        </button>
      </div>
      
      {/* TABLA DE BASE DE DATOS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase border-b font-black tracking-widest">
              <th className="px-6 py-4">Estudiante / Cédula</th>
              <th className="px-6 py-4">Documentación</th>
              <th className="px-6 py-4">Pago / Valor Final</th>
              <th className="px-6 py-4">Aptitud</th>
              <th className="px-6 py-4">Asignar Clase</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {listaUnificada.map((item: any) => {
              const reqs = obtenerRequeridos(item.curso);
              const verificacion = item.doc_verification || {};
              const esEmpresa = item.tipo_cliente === "Empresa" || (item.empresa && item.empresa !== "Particular / Independiente" && item.empresa !== "Particular");

              return (
                <tr key={item.id + item.origen} className="hover:bg-slate-50 transition group">
                  
                  {/* COLUMNA 1: INFO ESTUDIANTE */}
                  <td className="px-6 py-4">
                    <div className="flex gap-1 mb-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black ${item.etiqueta === 'WEB' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.etiqueta}
                      </span>
                      {esEmpresa ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[8px] font-black flex items-center gap-1">
                          <FaBuilding size={8}/> {item.empresa} {item.nit && item.nit !== 'N/A' ? `(NIT: ${item.nit})` : ''}
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[8px] font-black flex items-center gap-1">
                          <FaUser size={8}/> INDEPENDIENTE
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-700 text-base">{item.nombre}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1"><FaIdCard size={10}/> {item.cedula}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-red-400" size={10}/> 
                      <span className="font-medium">{item.ciudad_residencia || item.direccion || 'Sin dirección'}</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-bold text-slate-600">Barrio: {item.barrio || 'N/A'}</span>
                    </div>
                    <div className="text-[10px] text-blue-600 font-black uppercase mt-1 tracking-tight">{item.curso}</div>
                  </td>

                  {/* COLUMNA 2: DOCUMENTOS */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {reqs.map((r: any) => (
                        <DocButton 
                          key={item.id + r.id}
                          label={r.label}
                          url={getDocUrl(item, r.id, r.oldId)}
                          icon={r.icon}
                          statusData={verificacion[r.id]}
                          onToggle={() => toggleVerificacion(item, r.id, r.label)}
                        />
                      ))}
                    </div>
                  </td>

                  {/* COLUMNA 3: PAGO */}
                  <td className="px-6 py-4">
                    <select 
                      value={item.estado_pago || "Pendiente"} 
                      onChange={(e)=>actualizarEstadoEstudiante(item.origen, item.id, 'estado_pago', e.target.value, item.nombre || 'Estudiante')} 
                      className={`text-[10px] p-1.5 rounded border-none font-bold w-full mb-1 outline-none ${item.estado_pago === 'Pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      <option value="Pendiente">PENDIENTE</option>
                      <option value="Pagado">PAGADO</option>
                    </select>
                    <div className="flex items-center gap-1 font-bold text-blue-600 text-xs">
                      $ <input 
                          defaultValue={item.precio_final || item.precio_pactado || "0"} 
                          onBlur={(e) => actualizarEstadoEstudiante(item.origen, item.id, item.origen === 'preinscripciones' ? 'precio_pactado' : 'precio_final', e.target.value, item.nombre || 'Estudiante')} 
                          className="w-20 bg-transparent outline-none border-b border-transparent hover:border-blue-300"
                        />
                    </div>
                  </td>

                  {/* COLUMNA 4: APTITUD */}
                  <td className="px-6 py-4">
                    <select 
                      value={item.resultado_final || "Pendiente"} 
                      onChange={(e)=>actualizarEstadoEstudiante(item.origen, item.id, 'resultado_final', e.target.value, item.nombre || 'Estudiante')} 
                      className={`text-[10px] p-1.5 rounded font-black w-full outline-none ${item.resultado_final === 'APTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}
                    >
                      <option>Pendiente</option>
                      <option>APTO</option>
                      <option>NO APTO</option>
                    </select>
                  </td>

                  {/* COLUMNA 5: AGENDA */}
                  <td className="px-6 py-4">
                    {item.resultado_final === "APTO" || item.agenda_id ? (
                      <div className="flex flex-col gap-1">
                        <select 
                          className={`text-[10px] p-1 border rounded w-full font-bold outline-none ${item.agenda_id ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}
                          value={item.agenda_id || ""}
                          onChange={(e) => actualizarEstadoEstudiante(item.origen, item.id, 'agenda_id', e.target.value, item.nombre)}
                        >
                          <option value="">-- Seleccionar Fecha --</option>
                          {agendaBD.filter(a => (a.curso || "").trim().toLowerCase() === (item.curso || "").trim().toLowerCase()).map(a => (
                            <option key={a.id} value={a.id}>
                              {formatFechaElegante(a.fecha)} ({a.hora}) - {a.intensidad_horaria}
                            </option>
                          ))}
                        </select>
                        {item.agenda_id && (
                          <span className="text-[8px] font-black text-green-600 flex items-center gap-1 justify-center uppercase">
                            <FaCheckCircle/> Cupo Reservado
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">Esperando Aptitud</span>
                    )}
                  </td>

                  {/* COLUMNA 6: ACCIONES */}
                  <td className="px-6 py-4 text-center space-y-2">
                    <button onClick={() => generarReporte(item)} className="w-full py-1.5 bg-slate-800 text-white rounded text-[9px] font-bold uppercase hover:bg-slate-900 transition flex items-center justify-center gap-1">
                      <FaEnvelope className="text-yellow-400"/> Reporte
                    </button>
                    <button onClick={() => borrarRegistro(item.origen, item.id)} className="text-red-300 hover:text-red-500 transition">
                      <FaTrash size={12}/>
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>

        {/* MODAL PARA CAPTURAR DATOS DE ARL */}
        {modalARL.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
              <div className="text-center mb-6">
                <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShieldVirus size={30}/>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Verificar ARL</h3>
                <p className="text-xs text-slate-500 mt-1">Ingresa el nombre de la aseguradora</p>
              </div>

              <div className="space-y-4">
                <input 
                  placeholder="Nombre ARL (SURA, Positiva...)" 
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400 font-bold"
                  value={datosARL.nombre}
                  onChange={(e) => setDatosARL({...datosARL, nombre: e.target.value})}
                />
                <input 
                  placeholder="NIT (Opcional)" 
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400"
                  value={datosARL.nit}
                  onChange={(e) => setDatosARL({...datosARL, nit: e.target.value})}
                />

                <button 
                  onClick={async () => {
                    if(!datosARL.nombre) return toast.error("Escribe el nombre de la ARL");
                    const item = modalARL.item;
                    const { error } = await supabase.from(item.origen).update({ arl_nombre: datosARL.nombre, arl_nit: datosARL.nit }).eq('id', item.id);
                    if(!error) {
                      await ejecutarCambioEstado(item, 'url_arl', 'ARL', 'approved');
                      setModalARL({isOpen: false, item: null});
                      setDatosARL({nombre: "", nit: ""});
                    }
                  }}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg"
                >
                  Aprobar ARL
                </button>
                <button onClick={() => setModalARL({isOpen: false, item: null})} className="w-full text-xs font-bold text-slate-400">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}