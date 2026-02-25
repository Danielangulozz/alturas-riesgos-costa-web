import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface UseAdminActionsProps {
  fetchData: () => void;
  userName: string;
  userRole: string;
  registrarLog: (accion: string, detalles: string) => Promise<void>;
}

export function useAdminActions({ fetchData, userName, userRole, registrarLog }: UseAdminActionsProps) {
  
  // 1. BORRAR REGISTRO
  const borrarRegistro = async (tabla: string, id: string) => {
    if (userRole !== 'admin_general') return toast.error("⛔ Acceso Denegado");
    if(!confirm("¿Borrar permanentemente?")) return;
    const { error } = await supabase.from(tabla).delete().eq('id', id);
    if (!error) { toast.success("Eliminado"); fetchData(); }
  };

  // 2. ACTUALIZAR CUALQUIER ESTADO (Pago, Aptitud, etc)
  const actualizarEstadoEstudiante = async (tabla: string, id: string, campo: string, valor: string, nombreEst: string) => {
    if (userRole !== 'admin_general' && (campo === 'precio_final' || campo === 'precio_pactado')) {
      return toast.error("⛔ Solo Admin General edita precios.");
    }
    const { error } = await supabase.from(tabla).update({ [campo]: valor }).eq('id', id);
    if (error) { 
      console.error("Error actualizando:", error); 
      toast.error(`Error: ${error.message}`); 
    } else { 
      toast.success("Actualizado"); 
      registrarLog("Editó Dato", `Cambió ${campo} en ${nombreEst}`); 
      fetchData(); 
    }
  };

  // 3. ACTUALIZAR PRECIO DE CATÁLOGO
  const actualizarPrecioMaestro = async (id: string, nuevoPrecio: string) => {
    const { error } = await supabase.from('configuracion_cursos').update({ precio_base: nuevoPrecio }).eq('id', id);
    if (!error) { toast.success("Precio actualizado"); fetchData(); }
  };

  // 4. CAMBIAR ESTADO DE DOCUMENTOS
  const ejecutarCambioEstado = async (item: any, docId: string, docLabel: string, newState: string) => {
    const currentVerification = item.doc_verification || {};
    const timestamp = new Date().toLocaleString('es-CO');
    
    const newVerificationData = {
      ...currentVerification,
      [docId]: { status: newState, by: userName, at: timestamp }
    };

    const { error } = await supabase.from(item.origen).update({ doc_verification: newVerificationData }).eq('id', item.id);

    if (!error) {
      if(newState === 'approved') toast.success(`✅ ${docLabel} Aprobado`);
      if(newState === 'rejected') toast.error(`❌ ${docLabel} Rechazado`);
      
      await registrarLog(
        newState === 'approved' ? "Aprobó Documento" : "Rechazó Documento", 
        `${docLabel} de ${item.nombre} (${newState.toUpperCase()})`
      );
      fetchData();
    } else {
      toast.error("Error al guardar estado");
    }
  };

  // 5. DECIDIR QUÉ HACER CON EL DOCUMENTO (Llama al modal de ARL si es necesario)
  const toggleVerificacion = async (item: any, docId: string, docLabel: string, setModalARL: any) => {
    const currentVerification = item.doc_verification || {};
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