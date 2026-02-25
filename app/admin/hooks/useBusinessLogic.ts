import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatFechaElegante, calcularTotalSolicitud } from "../utils/formatters";

interface UseBusinessLogicProps {
  fetchData: () => void;
  registrarLog: (accion: string, detalles: string) => Promise<void>;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  agendaData: any;
  setAgendaData: React.Dispatch<React.SetStateAction<any>>;
  fechasSeleccionadas: string[];
  preciosEditados: { [key: string]: string };
  agendaBD: any[];
  catalogoCursos: any[];
}

export function useBusinessLogic({
  fetchData, registrarLog, formData, setFormData, 
  agendaData, setAgendaData, fechasSeleccionadas, 
  preciosEditados, agendaBD, catalogoCursos
}: UseBusinessLogicProps) {

  // 1. REGISTRAR ESTUDIANTE (Matriculación Manual)
  const registrarEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    const tId = toast.loading("Registrando estudiante...");
    try {
      const { error } = await supabase.from('preinscripciones').insert([{
        ...formData,
        origen: 'preinscripciones',
        etiqueta: 'MANUAL',
        fecha_registro: new Date().toISOString()
      }]);
      
      if (error) throw error;
      
      toast.success("Estudiante registrado exitosamente", { id: tId });
      registrarLog("Matriculación Manual", `Registró a ${formData.nombre}`);
      setFormData({
        nombre: "", cedula: "", email: "", telefono: "", curso: "", 
        ciudad_residencia: "", barrio: "", fecha_nacimiento: "", 
        sexo: "", horario_preferencia: "", empresa: "", nit: "", estadoPago: "Pendiente"
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message, { id: tId });
    }
  };

  // 2. GUARDAR EN AGENDA (Crear bloque de clase)
  const guardarEnAgenda = async () => {
    if (!agendaData.curso || !agendaData.fecha_inicio || !agendaData.hora) {
      return toast.error("Por favor completa los campos principales de la agenda");
    }
    const tId = toast.loading("Guardando en agenda...");
    try {
      const cursoInfo = catalogoCursos.find(c => c.nombre_curso === agendaData.curso);
      const { error } = await supabase.from('agenda').insert([{
        curso: agendaData.curso,
        fecha: agendaData.fecha_inicio,
        fecha_fin: agendaData.fecha_fin || agendaData.fecha_inicio,
        hora: agendaData.hora,
        intensidad_horaria: cursoInfo ? cursoInfo.intensidad_horaria : "No especificada"
      }]);

      if (error) throw error;

      toast.success("Bloque creado en agenda", { id: tId });
      registrarLog("Creó Agenda", `Bloque de ${agendaData.curso} para el ${agendaData.fecha_inicio}`);
      setAgendaData({ curso: "", fecha_inicio: "", fecha_fin: "", hora: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message, { id: tId });
    }
  };

  // 3. ENVIAR WHATSAPP (Solicitudes Web)
  const enviarWhatsAppMultifecha = (sol: any) => {
    if (fechasSeleccionadas.length === 0) {
      return toast.error("Selecciona al menos una fecha de la agenda para proponer.");
    }
    
    let mensaje = `Hola *${sol.nombre.trim()}* 👋,\nSomos el área de admisiones de *Alturas y Riesgos de la Costa*.\n\nRecibimos tu solicitud para el curso de *${sol.curso}*. `;
    
    mensaje += `\n\n📅 *Fechas Disponibles Proyectadas:*\n`;
    fechasSeleccionadas.forEach(fId => {
      const b = agendaBD.find(a => a.id === fId);
      if (b) mensaje += `• ${formatFechaElegante(b.fecha)} a las ${b.hora}\n`;
    });

    const totalCalculado = preciosEditados[sol.id] || calcularTotalSolicitud(sol, 0, catalogoCursos);
    mensaje += `\n💰 *Inversión Total:* $${Number(totalCalculado).toLocaleString('es-CO')}\n`;
    mensaje += `\n¿Te gustaría que te reservemos el cupo en alguna de estas fechas? Quedo atento/a para ayudarte con el proceso.`;

    const numeroLimpio = sol.telefono.replace(/\D/g, '');
    const url = `https://wa.me/57${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // 4. GENERAR REPORTE (Aptitud/Documentos)
  const generarReporte = (est: any) => {
    let mensaje = `Hola *${est.nombre}*,\nTe escribimos de *Alturas y Riesgos de la Costa* para notificarte el estado de tu proceso para el curso de *${est.curso}*.\n\n`;
    
    if (est.resultado_final === 'APTO') {
      mensaje += `✅ ¡Felicidades! Has sido calificado como *APTO*.`;
      if (est.agenda_id) {
        const bloque = agendaBD.find(a => a.id === est.agenda_id);
        if (bloque) mensaje += `\nTu clase está programada para el *${formatFechaElegante(bloque.fecha)}* a las *${bloque.hora}*. Te esperamos.`;
      }
    } else {
      mensaje += `⚠️ Tu estado de aptitud actualmente es: *${est.resultado_final || 'Pendiente'}*.\nPor favor contáctanos para más detalles sobre tu documentación o exámenes.`;
    }
    
    const numeroLimpio = est.telefono ? est.telefono.replace(/\D/g, '') : '';
    if (!numeroLimpio) return toast.error("El estudiante no tiene número de teléfono registrado.");
    
    window.open(`https://wa.me/57${numeroLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  // 5. DESCARGAR PDF DE ASISTENCIA
  const descargarPDFAsistencia = (bloque: any, inscritos: any[]) => {
    if (inscritos.length === 0) return toast.error("No hay estudiantes para generar la planilla.");
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Planilla de Asistencia - Alturas y Riesgos de la Costa", 14, 20);
    doc.setFontSize(10);
    doc.text(`Curso: ${bloque.curso}`, 14, 30);
    doc.text(`Fecha: ${bloque.fecha} | Hora: ${bloque.hora}`, 14, 36);
    doc.text(`Intensidad: ${bloque.intensidad_horaria}`, 14, 42);

    const tableData = inscritos.map((est, i) => [
      i + 1,
      est.nombre.toUpperCase(),
      est.cedula,
      est.empresa || 'INDEPENDIENTE',
      "" // Espacio para firma
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['#', 'Nombre Completo', 'Cédula', 'Empresa', 'Firma de Asistencia']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
      columnStyles: { 4: { cellWidth: 40 } }
    });

    doc.save(`Planilla_${bloque.curso.replace(/\s+/g, '_')}_${bloque.fecha}.pdf`);
    toast.success("Planilla PDF generada");
  };

  return {
    registrarEstudiante,
    guardarEnAgenda,
    enviarWhatsAppMultifecha,
    generarReporte,
    descargarPDFAsistencia
  };
}