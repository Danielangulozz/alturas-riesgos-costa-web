// ============================================================
// hooks/useData.ts
// Encargado de traer toda la información de la base de datos.
// ============================================================
"use client";

import { useState, useCallback } from "react";
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

  // Usamos useCallback para que la función no se re-cree infinitamente
  const fetchData = useCallback(async (esManual = false) => {
    if (esManual) setIsRefreshing(true);

    try {
      const { data: est } = await supabase.from('estudiantes').select('*').order('created_at', { ascending: false });
      const { data: sol } = await supabase.from('solicitudes').select('*').order('created_at', { ascending: false });
      const { data: age } = await supabase.from('agenda').select('*').order('fecha', { ascending: true });
      const { data: cat } = await supabase.from('configuracion_cursos').select('*');
      const { data: pre } = await supabase.from('preinscripciones').select('*').order('created_at', { ascending: false });
      const { data: logs } = await supabase.from('logs_actividad').select('*').order('created_at', { ascending: false }).limit(20);
      const { data: perf } = await supabase.from('profiles').select('*');

      if (perf) setListaPerfiles(perf);
      if (est) setEstudiantes(est);
      if (sol) setSolicitudes(sol);
      if (age) setAgendaBD(age);
      if (cat) setCatalogoCursos(cat);
      if (pre) setPreinscripciones(pre);
      if (logs) setLogsRecientes(logs);

      if (esManual) toast.success("Base de datos sincronizada");
    } catch (error) {
      console.error(error);
      if (esManual) toast.error("Error al refrescar");
    } finally {
      if (esManual) setIsRefreshing(false);
    }
  }, []);

  return {
    isRefreshing,
    listaPerfiles,
    estudiantes,
    preinscripciones,
    solicitudes,
    agendaBD,
    catalogoCursos,
    logsRecientes,
    fetchData
  };
}