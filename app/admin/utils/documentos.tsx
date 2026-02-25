// ============================================================
// utils/documentos.ts
// Lógica relacionada a documentación de estudiantes.
// Qué documentos requiere cada curso y cómo obtener su URL.
// ============================================================

import { FaIdCard, FaShieldVirus, FaFileMedical, FaFilePdf } from "react-icons/fa";
import { JSX } from "react";

// -----------------------------------------------------------
// TIPOS
// -----------------------------------------------------------
export interface DocRequerido {
  id: string;
  label: string;
  oldId: string | null;
  icon: JSX.Element;
}

// -----------------------------------------------------------
// obtenerRequeridos
// Recibe el nombre del curso y devuelve la lista de documentos
// que ese curso exige. Algunos cursos piden docs extra.
//
// Ejemplo:
//   obtenerRequeridos("Reentrenamiento en trabajo en alturas")
//   → [...docs base, { id: 'url_cert_altura', label: 'Cert. Altura' }]
// -----------------------------------------------------------
export const obtenerRequeridos = (curso: string): DocRequerido[] => {
  const c = (curso || "").toLowerCase();

  // Documentos base que todo curso requiere
  const reqs: DocRequerido[] = [
    { id: "url_cc",  label: "Cédula",  oldId: "url_cedula",           icon: <FaIdCard /> },
    { id: "url_arl", label: "ARL",     oldId: "url_seguridad_social", icon: <FaShieldVirus /> },
    { id: "url_emo", label: "Médico",  oldId: "url_medico",           icon: <FaFileMedical /> },
    { id: "url_eps", label: "EPS",     oldId: "url_seguridad_social", icon: <FaShieldVirus /> },
  ];

  // Cursos que además piden certificado de altura previo
  if (
    c.includes("reentrenamiento") ||
    c.includes("coordinador") ||
    c.includes("jefe")
  ) {
    reqs.push({
      id: "url_cert_altura",
      label: "Cert. Altura",
      oldId: "url_cert_altura",
      icon: <FaFilePdf />,
    });
  }

  // Cursos que además piden certificado SST 20 horas
  if (c.includes("coordinador") || c.includes("jefe")) {
    reqs.push({
      id: "url_cert_sst",
      label: "SST 20h",
      oldId: "url_cert_sst",
      icon: <FaFilePdf />,
    });
  }

  return reqs;
};

// -----------------------------------------------------------
// getDocUrl
// Busca la URL de un documento en el objeto del estudiante.
// Primero busca por el ID nuevo, si no existe busca el ID viejo
// (para compatibilidad con registros antiguos de la BD).
//
// Ejemplo:
//   getDocUrl(estudiante, 'url_cc', 'url_cedula')
//   → "https://supabase.../cedula.jpg" o null
// -----------------------------------------------------------
export const getDocUrl = (
  item: Record<string, any>,
  docId: string,
  oldId: string | null
): string | null => {
  return item[docId] || (oldId ? item[oldId] : null);
};