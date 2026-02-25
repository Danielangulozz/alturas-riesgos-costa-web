import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { FaClipboardList, FaCloudUploadAlt, FaTimes } from "react-icons/fa";

interface UseRealtimeProps {
  fetchData: () => void;
  setActiveTab: (tab: string) => void;
  setNotificacionesNuevas: React.Dispatch<React.SetStateAction<number>>;
}

export function useRealtime({ fetchData, setActiveTab, setNotificacionesNuevas }: UseRealtimeProps) {
  useEffect(() => {
    const playNotificationSound = () => {
      try {
        const audio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIQAykpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKS//OEAAABAAAAAgAAAAAA/84QAAABAAAAAgAAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//OEZAAAA4gAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA");
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio bloqueado por navegador hasta interacción", e));
      } catch (err) {
        console.error("Error audio", err);
      }
    };

    const manejarNotificacion = (payload: any, origen: string) => {
      playNotificationSound();
      setNotificacionesNuevas((prev) => prev + 1);
      fetchData(); 

      const nombre = payload.new.nombre || "Nuevo Usuario";
      const esSolicitud = origen === 'solicitud';
      const titulo = esSolicitud ? "¡Nueva Solicitud Web!" : "Actualización de Archivos";
      const subtitulo = esSolicitud ? "Quiere información de cursos" : "Ha cargado documentos";
      const colorBorde = esSolicitud ? "border-emerald-500" : "border-blue-500";
      const icono = esSolicitud ? <FaClipboardList size={20} className="text-emerald-600"/> : <FaCloudUploadAlt size={20} className="text-blue-600"/>;
      const bgIcono = esSolicitud ? "bg-emerald-100" : "bg-blue-100";

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5 border-l-4 ${colorBorde}`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bgIcono}`}>
                  {icono}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{titulo}</p>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-bold">{nombre}</span> {subtitulo}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button onClick={() => toast.dismiss(t.id)} className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
          <div className="flex border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button 
              onClick={() => {
                setActiveTab(esSolicitud ? 'solicitudes' : 'lista');
                toast.dismiss(t.id);
                if (!esSolicitud) setNotificacionesNuevas(0); 
              }} 
              className="w-full rounded-b-2xl p-3 flex items-center justify-center text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-100 transition-colors"
            >
              Ver Detalles Ahora
            </button>
          </div>
        </div>
      ), { duration: 6000, position: 'top-right' });
    };

    const channel = supabase
      .channel('tablero-admin-vivo')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'preinscripciones' }, (payload: any) => {
           if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') manejarNotificacion(payload, 'preinscripcion');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, (payload: any) => {
           if (payload.eventType === 'INSERT') manejarNotificacion(payload, 'solicitud');
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, setActiveTab, setNotificacionesNuevas]); // <-- Importante este arreglo de dependencias
}