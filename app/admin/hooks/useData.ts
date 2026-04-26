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
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [logsPage, setLogsPage] = useState(0);

  const [hasMoreEstudiantes, setHasMoreEstudiantes] = useState(true);
  const [estudiantesPage, setEstudiantesPage] = useState(0);

  const fetchData = useCallback(async (esManual = false, search = "") => {
    if (esManual) setIsRefreshing(true);

    try {
      let queryEst = supabase.from('estudiantes').select('*').order('created_at', { ascending: false });
      let queryPre = supabase.from('preinscripciones').select('*').order('created_at', { ascending: false });

      if (search) {
        // Búsqueda en servidor si hay texto
        const filter = `nombre.ilike.%${search}%,cedula.ilike.%${search}%`;
        queryEst = queryEst.or(filter);
        queryPre = queryPre.or(filter);
        setHasMoreEstudiantes(false); // Al buscar, traemos lo que coincida de una vez
      } else {
        // Paginación si no hay búsqueda
        queryEst = queryEst.range(0, 19);
        queryPre = queryPre.range(0, 19);
        setEstudiantesPage(0);
        setHasMoreEstudiantes(true);
      }

      const [est, sol, age, cat, pre, logs, perf] = await Promise.allSettled([
        queryEst,
        supabase.from('solicitudes').select('*').order('created_at', { ascending: false }),
        supabase.from('agenda').select('*').order('fecha', { ascending: true }),
        supabase.from('configuracion_cursos').select('*'),
        queryPre,
        supabase.from('logs_actividad').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('*'),
      ]);

      if (est.status === 'fulfilled' && est.value.data) setEstudiantes(est.value.data);
      if (sol.status === 'fulfilled' && sol.value.data) setSolicitudes(sol.value.data);
      if (age.status === 'fulfilled' && age.value.data) setAgendaBD(age.value.data);
      if (cat.status === 'fulfilled' && cat.value.data) setCatalogoCursos(cat.value.data);
      if (pre.status === 'fulfilled' && pre.value.data) setPreinscripciones(pre.value.data);
      if (logs.status === 'fulfilled' && logs.value.data) {
        setLogsRecientes(logs.value.data);
        setLogsPage(0);
        setHasMoreLogs(true);
      }
      if (perf.status === 'fulfilled' && perf.value.data) setListaPerfiles(perf.value.data);

      if (esManual) toast.success("Base de datos sincronizada");
    } catch (error) {
      console.error(error);
      if (esManual) toast.error("Error al refrescar");
    } finally {
      if (esManual) setIsRefreshing(false);
    }
  }, []);

  const fetchMasEstudiantes = async () => {
    const nextPage = estudiantesPage + 1;
    const from = nextPage * 20;
    const to = from + 19;

    const [est, pre] = await Promise.all([
      supabase.from('estudiantes').select('*').order('created_at', { ascending: false }).range(from, to),
      supabase.from('preinscripciones').select('*').order('created_at', { ascending: false }).range(from, to)
    ]);

    const newEst = est.data || [];
    const newPre = pre.data || [];

    if (newEst.length < 20 && newPre.length < 20) setHasMoreEstudiantes(false);
    
    setEstudiantes(prev => [...prev, ...newEst]);
    setPreinscripciones(prev => [...prev, ...newPre]);
    setEstudiantesPage(nextPage);
  };

  const fetchMasLogs = async () => {
    const nextPage = logsPage + 1;
    const from = nextPage * 20;
    const to = from + 19;

    const { data, error } = await supabase
      .from('logs_actividad')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      if (data.length < 20) setHasMoreLogs(false);
      setLogsRecientes(prev => [...prev, ...data]);
      setLogsPage(nextPage);
    }
  };

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
    hasMoreLogs,
    fetchMasLogs,
    hasMoreEstudiantes,
    fetchMasEstudiantes,
    fetchData,
    historialInscripciones, // <-- Exportamos la gráfica aquí
  };
}