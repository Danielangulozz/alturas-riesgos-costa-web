// ============================================================
// hooks/useData.ts
// ============================================================
"use client";

import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [listaPerfiles, setListaPerfiles] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [preinscripciones, setPreinscripciones] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [agendaBD, setAgendaBD] = useState<any[]>([]);
  const [catalogoCursos, setCatalogoCursos] = useState<any[]>([]);
  const [logsRecientes, setLogsRecientes] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [logsPage, setLogsPage] = useState(0);

  const [hasMoreEstudiantes, setHasMoreEstudiantes] = useState(true);
  const [estudiantesPage, setEstudiantesPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const fetchData = useCallback(async (esManual = false, searchOverride?: string) => {
    if (esManual) setIsRefreshing(true);
    const searchToUse = searchOverride !== undefined ? searchOverride : busqueda;

    try {
      let queryEst = supabase.from('estudiantes').select('*').order('created_at', { ascending: false });
      let queryPre = supabase.from('preinscripciones').select('*').order('created_at', { ascending: false });

      // Obtener conteo total
      const [countEst, countPre] = await Promise.all([
        supabase.from('estudiantes').select('*', { count: 'exact', head: true }),
        supabase.from('preinscripciones').select('*', { count: 'exact', head: true })
      ]);
      setTotalRegistros((countEst.count || 0) + (countPre.count || 0));

      if (searchToUse) {
        const filter = `nombre.ilike.%${searchToUse}%,cedula.ilike.%${searchToUse}%,telefono.ilike.%${searchToUse}%,curso.ilike.%${searchToUse}%,empresa.ilike.%${searchToUse}%`;
        queryEst = queryEst.or(filter);
        queryPre = queryPre.or(filter);
        setHasMoreEstudiantes(false);
      } else {
        queryEst = queryEst.range(0, 19);
        queryPre = queryPre.range(0, 19);
        setEstudiantesPage(0);
        setHasMoreEstudiantes(true);
      }

      const [est, sol, age, cat, pre, logs, perf, tck] = await Promise.allSettled([
        queryEst,
        supabase.from('solicitudes').select('*').order('created_at', { ascending: false }),
        supabase.from('agenda').select('*').order('fecha', { ascending: true }),
        supabase.from('configuracion_cursos').select('*'),
        queryPre,
        supabase.from('logs_actividad').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('*'),
        supabase.from('tickets_soporte').select('*').order('created_at', { ascending: false })
      ]);

      if (est.status === 'fulfilled' && est.value.data) setEstudiantes(est.value.data);
      if (sol.status === 'fulfilled' && sol.value.data) setSolicitudes(sol.value.data);
      if (age.status === 'fulfilled' && age.value.data) setAgendaBD(age.value.data);
      if (cat.status === 'fulfilled' && cat.value.data) setCatalogoCursos(cat.value.data);
      if (pre.status === 'fulfilled' && pre.value.data) setPreinscripciones(pre.value.data);
      if (tck.status === 'fulfilled' && tck.value.data) setTickets(tck.value.data);
      if (logs.status === 'fulfilled' && logs.value.data) {
        setLogsRecientes(logs.value.data);
        setLogsPage(0);
        setHasMoreLogs(true);
      }
      if (perf.status === 'fulfilled' && perf.value.data) setListaPerfiles(perf.value.data);
      if (tck.status === 'fulfilled' && tck.value.data) setTickets(tck.value.data);

      if (esManual) toast.success("Base de datos sincronizada");
    } catch (error) {
      console.error(error);
      if (esManual) toast.error("Error al refrescar");
    } finally {
      if (esManual) setIsRefreshing(false);
    }
  }, [busqueda]);

  const fetchMasEstudiantes = async () => {
    setIsLoadingMore(true);
    try {
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
    } finally {
      setIsLoadingMore(false);
    }
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

  const historialInscripciones = useMemo(() => {
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const ultimos6Meses: any[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      ultimos6Meses.push({
        mes: mesesNombres[d.getMonth()],
        year: d.getFullYear(),
        inscritos: 0
      });
    }

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

    return ultimos6Meses.map(item => ({
      mes: item.mes,
      inscritos: item.inscritos
    }));
  }, [preinscripciones]);

  const updateLocalItem = useCallback((id: string, origen: string, newData: any) => {
    const setter = origen === 'preinscripciones' ? setPreinscripciones : setEstudiantes;
    setter(prev => prev.map(item => item.id === id ? { ...item, ...newData } : item));
  }, []);

  return {
    isRefreshing,
    isLoadingMore,
    totalRegistros,
    listaPerfiles,
    estudiantes,
    preinscripciones,
    solicitudes,
    agendaBD,
    catalogoCursos,
    logsRecientes,
    tickets,
    setTickets,
    hasMoreLogs,
    fetchMasLogs,
    hasMoreEstudiantes,
    fetchMasEstudiantes,
    fetchData,
    historialInscripciones,
    busqueda,
    setBusqueda,
    updateLocalItem
  };
}
