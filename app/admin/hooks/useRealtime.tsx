import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { FaClipboardList, FaCloudUploadAlt, FaTimes, FaUserPlus } from "react-icons/fa";

interface UseRealtimeProps {
  fetchData: () => void;
  setActiveTab: (tab: string) => void;
  setNotificacionesNuevas: React.Dispatch<React.SetStateAction<number>>;
}

export function useRealtime({ fetchData, setActiveTab, setNotificacionesNuevas }: UseRealtimeProps) {
  // Usamos useRef para el audio, así no se recarga en cada render
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicializamos el audio usando un archivo real en la carpeta /public
    // Si prefieres usar base64, reemplaza "/notificacion.mp3" con la cadena base64 válida.
    if (!audioRef.current) {
      audioRef.current = new Audio("/notificacion.mp3");
      audioRef.current.volume = 0.6;
    }

    const playNotificationSound = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reinicia el sonido por si suenan dos seguidos
        audioRef.current.play().catch(e => console.log("Audio bloqueado por navegador hasta interacción", e));
      }
    };

    const manejarNotificacion = (payload: any, tipo: 'solicitud' | 'nuevo_registro' | 'documentos') => {
      playNotificationSound();
      setNotificacionesNuevas((prev) => prev + 1);
      fetchData(); 

      const nombre = payload.new?.nombre?.split(' ')[0] || "Alguien";
      
      let titulo = "";
      let subtitulo = "";
      let icono = null;
      let gradienteBg = "";
      let iconoColor = "";

      switch (tipo) {
        case 'solicitud':
          titulo = "Nueva Solicitud Web";
          subtitulo = `${nombre} está interesado/a en un curso.`;
          icono = <FaClipboardList size={18} />;
          gradienteBg = "bg-gradient-to-br from-emerald-100 to-teal-50 border-emerald-200";
          iconoColor = "text-emerald-600 bg-white";
          break;
        case 'nuevo_registro':
          titulo = "Nuevo Estudiante Matriculado";
          subtitulo = `${nombre} se ha registrado en el sistema.`;
          icono = <FaUserPlus size={18} />;
          gradienteBg = "bg-gradient-to-br from-indigo-100 to-blue-50 border-indigo-200";
          iconoColor = "text-indigo-600 bg-white";
          break;
        case 'documentos':
          titulo = "Archivos Actualizados";
          subtitulo = `${nombre} ha subido nuevos documentos.`;
          icono = <FaCloudUploadAlt size={18} />;
          gradienteBg = "bg-gradient-to-br from-amber-100 to-orange-50 border-amber-200";
          iconoColor = "text-amber-600 bg-white";
          break;
      }

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-right-8 fade-in duration-300' : 'animate-out slide-out-to-right-8 fade-out duration-300'} 
          max-w-sm w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl pointer-events-auto flex flex-col overflow-hidden border border-slate-100`}
        >
          {/* Header del Toast */}
          <div className={`p-4 flex items-start gap-4 border-b ${gradienteBg}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${iconoColor}`}>
              {icono}
            </div>
            <div className="flex-1 pt-0.5 min-w-0">
              <p className="text-[13px] font-black text-slate-800 uppercase tracking-wide leading-tight">{titulo}</p>
              <p className="text-[12px] font-medium text-slate-600 mt-1 truncate">{subtitulo}</p>
            </div>
            <button 
              onClick={() => toast.dismiss(t.id)} 
              className="flex-shrink-0 bg-white/50 hover:bg-white text-slate-400 hover:text-slate-600 p-1.5 rounded-full transition-colors"
            >
              <FaTimes size={12}/>
            </button>
          </div>

          {/* Botón de Acción */}
          <button 
            onClick={() => {
              setActiveTab(tipo === 'solicitud' ? 'solicitudes' : 'lista');
              toast.dismiss(t.id);
              if (tipo !== 'solicitud') setNotificacionesNuevas(0); 
            }} 
            className="w-full bg-slate-50 hover:bg-slate-100 p-3 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase tracking-widest transition-colors"
          >
            Revisar Detalles ➔
          </button>
        </div>
      ), { duration: 5000, position: 'top-right' });
    };

    const channel = supabase
      .channel('tablero-admin-vivo')
      // ESCUCHAR PREINSCRIPCIONES (Nuevos registros y subida de documentos)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'preinscripciones' }, (payload: any) => {
          
          // 1. Si es un INSERT, alguien nuevo se registró
          if (payload.eventType === 'INSERT') {
            manejarNotificacion(payload, 'nuevo_registro');
          } 
          // 2. Si es un UPDATE, filtramos para que NO suene si el admin hace cambios.
          else if (payload.eventType === 'UPDATE') {
            const oldData = payload.old || {};
            const newData = payload.new || {};

            // IMPORTANTE: Para que esto funcione bien, debes ir a Supabase -> Database -> Tables -> preinscripciones 
            // -> Editar -> Activar "Replica Identity: Full". Así Supabase te enviará el 'oldData'.

            // Ejemplo de lógica para detectar si se subió un documento:
            // Verificamos si algún campo de documento cambió de vacío/null a tener una URL.
            // Ajusta los nombres ('doc_cc', 'doc_medico') a los que uses en tu base de datos.
            const subioDocumentos = (
              (newData.doc_cc && newData.doc_cc !== oldData.doc_cc) ||
              (newData.doc_medico && newData.doc_medico !== oldData.doc_medico) ||
              (newData.eps && newData.eps !== oldData.eps)
            );

            // También evitamos notificar si el cambio fue administrativo (ej: tú cambiaste el estado de pago)
            const esCambioAdministrativo = (newData.estado_pago !== oldData.estado_pago) || (newData.estado !== oldData.estado);

            if (subioDocumentos && !esCambioAdministrativo) {
              manejarNotificacion(payload, 'documentos');
            }
          }
      })
      // ESCUCHAR SOLICITUDES (Solo cuando insertan una nueva)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solicitudes' }, (payload: any) => {
          manejarNotificacion(payload, 'solicitud');
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, setActiveTab, setNotificacionesNuevas]); 
}