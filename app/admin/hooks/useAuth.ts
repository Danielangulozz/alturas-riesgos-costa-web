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
    if (!confirm("¿Cerrar sesión ahora?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Buscar el último ingreso para calcular duración
        const { data: ultimoLog } = await supabase
          .from("logs_actividad")
          .select("created_at")
          .eq("usuario_id", session.user.id)
          .eq("accion", "INGRESO")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        let detalleTiempo = "Duración no calculada";

        if (ultimoLog) {
          const entrada = new Date(ultimoLog.created_at);
          const salida = new Date();
          const diffMs = salida.getTime() - entrada.getTime();
          const mins = Math.floor(diffMs / 60000);
          const horas = Math.floor(mins / 60);
          detalleTiempo = `Duración de sesión: ${horas}h ${mins % 60}m`;
        }

        const etiqueta = `[${userRole.toUpperCase()}] ${userName}`;
        await supabase.from("logs_actividad").insert([{
          usuario_id: session.user.id,
          nombre_usuario: etiqueta,
          accion: "SALIDA",
          detalles: `Cierre de sesión voluntario. ${detalleTiempo}`,
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
  // -----------------------------------------------------------
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

      // Registrar ingreso con etiqueta de rol
      const etiquetaLog = `[${rolFinal.toUpperCase()}] ${nombreFinal}`;
      await supabase.from("logs_actividad").insert([{
        usuario_id: session.user.id,
        nombre_usuario: etiquetaLog,
        accion: "INGRESO",
        detalles: "Sesión iniciada.",
      }]);

      setLoading(false);
    };

    checkUser();
  }, [router]);

  return {
    userEmail,
    userName,
    userRole,
    horaIngreso,
    loading,
    cerrarSesion,
    registrarLog,
  };
}