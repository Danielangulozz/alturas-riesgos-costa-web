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
  tickets: any[];
  preinscripciones: any[];
  estudiantes: any[];
  solicitudes: any[];
  setNotifSolicitudes: Dispatch<SetStateAction<number>>;
}

export function useRealtime({ fetchData, setActiveTab, setNotifLista, setNotifTickets, setNotifSolicitudes, userName, userRole, tickets, preinscripciones, estudiantes, solicitudes }: UseRealtimeProps) {
  // Usamos refs para que las funciones no disparen la suscripción cada vez que cambian
  const fetchDataRef = useRef(fetchData);
  const setActiveTabRef = useRef(setActiveTab);
  const setNotifListaRef = useRef(setNotifLista);
  const setNotifTicketsRef = useRef(setNotifTickets);
  const setNotifSolicitudesRef = useRef(setNotifSolicitudes);

  const prevTicketsLength = useRef(tickets.length);
  const prevPreLength = useRef(preinscripciones.length);
  const prevEstLength = useRef(estudiantes.length);
  const prevSolLength = useRef(solicitudes.length);
  const isFirstRender = useRef(true);

  useEffect(() => {
    fetchDataRef.current = fetchData;
    setActiveTabRef.current = setActiveTab;
    setNotifListaRef.current = setNotifLista;
    setNotifTicketsRef.current = setNotifTickets;
    setNotifSolicitudesRef.current = setNotifSolicitudes;
  }, [fetchData, setActiveTab, setNotifLista, setNotifTickets, setNotifSolicitudes]);

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

      if (['nuevo_registro', 'documentos', 'solicitud', 'nuevo_estudiante'].includes(tipo)) {
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
      } else if (tipo === 'nuevo_registro' || tipo === 'nuevo_estudiante') {
        titulo = tipo === 'nuevo_estudiante' ? "Nuevo Estudiante" : "Nuevo Registro";
        subtitulo = tipo === 'nuevo_estudiante' ? `${nombre} fue matriculado.` : `${nombre} se pre-inscribió.`;
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
      // Configuramos el polling corto siempre como respaldo
      iniciarPolling(7000); // 7 segundos para no saturar

      supabase.removeAllChannels();
      
      channel = supabase
        .channel('live_db')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'preinscripciones' }, (payload) => {
          fetchDataRef.current(); // Dejamos que el polling manual lo detecte para evitar duplicados
        })
        .subscribe();
    };

    conectarRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [userName, userRole]);

  // Efecto para detectar cambios por Polling
  useEffect(() => {
    if (isFirstRender.current) {
      prevTicketsLength.current = tickets.length;
      prevPreLength.current = preinscripciones.length;
      prevEstLength.current = estudiantes.length;
      prevSolLength.current = solicitudes.length;
      isFirstRender.current = false;
      return;
    }

    const esReciente = (fechaISO: string) => {
      if (!fechaISO) return false;
      // Tolerancia de 15 minutos para evitar problemas de desfase horario (relojes desincronizados en producción)
      return Math.abs(new Date().getTime() - new Date(fechaISO).getTime()) < 900000; 
    };

    const yaNotificado = (tipo: string, id: string) => {
      if (!id) return true;
      const key = `arc_notif_${tipo}`;
      if (sessionStorage.getItem(key) === id) return true;
      sessionStorage.setItem(key, id);
      return false;
    };

    if (tickets.length > prevTicketsLength.current) {
      const nuevoTicket = tickets[0];
      if (nuevoTicket && esReciente(nuevoTicket.created_at) && !yaNotificado('ticket', nuevoTicket.id)) {
        setNotifTicketsRef.current(prev => prev + 1);
        if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); }
        toast.success(`Nuevo Ticket: ${nuevoTicket?.usuario || 'Alguien'} reportó algo.`, { duration: 5000 });
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try { 
            const n = new window.Notification('🔔 Nuevo Ticket', { body: `${nuevoTicket?.usuario || 'Alguien'} reportó algo.`, icon: '/LOGOSOLO.png', requireInteraction: true });
            n.onclick = () => { window.focus(); setActiveTabRef.current('tickets'); n.close(); };
          } catch (e) { }
        }
      }
    }

    if (preinscripciones.length > prevPreLength.current) {
      const nuevoPre = preinscripciones[0];
      if (nuevoPre && esReciente(nuevoPre.created_at || nuevoPre.fecha_registro) && !yaNotificado('pre', nuevoPre.id)) {
        setNotifListaRef.current(prev => prev + 1);
        if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); }
        toast.success(`Nueva Preinscripción Web: ${nuevoPre?.nombre || 'Alguien'}`, { duration: 5000 });
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try { 
            const n = new window.Notification('🔔 Nuevo Registro', { body: `${nuevoPre?.nombre || 'Alguien'} se pre-inscribió.`, icon: '/LOGOSOLO.png', requireInteraction: true });
            n.onclick = () => { window.focus(); setActiveTabRef.current('lista'); n.close(); };
          } catch (e) { }
        }
      }
    }

    if (estudiantes.length > prevEstLength.current) {
      const nuevoEst = estudiantes[0];
      if (nuevoEst && esReciente(nuevoEst.created_at) && !yaNotificado('est', nuevoEst.id)) {
        setNotifListaRef.current(prev => prev + 1);
        if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); }
        toast.success(`Nuevo Estudiante Matriculado: ${nuevoEst?.nombre || 'Alguien'}`, { duration: 5000 });
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try { 
            const n = new window.Notification('🔔 Nuevo Estudiante', { body: `${nuevoEst?.nombre || 'Alguien'} fue matriculado.`, icon: '/LOGOSOLO.png', requireInteraction: true });
            n.onclick = () => { window.focus(); setActiveTabRef.current('lista'); n.close(); };
          } catch (e) { }
        }
      }
    }

    if (solicitudes.length > prevSolLength.current) {
      const nuevaSol = solicitudes[0];
      if (nuevaSol && esReciente(nuevaSol.created_at) && !yaNotificado('sol', nuevaSol.id)) {
        setNotifSolicitudesRef.current(prev => prev + 1);
        if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); }
        toast.success(`Nueva Solicitud: ${nuevaSol?.nombre || 'Alguien'}`, { 
          duration: 5000,
          style: { background: '#8B5CF6', color: '#fff' },
          iconTheme: { primary: '#fff', secondary: '#8B5CF6' }
        });
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try { 
            const n = new window.Notification('🟣 Nueva Solicitud', { body: `${nuevaSol?.nombre || 'Alguien'} envió una solicitud.`, icon: '/LOGOSOLO.png', requireInteraction: true });
            n.onclick = () => { window.focus(); setActiveTabRef.current('solicitudes'); n.close(); };
          } catch (e) { }
        }
      }
    }

    prevTicketsLength.current = tickets.length;
    prevPreLength.current = preinscripciones.length;
    prevEstLength.current = estudiantes.length;
    prevSolLength.current = solicitudes.length;

  }, [tickets, preinscripciones, estudiantes, solicitudes]);
}