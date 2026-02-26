// ============================================================
// hooks/useData.ts
// ============================================================
"use client";

import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listaPerfiles, setListaPerfiles] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [preinscripciones, setPreinscripciones] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [agendaBD, setAgendaBD] = useState<any[]>([]);
  const [catalogoCursos, setCatalogoCursos] = useState<any[]>([]);
  const [logsRecientes, setLogsRecientes] = useState<any[]>([]);

  const fetchData = useCallback(async (esManual = false) => {
    if (esManual) setIsRefreshing(true);

    try {
      const [est, sol, age, cat, pre, logs, perf] = await Promise.allSettled([
        supabase.from('estudiantes').select('*').order('created_at', { ascending: false }),
        supabase.from('solicitudes').select('*').order('created_at', { ascending: false }),
        supabase.from('agenda').select('*').order('fecha', { ascending: true }),
        supabase.from('configuracion_cursos').select('*'),
        supabase.from('preinscripciones').select('*').order('created_at', { ascending: false }),
        supabase.from('logs_actividad').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('*'),
      ]);

      if (est.status === 'fulfilled' && est.value.data) setEstudiantes(est.value.data);
      if (sol.status === 'fulfilled' && sol.value.data) setSolicitudes(sol.value.data);
      if (age.status === 'fulfilled' && age.value.data) setAgendaBD(age.value.data);
      if (cat.status === 'fulfilled' && cat.value.data) setCatalogoCursos(cat.value.data);
      if (pre.status === 'fulfilled' && pre.value.data) setPreinscripciones(pre.value.data);
      if (logs.status === 'fulfilled' && logs.value.data) setLogsRecientes(logs.value.data);
      if (perf.status === 'fulfilled' && perf.value.data) setListaPerfiles(perf.value.data);

      if (esManual) toast.success("Base de datos sincronizada");
    } catch (error) {
      console.error(error);
      if (esManual) toast.error("Error al refrescar");
    } finally {
      if (esManual) setIsRefreshing(false);
    }
  }, []);

  // ============================================================
  // NUEVO: LÓGICA DE LA GRÁFICA (Últimos 6 meses)
  // ============================================================
  const historialInscripciones = useMemo(() => {
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const ultimos6Meses: any[] = [];

    // 1. Armar los últimos 6 meses vacíos
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      ultimos6Meses.push({
        mes: mesesNombres[d.getMonth()],
        year: d.getFullYear(),
        inscritos: 0
      });
    }

    // 2. Llenarlos con los datos reales de preinscripciones
    preinscripciones.forEach((est: any) => {
      const fechaString = est.fecha_registro || est.created_at; 
      if (!fechaString) return;

      const fecha = new Date(fechaString);
      const mesNombre = mesesNombres[fecha.getMonth()];
      const year = fecha.getFullYear();

      const index = ultimos6Meses.findIndex(m => m.mes === mesNombre && m.year === year);
      if (index !== -1) {
        ultimos6Meses[index].inscritos += 1;
      }
    });

    // 3. Devolver solo lo que necesita la gráfica
    return ultimos6Meses.map(item => ({
      mes: item.mes,
      inscritos: item.inscritos
    }));
  }, [preinscripciones]); // Se recalcula cada vez que hay una nueva preinscripción

  return {
    isRefreshing,
    listaPerfiles,
    estudiantes,
    preinscripciones,
    solicitudes,
    agendaBD,
    catalogoCursos,
    logsRecientes,
    fetchData,
    historialInscripciones, // <-- Exportamos la gráfica aquí
  };
}