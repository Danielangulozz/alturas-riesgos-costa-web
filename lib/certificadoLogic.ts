import jsPDF from 'jspdf';
import * as QRCode from 'qrcode'; 
import { supabase } from "@/lib/supabase";

/**
 * ==============================================================================
 * 1. FUNCIÓN: REGISTRAR CERTIFICACIÓN (Lógica de Negocio y Base de Datos)
 * ==============================================================================
 */
export const registrarCertificacion = async (estudiante: any, bloqueAgenda: any) => {
  try {
    // 1. Validación Médica
    if (estudiante.resultado_final !== 'APTO') {
      throw new Error("BLOQUEO MÉDICO: El estudiante no tiene el concepto de APTO médico para alturas.");
    }

    // 2. Validación Financiera
    if (estudiante.estado_pago === 'Pendiente') {
      throw new Error("BLOQUEO FINANCIERO: El pago está PENDIENTE. Legalice el pago antes de certificar.");
    }

    // Fechas
    const fechaFinReal = new Date(); 
    const fechaVencimientoObj = new Date(fechaFinReal);
    fechaVencimientoObj.setFullYear(fechaFinReal.getFullYear() + 1);
    
    const fechaEmisionStr = fechaFinReal.toISOString().split('T')[0];
    const fechaVencimientoStr = fechaVencimientoObj.toISOString().split('T')[0];

    // Código Único
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const codigoUnico = `AR-${randomCode}`;

    // Actualizar BD
    const { data, error } = await supabase
      .from('preinscripciones')
      .update({
        certificado_codigo: codigoUnico,
        certificado_fecha_emision: fechaEmisionStr,
        certificado_fecha_vencimiento: fechaVencimientoStr,
        certificado_generado: true,
        estado_proceso: 'Certificado' 
      })
      .eq('id', estudiante.id)
      .select()
      .single();

    if (error) throw error;
    return data; 

  } catch (error: any) {
    throw error;
  }
};


/**
 * ==============================================================================
 * 2. FUNCIÓN: REVOCAR CERTIFICACIÓN
 * ==============================================================================
 */
export const revocarCertificacion = async (estudianteId: string) => {
  try {
    const { data, error } = await supabase
      .from('preinscripciones')
      .update({
        certificado_codigo: null,
        certificado_fecha_emision: null,
        certificado_fecha_vencimiento: null,
        certificado_generado: false,
        estado_proceso: 'En Proceso' 
      })
      .eq('id', estudianteId)
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error: any) {
    throw error;
  }
};


/**
 * ==============================================================================
 * 3. FUNCIÓN: GENERAR PDF (LIMPIO Y CON CÓDIGO QR)
 * ==============================================================================
 */
export const generarPDFCertificado = async (estudiante: any, bloqueAgenda: any) => {
  
  // A. Consultar horas
  let horasRealesTexto = "40 horas"; 
  try {
    const { data: cursoConfig } = await supabase
      .from('configuracion_cursos')
      .select('horas_duracion')
      .eq('nombre_curso', estudiante.curso)
      .single();

    if (cursoConfig && cursoConfig.horas_duracion) horasRealesTexto = cursoConfig.horas_duracion;
    else horasRealesTexto = bloqueAgenda.intensidad_horaria || "40 horas";
  } catch (err) { console.error(err); }

  // -----------------------------------------------------------------------
  // B. CONFIGURACIÓN PDF
  // Dejamos la encriptación básica "silenciosa" para evitar edición casual en Adobe.
  // Pero confiamos en el QR como validación final.
  // -----------------------------------------------------------------------
  const passwordSeguridad = Math.random().toString(36).slice(-10);

  const doc = new jsPDF({
    orientation: 'landscape', 
    unit: 'mm',
    format: 'a4', 
    compress: true,
    encryption: {
      userPermissions: ["print", "copy"], // Permite imprimir y copiar, bloquea edición en lectores PDF estándar
      ownerPassword: passwordSeguridad, 
      userPassword: "" 
    }
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // C. Imagen de Fondo
  const img = new Image();
  img.src = '/plantilla_blanco.jpg'; 
  
  await new Promise((resolve) => { 
    img.onload = resolve; 
    img.onerror = () => { alert("Falta plantilla_blanco.jpg"); resolve(null); }
  });

  doc.addImage(img, 'JPEG', 0, 0, width, height, undefined, 'FAST');


  // --- DIBUJADO DE TEXTOS ---
  doc.setFont("helvetica", "bold");

  // 1. NOMBRE
  doc.setTextColor(0, 0, 0); 
  doc.setFontSize(24); 
  doc.text(estudiante.nombre.toUpperCase(), width / 2, 92, { align: 'center' });

  // 2. CÉDULA
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60); 
  doc.text(`CC. ${estudiante.cedula}`, width / 2, 98, { align: 'center' });

  // 3. DATOS LATERALES
  const empresaNombre = estudiante.empresa || "PARTICULAR";
  const empresaNit = estudiante.nit || "";
  const arlNombre = estudiante.arl_nombre || "SURA"; 
  const arlNit = estudiante.arl_nit || ""; 

  // Empresa
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); 
  doc.text(empresaNombre.toUpperCase(), 66, 125, { align: 'center' });
  
  const esParticular = 
      empresaNombre.toUpperCase().includes("PARTICULAR") || 
      empresaNombre.toUpperCase().includes("INDEPENDIENTE");

  if (!esParticular && empresaNit && empresaNit !== "N/A") {
      doc.setFontSize(8); 
      doc.setTextColor(100, 100, 100); 
      doc.text(`NIT: ${empresaNit}`, 66, 128, { align: 'center' });
  }

  // ARL
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100); 
  doc.text(arlNombre.toUpperCase(), 240, 125, { align: 'center' });

  if (arlNit && arlNit !== "N/A") {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`NIT: ${arlNit}`, 240, 128, { align: 'center' });
  }

  // 4. CURSO
  doc.setTextColor(0, 0, 0); 
  doc.setFontSize(20);
  doc.text(estudiante.curso.toUpperCase(), width / 2, 144, { align: 'center' });

  // 5. TEXTO LEGAL
  doc.setTextColor(60, 60, 60); 
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const inicio = new Date(bloqueAgenda.fecha + "T00:00:00").toLocaleDateString('es-CO', {day: 'numeric', month: 'long', year: 'numeric'});
  const rawFechaFin = estudiante.certificado_fecha_emision || bloqueAgenda.fecha_fin;
  const fin = new Date(rawFechaFin + "T00:00:00").toLocaleDateString('es-CO', {day: 'numeric', month: 'long', year: 'numeric'});
  const horas = horasRealesTexto;
  
  doc.text(`Realizado en Sincelejo, del día ${inicio} al día ${fin} con una intensidad de ${horas}.`, width / 2, 160, { align: 'center' });

  const fechaExp = new Date().toLocaleDateString('es-CO', {day: 'numeric', month: 'long', year: 'numeric'});
  doc.text(`Expedido el: ${fechaExp}.`, width / 2, 165, { align: 'center' });
  
  // 6. CÓDIGO
  doc.setFontSize(9);
  doc.setFont("courier", "bold"); 
  doc.setTextColor(0, 0, 0);
  doc.text(`CÓDIGO: `, width / 2, 184, { align: 'center' });

  doc.setFont("courier", "bold"); 
  doc.setFontSize(11);
  doc.text(estudiante.certificado_codigo, width / 2, 188, { align: 'center' });

  // 7. QR
  const baseUrl = "https://alturas-riesgos-costa-web.vercel.app/";
  const urlVerificacion = `${baseUrl}/certificados?q=${estudiante.certificado_codigo}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(urlVerificacion, { margin: 0, width: 70 });
    doc.addImage(qrDataUrl, 'PNG', (width / 2) - 10, 190, 20, 18);
  } catch (err) { 
    console.error("Error QR", err); 
  }

  // ¡SIN TEXTO DE ADVERTENCIA! - LIMPIO

  doc.save(`Certificado_${estudiante.cedula}.pdf`);
};