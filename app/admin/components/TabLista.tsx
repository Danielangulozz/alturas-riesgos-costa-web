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
import { generarPDFCertificado } from "@/lib/certificadoLogic";
import * as XLSX from 'xlsx';
import { FaFileExcel, FaFileArchive, FaCity, FaFileAlt, FaCertificate } from 'react-icons/fa'; // Asegúrate de importar el ícono
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ModalDetalleEstudiante } from "./ModalDetalleEstudiante";

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
  triggerConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info' | 'success') => void;
  hasMoreEstudiantes: boolean;
  fetchMasEstudiantes: () => Promise<void>;
  isLoadingMore: boolean;
  totalRegistros: number;
}

export function TabLista({
  busqueda, setBusqueda, fetchData, isRefreshing, listaUnificada, agendaBD,
  toggleVerificacion, actualizarEstadoEstudiante, generarReporte, borrarRegistro,
  modalARL, setModalARL, datosARL, setDatosARL, ejecutarCambioEstado, triggerConfirm,
  hasMoreEstudiantes, fetchMasEstudiantes, isLoadingMore, totalRegistros
}: TabListaProps) {

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [filtroPago, setFiltroPago] = React.useState<string>('');
  const [filtroAptitud, setFiltroAptitud] = React.useState<string>('');
  const [cursoSeleccionadoPorCedula, setCursoSeleccionadoPorCedula] = React.useState<Record<string, string>>({});
  const [modalEstudiante, setModalEstudiante] = React.useState<{ isOpen: boolean, grupo: any[] }>({ isOpen: false, grupo: [] });

  // Aplicar filtros locales sobre la lista unificada
  const listaFiltrada = listaUnificada.filter(item => {
    if (filtroPago && (item.estado_pago || 'Pendiente') !== filtroPago) return false;
    if (filtroAptitud && (item.resultado_final || 'Pendiente') !== filtroAptitud) return false;
    return true;
  });

  const selectedItems = listaFiltrada.filter(i => selectedIds.includes(i.id));
  const allSameCourse = selectedItems.length > 0 && selectedItems.every(i => i.curso === selectedItems[0].curso);
  const courseForAgenda = allSameCourse ? selectedItems[0].curso : null;
  const hasPendingPayment = selectedItems.some(i => i.estado_pago !== 'Pagado' && i.estadoPago !== 'Pagado');

  // Agrupar por cédula para mostrar un solo estudiante con múltiples cursos
  const groupedEstudiantes = React.useMemo(() => {
    const map = new Map<string, any[]>();
    listaFiltrada.forEach(item => {
      if (!map.has(item.cedula)) map.set(item.cedula, []);
      map.get(item.cedula)!.push(item);
    });
    return Array.from(map.values()).map(group => {
      return group.sort((a, b) => new Date(b.created_at || b.fecha_registro).getTime() - new Date(a.created_at || a.fecha_registro).getTime());
    });
  }, [listaFiltrada]);

  const toggleSeleccion = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSeleccionarTodo = () => {
    if (selectedIds.length === listaFiltrada.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listaFiltrada.map(item => item.id));
    }
  };

  const handleBulkAction = async (action: string, value?: string) => {
    const selectedItems = listaFiltrada.filter(i => selectedIds.includes(i.id));
    if (selectedItems.length === 0) return;

    if (action === 'delete') {
      const tid = toast.loading("Borrando registros...");
      for (let item of selectedItems) {
        await supabase.from(item.origen).delete().eq('id', item.id);
      }
      toast.success("Registros eliminados", { id: tid });
      setDeleteModalOpen(false);
    } else if (action === 'pago') {
      const tid = toast.loading("Actualizando pagos...");
      for (let item of selectedItems) {
        await supabase.from(item.origen).update({ estado_pago: 'Pagado' }).eq('id', item.id);
      }
      toast.success("Marcados como pagados", { id: tid });
    } else if (action === 'agenda' && value) {
      const tid = toast.loading("Asignando agenda...");
      for (let item of selectedItems) {
        await supabase.from(item.origen).update({ agenda_id: value }).eq('id', item.id);
      }
      toast.success("Agenda asignada", { id: tid });
    }

    setSelectedIds([]);
    fetchData();
  };

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

  const handleDownloadZip = async (item: any) => {
    const toastId = toast.loading("Generando expediente ZIP...");
    try {
      const zip = new JSZip();
      const reqs = obtenerRequeridos(item.curso);
      let downloaded = 0;

      for (const r of reqs) {
        const url = getDocUrl(item, r.id, r.oldId);
        if (url && typeof url === 'string' && url.length > 5) {
          try {
            const res = await fetch(url);
            const blob = await res.blob();

            // Determinar extensión real
            let ext = "pdf";
            if (blob.type.includes("jpeg") || blob.type.includes("jpg")) ext = "jpg";
            else if (blob.type.includes("png")) ext = "png";
            else if (url.toLowerCase().includes(".jpg")) ext = "jpg";
            else if (url.toLowerCase().includes(".png")) ext = "png";

            zip.file(`${r.label.replace(/\//g, '_')}_${item.cedula}.${ext}`, blob);
            downloaded++;
          } catch (err) {
            console.error("Error descargando doc:", r.label, err);
          }
        }
      }

      if (downloaded === 0) {
        toast.error("No hay documentos subidos para comprimir", { id: toastId });
        return;
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `Expediente_${item.cedula}_${item.nombre.replace(/\s+/g, '_')}.zip`);
      toast.success(`Descarga completa (${downloaded} archivos)`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Error al generar el ZIP", { id: toastId });
    }
  };

  const toggleMinisterio = async (item: any) => {
    let current = item.doc_verification;
    if (typeof current === 'string') {
      try { current = JSON.parse(current); } catch (e) { current = {}; }
    }
    current = current || {};

    const newState = !current.ministerio;
    const newDoc = { ...current, ministerio: newState };

    const toastId = toast.loading(newState ? "Marcando como reportado..." : "Desmarcando...");
    const { error } = await supabase.from(item.origen).update({ doc_verification: newDoc }).eq('id', item.id);

    if (error) {
      toast.error("Error al actualizar la base de datos", { id: toastId });
    } else {
      toast.success(newState ? "Reportado al Ministerio ✔" : "Reporte revocado", { id: toastId });
      fetchData();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* BARRA DE BÚSQUEDA Y SINCRONIZACIÓN */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col gap-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula, teléfono, curso o empresa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium text-slate-700"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <FaUser size={14} />
          </div>
        </div>

        {/* FILTROS RÁPIDOS */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Filtros:</span>
          
          {/* Filtro Pago */}
          <select
            value={filtroPago}
            onChange={(e) => setFiltroPago(e.target.value)}
            className={`text-[10px] px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer outline-none ${
              filtroPago ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <option value="">Todos los pagos</option>
            <option value="Pagado">Pagado</option>
            <option value="Pendiente">Pendiente</option>
          </select>

          {/* Filtro Aptitud */}
          <select
            value={filtroAptitud}
            onChange={(e) => setFiltroAptitud(e.target.value)}
            className={`text-[10px] px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer outline-none ${
              filtroAptitud ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <option value="">Todas las aptitudes</option>
            <option value="Pendiente">Pendiente</option>
            <option value="APTO">APTO</option>
            <option value="NO APTO">NO APTO</option>
            <option value="CERTIFICADO">CERTIFICADO</option>
            <option value="RETIRADO">RETIRADO</option>
          </select>

          {(filtroPago || filtroAptitud) && (
            <button
              onClick={() => { setFiltroPago(''); setFiltroAptitud(''); }}
              className="text-[9px] px-2.5 py-1.5 rounded-xl bg-red-50 text-red-500 font-bold border border-red-100 hover:bg-red-100 transition-all"
            >
              Limpiar
            </button>
          )}

          {/* CONTADOR DE REGISTROS */}
          <div className="ml-auto text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Mostrando <span className="text-slate-700 font-black">{listaFiltrada.length}</span> de <span className="text-slate-700 font-black">{totalRegistros}</span> registros
          </div>
        </div>

        <div className="grid grid-cols-2 md:flex md:flex-row gap-3">
          <button
            onClick={exportarAExcel}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#107C41] hover:bg-[#0e6b38] text-white px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-200/50 active:scale-95 border-b-4 border-green-800"
            title="Descargar tabla actual en Excel"
          >
            <FaFileExcel size={14} />
            <span className="md:inline">Exportar</span>
          </button>

          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 border-b-4 ${isRefreshing
                ? 'bg-blue-100 text-blue-400 border-blue-200 cursor-wait'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-400 hover:shadow-md'
              }`}
          >
            <FaSync className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* VISTA MÓVIL (CARDS) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {listaFiltrada.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaUser size={30} className="text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No se encontraron registros</p>
              <p className="text-xs text-slate-400 mt-2">Intenta con otra búsqueda o limpia los filtros</p>
            </div>
          ) : groupedEstudiantes.map((group: any[]) => {
            const cedula = group[0].cedula;
            const activeId = cursoSeleccionadoPorCedula[cedula] || group[0].id;
            const item = group.find(i => i.id === activeId) || group[0];

            const reqs = obtenerRequeridos(item.curso);
            let verificacion = item.doc_verification;
            if (typeof verificacion === 'string') {
              try { verificacion = JSON.parse(verificacion); } catch (e) { verificacion = {}; }
            }
            verificacion = verificacion || {};
            const esEmpresa = item.tipo_cliente === "Empresa" || (item.empresa && item.empresa !== "Particular / Independiente" && item.empresa !== "Particular");

            return (
              <div key={item.id + item.origen} className={`rounded-3xl border p-5 transition-all shadow-sm ${selectedIds.includes(item.id) ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/10' : 'bg-white border-slate-200'}`}>
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSeleccion(item.id)}
                      className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${item.etiqueta === 'WEB' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                          {item.etiqueta}
                        </span>
                        {esEmpresa && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[8px] font-black flex items-center gap-1">
                            <FaBuilding size={8} /> EMPRESA
                          </span>
                        )}
                        {item.certificado_generado && (
                          <span 
                            onClick={() => {
                              const bloque = agendaBD.find(a => a.id === item.agenda_id);
                              if (bloque) generarPDFCertificado(item, bloque);
                              else toast.error("No hay agenda asignada para este certificado");
                            }}
                            className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-black tracking-widest cursor-pointer shadow-sm border border-emerald-600 flex items-center gap-1 hover:bg-emerald-600 transition-colors"
                            title={`Código: ${item.certificado_codigo} | Emitido: ${item.certificado_fecha_emision} | Vence: ${item.certificado_fecha_vencimiento}`}
                          >
                            <FaCertificate size={8} /> CERTIFICADO (Clic para bajar)
                          </span>
                        )}
                      </div>
                      <h4 
                        onClick={() => setModalEstudiante({ isOpen: true, grupo: group })}
                        className="font-black text-slate-800 text-base leading-tight mt-1 uppercase cursor-pointer hover:text-blue-600 transition-colors inline-block"
                        title="Ver detalles del estudiante"
                      >
                        {item.nombre}
                      </h4>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{item.cedula}</div>
                </div>

                {/* Info & Badges */}
                <div className="space-y-3 mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Programa / Curso</p>
                    {group.length > 1 ? (
                      <select 
                        value={item.id}
                        onChange={(e) => setCursoSeleccionadoPorCedula(prev => ({ ...prev, [cedula]: e.target.value }))}
                        className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg p-1.5 outline-none w-full cursor-pointer hover:border-blue-300 transition-all shadow-sm appearance-none"
                      >
                        {group.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.curso} - {g.origen === 'estudiantes' ? 'Activo' : 'Pendiente'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[11px] font-bold text-slate-700">{item.curso}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex-1 min-w-[120px]">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Estado Pago</p>
                      <select
                        value={item.estado_pago || "Pendiente"}
                        onChange={(e) => actualizarEstadoEstudiante(item.origen, item.id, 'estado_pago', e.target.value, item.nombre)}
                        className={`text-[10px] p-2.5 rounded-xl border-none font-black w-full outline-none shadow-sm ${item.estado_pago === 'Pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        <option value="Pendiente">PENDIENTE</option>
                        <option value="Pagado">PAGADO</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Aptitud</p>
                      <select
                        value={item.resultado_final || "Pendiente"}
                        onChange={(e) => actualizarEstadoEstudiante(item.origen, item.id, 'resultado_final', e.target.value, item.nombre)}
                        className={`text-[10px] p-2.5 rounded-xl font-black w-full outline-none shadow-sm ${item.resultado_final === 'APTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}
                      >
                        <option>Pendiente</option>
                        <option>APTO</option>
                        <option>NO APTO</option>
                        <option>CERTIFICADO</option>
                        <option>RETIRADO</option>
                      </select>
                    </div>
                  </div>

                  {/* Documentos */}
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Requisitos</p>
                    <div className="grid grid-cols-2 gap-2">
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
                  </div>
                </div>

                {/* Footer Card: Acciones */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-4 gap-2">
                  <button onClick={() => handleDownloadZip(item)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Descargar ZIP">
                    <FaFileArchive size={14} />
                  </button>
                  <button onClick={() => toggleMinisterio(item)} className={`p-3 border rounded-2xl flex items-center justify-center transition-all shadow-sm ${verificacion.ministerio ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-slate-50 text-slate-400 border-slate-100'}`} title="Reporte Ministerio">
                    <FaBuilding size={14} />
                  </button>
                  <button onClick={() => generarReporte(item)} className="p-3 bg-slate-800 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-sm" title="Generar Certificado">
                    <FaEnvelope className="text-yellow-400" size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      triggerConfirm(
                        "Eliminar Registro",
                        `¿Borrar permanentemente a ${item.nombre}?`,
                        () => borrarRegistro(item.origen, item.id),
                        'danger'
                      );
                    }}
                    className="p-3 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {hasMoreEstudiantes && (
            <div className="flex justify-center pt-4">
              <button 
                onClick={fetchMasEstudiantes}
                disabled={isLoadingMore}
                className="px-8 py-4 bg-white border border-slate-200 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm active:scale-95 flex items-center gap-3 disabled:opacity-50"
              >
                <FaSync className={isLoadingMore ? "animate-spin" : ""} />
                {isLoadingMore ? "Cargando..." : "Cargar más"}
              </button>
            </div>
          )}
        </div>

        {/* VISTA ESCRITORIO (TABLA) — scroll independiente */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 hidden md:block max-h-[65vh] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1200px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase border-b font-black tracking-widest">
                <th className="px-6 py-5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === listaFiltrada.length}
                    onChange={toggleSeleccionarTodo}
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-5">Estudiante / Cédula</th>
                <th className="px-6 py-5">Documentación</th>
                <th className="px-6 py-5">Pago / Valor Final</th>
                <th className="px-6 py-5">Aptitud</th>
                <th className="px-6 py-5">Asignar Clase</th>
                <th className="px-6 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {groupedEstudiantes.map((group: any[]) => {
                const cedula = group[0].cedula;
                const activeId = cursoSeleccionadoPorCedula[cedula] || group[0].id;
                const item = group.find(i => i.id === activeId) || group[0];

                const reqs = obtenerRequeridos(item.curso);
                let verificacion = item.doc_verification;
                if (typeof verificacion === 'string') {
                  try { verificacion = JSON.parse(verificacion); } catch (e) { verificacion = {}; }
                }
                verificacion = verificacion || {};
                const esEmpresa = item.tipo_cliente === "Empresa" || (item.empresa && item.empresa !== "Particular / Independiente" && item.empresa !== "Particular");

                return (
                  <tr key={item.id + item.origen} className={`transition group ${selectedIds.includes(item.id) ? 'bg-blue-50' : 'hover:bg-slate-50/50'}`}>

                    {/* COLUMNA CHECKBOX */}
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSeleccion(item.id)}
                        className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* COLUMNA 1: INFO ESTUDIANTE */}
                    <td className="px-6 py-4">
                      <div className="flex gap-1 mb-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black ${item.etiqueta === 'WEB' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                          {item.etiqueta}
                        </span>
                        {esEmpresa ? (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[8px] font-black flex items-center gap-1">
                            <FaBuilding size={8} /> {item.empresa} {item.nit && item.nit !== 'N/A' ? `(NIT: ${item.nit})` : ''}
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[8px] font-black flex items-center gap-1">
                            <FaUser size={8} /> INDEPENDIENTE
                          </span>
                        )}

                        {item.certificado_generado && (
                          <div className="relative group/badge">
                            <span 
                              onClick={() => {
                                const bloque = agendaBD.find(a => a.id === item.agenda_id);
                                if (bloque) generarPDFCertificado(item, bloque);
                                else toast.error("No hay agenda asignada para este certificado");
                              }}
                              className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-black tracking-widest cursor-pointer shadow-sm border border-emerald-600 flex items-center gap-1 hover:bg-emerald-600 transition-colors"
                            >
                              <FaCertificate size={8} /> CERTIFICADO
                            </span>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/badge:flex flex-col bg-slate-900 text-white text-[10px] p-3 rounded-lg shadow-xl border border-slate-700 z-50 min-w-[200px]">
                              <p className="font-bold text-emerald-400 mb-1 border-b border-slate-700 pb-1">{item.curso}</p>
                              <p className="flex justify-between"><span>Código:</span> <span className="font-mono text-slate-300">
                                {item.certificado_codigo || "N/A"}
                              </span></p>
                              <p className="flex justify-between"><span>Emisión:</span> <span className="font-mono text-slate-300">
                                {item.certificado_fecha_emision || "N/A"}
                              </span></p>
                              <p className="flex justify-between"><span>Vencimiento:</span> <span className="font-mono text-amber-400">
                                {item.certificado_fecha_vencimiento || "N/A"}
                              </span></p>
                              <p className="mt-2 text-center text-[8px] text-slate-400 border-t border-slate-700 pt-1">Clic en el badge para descargar PDF</p>
                            </div>
                          </div>
                        )}

                      </div>
                      <div 
                        onClick={() => setModalEstudiante({ isOpen: true, grupo: group })}
                        className="font-black text-slate-700 text-base uppercase tracking-tight leading-tight cursor-pointer hover:text-blue-600 transition-colors inline-block"
                        title="Ver detalles e historial"
                      >
                        {item.nombre}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5"><FaIdCard size={10} /> {item.cedula}</div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-red-400" size={10} />
                        <span className="font-medium">{item.ciudad_residencia || item.direccion || 'Sin dirección'}</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-slate-600">Barrio: {item.barrio || 'N/A'}</span>
                      </div>
                      <div className="mt-2">
                        {group.length > 1 ? (
                          <select 
                            value={item.id}
                            onChange={(e) => setCursoSeleccionadoPorCedula(prev => ({ ...prev, [cedula]: e.target.value }))}
                            className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black uppercase rounded-lg p-1.5 outline-none w-full max-w-[280px] cursor-pointer hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm appearance-none"
                          >
                            {group.map(g => (
                              <option key={g.id} value={g.id}>
                                {g.curso} ({g.origen === 'estudiantes' ? 'Activo' : 'Pendiente'})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-[10px] text-blue-600 font-black uppercase tracking-tight">{item.curso}</div>
                        )}
                        <div className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Registrado: {item.created_at ? new Date(item.created_at).toLocaleDateString('es-CO') : 'N/A'}</div>
                      </div>
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
                        onChange={(e) => actualizarEstadoEstudiante(item.origen, item.id, 'estado_pago', e.target.value, item.nombre || 'Estudiante')}
                        className={`text-[10px] p-2 rounded-xl border-none font-black w-full mb-1 outline-none shadow-sm ${item.estado_pago === 'Pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        <option value="Pendiente">PENDIENTE</option>
                        <option value="Pagado">PAGADO</option>
                      </select>
                      <div className="flex items-center gap-1 font-black text-blue-600 text-xs px-2">
                        $ <input
                          defaultValue={item.precio_final || item.precio_pactado || "0"}
                          onBlur={(e) => actualizarEstadoEstudiante(item.origen, item.id, item.origen === 'preinscripciones' ? 'precio_pactado' : 'precio_final', e.target.value, item.nombre || 'Estudiante')}
                          className="w-20 bg-transparent outline-none border-b border-transparent hover:border-blue-300 font-black"
                        />
                      </div>
                    </td>

                    {/* COLUMNA 4: APTITUD */}
                    <td className="px-6 py-4">
                      <select
                        value={item.resultado_final || "Pendiente"}
                        onChange={(e) => actualizarEstadoEstudiante(item.origen, item.id, 'resultado_final', e.target.value, item.nombre || 'Estudiante')}
                        className={`text-[10px] p-2 rounded-xl font-black w-full outline-none shadow-sm ${item.resultado_final === 'APTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}
                      >
                        <option>Pendiente</option>
                        <option>APTO</option>
                        <option>NO APTO</option>
                        <option>CERTIFICADO</option>
                        <option>RETIRADO</option>
                      </select>
                    </td>

                    {/* COLUMNA 5: AGENDA */}
                    <td className="px-6 py-4">
                      {item.resultado_final === "APTO" || item.agenda_id ? (
                        <div className="flex flex-col gap-1">
                          <select
                            className={`text-[10px] p-2 border rounded-xl w-full font-black outline-none shadow-sm transition-all ${item.agenda_id ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700 focus:border-blue-400'}`}
                            value={item.agenda_id || ""}
                            onChange={(e) => actualizarEstadoEstudiante(item.origen, item.id, 'agenda_id', e.target.value, item.nombre)}
                          >
                            <option value="">-- Seleccionar Fecha --</option>
                            {agendaBD.filter(a => (a.curso || "").trim().toLowerCase() === (item.curso || "").trim().toLowerCase()).map(a => (
                              <option key={a.id} value={a.id}>
                                {formatFechaElegante(a.fecha)} ({a.hora})
                              </option>
                            ))}
                          </select>
                          {item.agenda_id && (
                            <span className="text-[8px] font-black text-green-600 flex items-center gap-1 justify-center uppercase mt-1">
                              <FaCheckCircle /> Cupo Reservado
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold italic block text-center">Esperando Aptitud</span>
                      )}
                    </td>

                    {/* COLUMNA 6: ACCIONES */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 w-28 mx-auto">
                        <button
                          onClick={() => handleDownloadZip(item)}
                          className="w-full py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <FaFileArchive size={12} /> Bajar ZIP
                        </button>

                        <button
                          onClick={() => toggleMinisterio(item)}
                          className={`w-full py-2 border rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm ${verificacion.ministerio
                              ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/30'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          {verificacion.ministerio ? <><FaCheckCircle size={12} /> Reportado</> : <><FaBuilding size={12} /> Ministerio</>}
                        </button>

                        <div className="flex gap-2">
                          <button onClick={() => generarReporte(item)} className="flex-1 py-2 bg-slate-800 text-white rounded-xl text-[9px] font-black hover:bg-black transition-all flex items-center justify-center shadow-sm">
                            <FaEnvelope className="text-yellow-400" />
                          </button>
                          <button
                            onClick={() => {
                              triggerConfirm(
                                "Eliminar Registro",
                                `¿Borrar permanentemente a ${item.nombre}?`,
                                () => borrarRegistro(item.origen, item.id),
                                'danger'
                              );
                            }}
                            className="flex-1 py-2 bg-red-50 text-red-500 rounded-xl text-[9px] font-black hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm border border-red-100"
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Botón cargar más — dentro del contenedor de la tabla */}
          {hasMoreEstudiantes && !busqueda && (
            <div className="flex justify-center py-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={fetchMasEstudiantes}
                disabled={isLoadingMore}
                className="px-8 py-3.5 bg-white border border-slate-200 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm active:scale-95 flex items-center gap-2.5 group disabled:opacity-50 disabled:cursor-wait"
              >
                <FaSync className={`transition-transform duration-500 ${isLoadingMore ? "animate-spin" : "group-hover:rotate-180"}`} />
                {isLoadingMore ? "Cargando registros..." : "Cargar más registros"}
              </button>
            </div>
          )}

          {/* Empty State para escritorio */}
          {listaFiltrada.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaUser size={30} className="text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No se encontraron registros</p>
              <p className="text-xs text-slate-400 mt-2">Intenta con otra búsqueda o limpia los filtros</p>
            </div>
          )}
        </div>
      </div>

      <ModalDetalleEstudiante 
        isOpen={modalEstudiante.isOpen} 
        onClose={() => setModalEstudiante({ isOpen: false, grupo: [] })} 
        grupoEstudiante={modalEstudiante.grupo} 
      />

      {/* MODAL PARA CAPTURAR DATOS DE ARL */}
        {modalARL.isOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
              <div className="text-center mb-6">
                <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShieldVirus size={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Verificar ARL</h3>
                <p className="text-xs text-slate-500 mt-1">Ingresa el nombre de la aseguradora</p>
              </div>

              <div className="space-y-4">
                <input
                  placeholder="Nombre ARL (SURA, Positiva...)"
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400 font-bold"
                  value={datosARL.nombre}
                  onChange={(e) => setDatosARL({ ...datosARL, nombre: e.target.value })}
                />
                <input
                  placeholder="NIT (Opcional)"
                  className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400"
                  value={datosARL.nit}
                  onChange={(e) => setDatosARL({ ...datosARL, nit: e.target.value })}
                />

                <button
                  onClick={async () => {
                    if (!datosARL.nombre) return toast.error("Escribe el nombre de la ARL");
                    const item = modalARL.item;
                    const { error } = await supabase.from(item.origen).update({ arl_nombre: datosARL.nombre, arl_nit: datosARL.nit }).eq('id', item.id);
                    if (!error) {
                      await ejecutarCambioEstado(item, 'url_arl', 'ARL', 'approved');
                      setModalARL({ isOpen: false, item: null });
                      setDatosARL({ nombre: "", nit: "" });
                    }
                  }}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg"
                >
                  Aprobar ARL
                </button>
                <button onClick={() => setModalARL({ isOpen: false, item: null })} className="w-full text-xs font-bold text-slate-400">Cancelar</button>
              </div>
            </div>
          </div>
        )}

      {/* TOOLBAR FLOTANTE DE ACCIONES MASIVAS */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-[#0F172A] p-2 md:p-3 md:px-6 rounded-3xl md:rounded-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-3 md:gap-6 z-[60] animate-in slide-in-from-bottom-10 border border-slate-700/50 backdrop-blur-md">
          <div className="flex items-center gap-3 px-2 md:px-0 py-1 border-b md:border-b-0 border-slate-800 w-full md:w-auto justify-center">
            <div className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg shadow-blue-500/20">
              {selectedIds.length}
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Seleccionados</span>
          </div>

          <div className="hidden md:block h-8 w-px bg-slate-700"></div>

          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center overflow-x-auto pb-1 md:pb-0 px-2 no-scrollbar">
            {hasPendingPayment && (
              <button
                onClick={() => handleBulkAction('pago')}
                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-emerald-500/30 hover:border-transparent whitespace-nowrap"
              >
                Pagados
              </button>
            )}

            {allSameCourse && courseForAgenda && (
              <div className="relative group">
                <select
                  onChange={(e) => {
                    if (e.target.value) handleBulkAction('agenda', e.target.value);
                    e.target.value = "";
                  }}
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all outline-none cursor-pointer appearance-none text-center border border-blue-500/30 hover:border-transparent whitespace-nowrap"
                >
                  <option value="" className="bg-slate-900">+ Agenda</option>
                  {agendaBD.filter(a => a.curso.toLowerCase() === courseForAgenda.toLowerCase()).map(a => (
                    <option key={a.id} value={a.id} className="bg-slate-900 text-white">{formatFechaElegante(a.fecha)} - {a.hora}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/30 hover:border-transparent whitespace-nowrap"
            >
              Borrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaTrash size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 text-center mb-2">¿Borrar Registros?</h3>
            <p className="text-sm text-slate-500 text-center mb-8 font-medium">
              Estás a punto de eliminar permanentemente <strong className="text-slate-800">{selectedIds.length}</strong> estudiantes de la base de datos. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-xs uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest shadow-lg shadow-red-500/30"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}