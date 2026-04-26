import React, { useEffect, useRef, Dispatch, SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { FaClipboardList, FaCloudUploadAlt, FaTimes, FaUserPlus, FaBug, FaCommentDots, FaBell } from "react-icons/fa";

interface UseRealtimeProps {
  fetchData: () => void;
  setActiveTab: (tab: string) => void;
  setNotifLista: Dispatch<SetStateAction<number>>;
  setNotifTickets: Dispatch<SetStateAction<number>>;
  userName?: string;
  userRole?: string;
}

export function useRealtime({ fetchData, setActiveTab, setNotifLista, setNotifTickets, userName, userRole }: UseRealtimeProps) {
  // Usamos refs para que las funciones no disparen la suscripción cada vez que cambian
  const fetchDataRef = useRef(fetchData);
  const setActiveTabRef = useRef(setActiveTab);
  const setNotifListaRef = useRef(setNotifLista);
  const setNotifTicketsRef = useRef(setNotifTickets);

  useEffect(() => {
    fetchDataRef.current = fetchData;
    setActiveTabRef.current = setActiveTab;
    setNotifListaRef.current = setNotifLista;
    setNotifTicketsRef.current = setNotifTickets;
  }, [fetchData, setActiveTab, setNotifLista, setNotifTickets]);

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio("/notificacion.mp3");
      audioRef.current.volume = 0.6;
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const playNotificationSound = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log("Audio bloqueado", e));
      }
    };

    const enviarNotificacionNativa = (titulo: string, cuerpo: string) => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(titulo, { body: cuerpo, icon: '/LOGOSOLO.png' });
        } catch (e) { }
      }
    };

    const manejarNotificacion = (payload: any, tipo: any) => {
      playNotificationSound();

      if (['nuevo_registro', 'documentos', 'solicitud'].includes(tipo)) {
        setNotifListaRef.current(prev => prev + 1);
      } else if (['ticket_nuevo', 'ticket_reabierto'].includes(tipo)) {
        setNotifTicketsRef.current(prev => prev + 1);
      }

      fetchDataRef.current();

      const nombre = payload.new?.nombre?.split(' ')[0] || "Alguien";
      let titulo = "Aviso";
      let subtitulo = "Hay cambios en el sistema";
      let icono = <FaBell size={18} />;
      let gradienteBg = "bg-gradient-to-br from-slate-100 to-slate-50 border-slate-200";
      let iconoColor = "text-slate-600 bg-white";

      if (tipo === 'solicitud') {
        titulo = "Nueva Solicitud Web";
        subtitulo = `${nombre} quiere inscribirse.`;
        icono = <FaClipboardList size={18} />;
        gradienteBg = "bg-gradient-to-br from-emerald-100 to-teal-50 border-emerald-200";
        iconoColor = "text-emerald-600 bg-white";
      } else if (tipo === 'nuevo_registro') {
        titulo = "Nuevo Registro";
        subtitulo = `${nombre} se pre-inscribió.`;
        icono = <FaUserPlus size={18} />;
        gradienteBg = "bg-gradient-to-br from-indigo-100 to-blue-50 border-indigo-200";
        iconoColor = "text-indigo-600 bg-white";
      } else if (tipo === 'documentos') {
        titulo = "Archivos Subidos";
        subtitulo = `${nombre} envió documentos.`;
        icono = <FaCloudUploadAlt size={18} />;
        gradienteBg = "bg-gradient-to-br from-amber-100 to-orange-50 border-amber-200";
        iconoColor = "text-amber-600 bg-white";
      } else if (tipo === 'ticket_nuevo') {
        titulo = "Nuevo Ticket";
        subtitulo = `${payload.new.usuario} reportó un error.`;
        icono = <FaBug size={18} />;
        gradienteBg = "bg-gradient-to-br from-indigo-100 to-slate-50 border-indigo-200";
        iconoColor = "text-indigo-600 bg-white";
      }

      enviarNotificacionNativa(`🔔 ${titulo}`, subtitulo);

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in slide-in-from-right-8' : 'animate-out slide-out-to-right-8'} max-w-sm w-full bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-slate-100 pointer-events-auto`}>
          <div className={`p-4 flex items-start gap-4 ${gradienteBg}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${iconoColor}`}>{icono}</div>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-800 uppercase leading-tight">{titulo}</p>
              <p className="text-[11px] text-slate-600 mt-1">{subtitulo}</p>
            </div>
            <button onClick={() => toast.dismiss(t.id)} className="text-slate-400 p-1"><FaTimes size={12} /></button>
          </div>
          <button
            onClick={() => {
              if (tipo.includes('ticket')) setActiveTabRef.current('tickets');
              else if (tipo === 'solicitud') setActiveTabRef.current('solicitudes');
              else setActiveTabRef.current('lista');
              toast.dismiss(t.id);
            }}
            className="w-full bg-slate-50 p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest"
          >
            Revisar Ahora ➔
          </button>
        </div>
      ), { duration: 6000, position: 'top-right' });
    };

    console.log("📡 Iniciando Sincronizador Maestro...");

    let channel: any;
    let fallbackInterval: any;
    let reintentos = 0;

    const iniciarPolling = (ms: number) => {
      if (fallbackInterval) clearInterval(fallbackInterval);
      console.log(`🛡️ Modo Seguro: Refresco cada ${ms/1000}s`);
      fallbackInterval = setInterval(() => {
        fetchDataRef.current();
      }, ms);
    };

    const conectarRealtime = () => {
      // Si ya hemos fallado mucho, nos quedamos en Polling rápido y no molestamos más
      if (reintentos > 3) {
        iniciarPolling(5000); 
        return;
      }

      supabase.removeAllChannels();
      
      channel = supabase
        .channel('live_db')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'preinscripciones' }, (payload) => {
          console.log("⚡ [Realtime] Cambio en registros");
          manejarNotificacion(payload, payload.eventType === 'INSERT' ? 'nuevo_registro' : 'documentos');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets_soporte' }, (payload) => {
          console.log("⚡ [Realtime] Cambio en tickets");
          if (payload.eventType === 'INSERT') manejarNotificacion(payload, 'ticket_nuevo');
          else fetchDataRef.current();
        })
        .subscribe(async (status) => {
          console.log("📡 Estado:", status);
          
          if (status === 'SUBSCRIBED') {
            reintentos = 0;
            console.log("✅ ¡CONECTADO AL 100%!");
            // Si conecta, bajamos el polling a 30s solo por si acaso
            iniciarPolling(30000);
          }

          if (status === 'TIMED_OUT') {
            reintentos++;
            iniciarPolling(5000); // Falla Realtime -> Polling cada 5s
            if (reintentos <= 3) {
              console.warn(`retry ${reintentos}...`);
              setTimeout(conectarRealtime, 5000);
            }
          }
        });
    };

    conectarRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [userName, userRole]);
}