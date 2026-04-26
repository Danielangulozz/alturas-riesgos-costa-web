import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface UseAdminActionsProps {
  fetchData: () => void;
  userName: string;
  userRole: string;
  registrarLog: (accion: string, detalles: string) => Promise<void>;
  updateLocalItem: (id: string, origen: string, newData: any) => void;
}

export function useAdminActions({ fetchData, userName, userRole, registrarLog, updateLocalItem }: UseAdminActionsProps) {
  
  // 1. BORRAR REGISTRO
  const borrarRegistro = async (tabla: string, id: string) => {
    if (userRole !== 'admin_general' && userRole !== 'developer') return toast.error("⛔ Acceso Denegado");
    const { error } = await supabase.from(tabla).delete().eq('id', id);
    if (!error) { 
      toast.success("Eliminado"); 
      await registrarLog("Eliminó Registro", `Borró un registro de la tabla ${tabla}`);
      fetchData(); 
    }
  };

  // 2. ACTUALIZAR CUALQUIER ESTADO (Pago, Aptitud, etc)
  const actualizarEstadoEstudiante = async (tabla: string, id: string, campo: string, valor: string, nombreEst: string) => {
    if (userRole !== 'admin_general' && userRole !== 'developer' && (campo === 'precio_final' || campo === 'precio_pactado')) {
      return toast.error("⛔ Solo Admin General edita precios.");
    }

    // Actualización optimista local
    updateLocalItem(id, tabla, { [campo]: valor });

    const { error } = await supabase.from(tabla).update({ [campo]: valor }).eq('id', id);
    if (error) { 
      console.error("Error actualizando:", error); 
      toast.error(`Error: ${error.message}`); 
      fetchData(); // Revertir si hay error
    } else { 
      toast.success("Actualizado"); 
      
      let nombreAccion = "Editó Dato";
      let detallesAccion = `Cambió ${campo} en ${nombreEst}`;
      
      if (campo === 'estado_pago') {
        nombreAccion = "Actualizó Pago";
        detallesAccion = `Cambió el estado de pago de ${nombreEst} a "${valor}"`;
      } else if (campo === 'estado_proceso' || campo === 'resultado_final') {
        nombreAccion = "Actualizó Aptitud/Estado";
        detallesAccion = `Marcó a ${nombreEst} como "${valor}"`;
      } else if (campo === 'fecha_asignada') {
        nombreAccion = "Asignó Fecha";
        detallesAccion = `Asignó a ${nombreEst} para la fecha ${valor}`;
      }

      await registrarLog(nombreAccion, detallesAccion); 
    }
  };

  // 3. ACTUALIZAR PRECIO DE CATÁLOGO
  const actualizarPrecioMaestro = async (id: string, nuevoPrecio: string) => {
    const { error } = await supabase.from('configuracion_cursos').update({ precio_base: nuevoPrecio }).eq('id', id);
    if (!error) { 
      toast.success("Precio actualizado"); 
      await registrarLog("Actualizó Precio", `Cambió un precio en el catálogo a ${nuevoPrecio}`);
      fetchData(); 
    }
  };

  // 4. CAMBIAR ESTADO DE DOCUMENTOS
  const ejecutarCambioEstado = async (item: any, docId: string, docLabel: string, newState: string) => {
    let currentVerification = item.doc_verification;
    if (typeof currentVerification === 'string') {
       try { currentVerification = JSON.parse(currentVerification); } catch(e) { currentVerification = {}; }
    }
    currentVerification = currentVerification || {};

    const timestamp = new Date().toLocaleString('es-CO');
    
    const newVerificationData = {
      ...currentVerification,
      [docId]: { status: newState, by: userName, at: timestamp }
    };

    // Actualización optimista local
    updateLocalItem(item.id, item.origen, { doc_verification: newVerificationData });

    const { error } = await supabase.from(item.origen).update({ doc_verification: newVerificationData }).eq('id', item.id);

    if (!error) {
      if(newState === 'approved') toast.success(`✅ ${docLabel} Aprobado`);
      if(newState === 'rejected') toast.error(`❌ ${docLabel} Rechazado`);
      
      await registrarLog(
        newState === 'approved' ? "Aprobó Documento" : "Rechazó Documento", 
        `${docLabel} de ${item.nombre} (${newState.toUpperCase()})`
      );
    } else {
      toast.error("Error al guardar estado");
      fetchData(); // Revertir si hay error
    }
  };

  // 5. DECIDIR QUÉ HACER CON EL DOCUMENTO
  const toggleVerificacion = async (item: any, docId: string, docLabel: string, setModalARL: any) => {
    let currentVerification = item.doc_verification;
    if (typeof currentVerification === 'string') {
       try { currentVerification = JSON.parse(currentVerification); } catch(e) { currentVerification = {}; }
    }
    currentVerification = currentVerification || {};

    const currentState = currentVerification[docId]?.status || 'pending';

    if (docId === 'url_arl' && currentState !== 'approved') {
      setModalARL({ isOpen: true, item });
      return;
    }
    let newState = currentState === 'approved' ? 'rejected' : 'approved';
    ejecutarCambioEstado(item, docId, docLabel, newState);
  };

  return {
    borrarRegistro,
    actualizarEstadoEstudiante,
    actualizarPrecioMaestro,
    ejecutarCambioEstado,
    toggleVerificacion
  };
}