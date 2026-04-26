// ============================================================
// hooks/useAuth.ts
// Todo lo relacionado a autenticación y sesión del usuario.
// Quién eres, qué rol tienes, y cómo cerrar sesión.
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// -----------------------------------------------------------
// TIPOS
// -----------------------------------------------------------
export interface AuthData {
  userEmail: string | undefined;
  userName: string;
  userRole: string;
  horaIngreso: string;
  loading: boolean;
  cerrarSesion: () => Promise<void>;
  registrarLog: (accion: string, detalles: string) => Promise<void>;
  currentSessionSeconds: number;
}

// -----------------------------------------------------------
// HOOK
// -----------------------------------------------------------
export function useAuth(): AuthData {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | undefined>("");
  const [userName, setUserName] = useState("Cargando...");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);

  // Se calcula una sola vez al montar el componente
  const [horaIngreso] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  // -----------------------------------------------------------
  // registrarLog
  // Guarda una acción en la tabla logs_actividad.
  // Se exporta para que useData y otros hooks puedan usarla.
  // -----------------------------------------------------------
  const registrarLog = async (accion: string, detalles: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const idUsuario = `[${userRole.toUpperCase() || "?"}] ${userName || session.user.email}`;

    await supabase.from("logs_actividad").insert([{
      usuario_id: session.user.id,
      nombre_usuario: idUsuario,
      accion,
      detalles,
    }]);
  };

  // -----------------------------------------------------------
  // cerrarSesion
  // Calcula el tiempo de sesión, registra la salida y redirige.
  // -----------------------------------------------------------
  const cerrarSesion = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Calcular tiempo desde localStorage
        const storageKey = `admin_session_${session.user.email}`;
        const stored = localStorage.getItem(storageKey);
        let totalSecs = 0;
        if (stored) {
           const data = JSON.parse(stored);
           const todayStr = new Date().toLocaleDateString('en-CA');
           if (data.date === todayStr) {
             totalSecs = data.totalSeconds || 0;
           }
           // Guardar hora exacta de cierre
           data.lastLogout = new Date().toISOString();
           localStorage.setItem(storageKey, JSON.stringify(data));
        }

        let detalleTiempo = "Cierre de sesión";
        if (totalSecs > 0) {
          const horas = Math.floor(totalSecs / 3600);
          const mins = Math.floor((totalSecs % 3600) / 60);
          detalleTiempo = `Cierre de sesión. Tiempo total hoy: ${horas}h ${mins}m`;
        }

        const etiqueta = `[${userRole.toUpperCase()}] ${userName}`;
        await supabase.from("logs_actividad").insert([{
          usuario_id: session.user.id,
          nombre_usuario: etiqueta,
          accion: "SALIDA",
          detalles: detalleTiempo,
        }]);
      }

      await supabase.auth.signOut();
      router.push("/admin/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      router.push("/admin/login");
    }
  };

  // -----------------------------------------------------------
  // checkUser
  // Verifica sesión activa, carga el perfil y registra ingreso.
  // Si no hay sesión, redirige al login.
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      setUserEmail(session.user.email);

      const { data: perfil } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      const nombreFinal = perfil?.full_name || "Admin/Instructor";
      const rolFinal = perfil?.role || "trainer";

      setUserName(nombreFinal);
      setUserRole(rolFinal);

      // Registrar ingreso inteligentemente (evitar spam por recargar)
      const storageKey = `admin_session_${session.user.email}`;
      const stored = localStorage.getItem(storageKey);
      let isNewSession = true;
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const timeSinceLast = Date.now() - (data.lastTimestamp || 0);
          // Si han pasado menos de 5 min (300,000 ms) sin cerrar, es solo recarga
          if (timeSinceLast < 300000 && !data.lastLogout) {
            isNewSession = false;
          }
        } catch (e) {}
      }

      if (isNewSession) {
        const etiquetaLog = `[${rolFinal.toUpperCase()}] ${nombreFinal}`;
        await supabase.from("logs_actividad").insert([{
          usuario_id: session.user.id,
          nombre_usuario: etiquetaLog,
          accion: "INGRESO",
          detalles: "Sesión iniciada.",
        }]);
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  // --- CONTADOR GLOBAL DE SESIÓN ---
  useEffect(() => {
    if (!userEmail) return;

    const storageKey = `admin_session_${userEmail}`;
    const todayStr = new Date().toLocaleDateString('en-CA');
    const sessionStart = Date.now();

    // Cargar inicial
    const stored = localStorage.getItem(storageKey);
    let initialTotal = 0;
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.date === todayStr) initialTotal = data.totalSeconds || 0;
      } catch (e) {}
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStart) / 1000);
      setCurrentSessionSeconds(elapsed);

      // Persistir cada 5 segundos
      if (elapsed % 5 === 0) {
        const currentStored = localStorage.getItem(storageKey);
        let baseTotal = initialTotal;
        let originalDisplay = "Sesión en curso";
        
        if (currentStored) {
          try {
            const parsed = JSON.parse(currentStored);
            if (parsed.date === todayStr) {
               // No sobreescribir si ya hay más segundos (por otras pestañas abiertas tal vez)
               // Pero aquí asumimos una sola pestaña principal
               originalDisplay = parsed.originalDisplayTime || "Sesión en curso";
            }
          } catch(e) {}
        }

        const dataToStore: any = {
          date: todayStr,
          totalSeconds: baseTotal + elapsed,
          lastSessionEnd: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          lastTimestamp: Date.now(),
          originalDisplayTime: originalDisplay
        };

        // Preservar el último logout si existía
        if (currentStored) {
          try {
            const p = JSON.parse(currentStored);
            if (p.lastLogout) dataToStore.lastLogout = p.lastLogout;
          } catch(e) {}
        }

        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userEmail]);

  return {
    userEmail,
    userName,
    userRole,
    horaIngreso,
    loading,
    cerrarSesion,
    registrarLog,
    currentSessionSeconds,
  };
}