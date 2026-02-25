// ============================================================
// utils/formatters.ts
// Funciones puras de texto, fechas y cálculos.
// No tienen estado ni dependencias de React.
// ============================================================

// -----------------------------------------------------------
// TIPOS (para que TypeScript no se queje)
// -----------------------------------------------------------
interface CursoCatalogo {
  nombre_curso: string;
  precio_base: number | string;
}

interface CursoDetalle {
  curso: string;
  cantidad?: string | number;
}

interface Solicitud {
  cursos_detalles?: CursoDetalle[];
  curso?: string;
  numero_personas?: number;
}

// -----------------------------------------------------------
// formatFechaElegante
// Entrada:  "2026-03-15"
// Salida:   "Domingo, 15 de marzo"
// -----------------------------------------------------------
export const formatFechaElegante = (fechaStr: string): string => {
  const fecha = new Date(fechaStr + "T00:00:00");
  return fecha
    .toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/^\w/, (c) => c.toUpperCase());
};

// -----------------------------------------------------------
// obtenerPrecioBase
// Busca el precio de un curso en el catálogo.
// Si no lo encuentra, devuelve 180.000 como fallback.
// -----------------------------------------------------------
export const obtenerPrecioBase = (
  nombreCurso: string,
  catalogoCursos: CursoCatalogo[]
): number => {
  const curso = catalogoCursos.find((c) => c.nombre_curso === nombreCurso);
  return curso ? parseFloat(String(curso.precio_base)) : 180000;
};

// -----------------------------------------------------------
// calcularTotalSolicitud
// Calcula el valor total de una solicitud aplicando descuento.
// Ejemplo: calcularTotalSolicitud(solicitud, 10, catalogo)
// Devuelve: "540.000" (string formateado para Colombia)
// -----------------------------------------------------------
export const calcularTotalSolicitud = (
  sol: Solicitud,
  descuento: number,
  catalogoCursos: CursoCatalogo[]
): string => {
  let subtotal = 0;

  if (sol.cursos_detalles && Array.isArray(sol.cursos_detalles)) {
    // Solicitud multi-curso (empresas con varios cursos)
    sol.cursos_detalles.forEach((item) => {
      const base = obtenerPrecioBase(item.curso, catalogoCursos);
      subtotal += base * parseInt(String(item.cantidad ?? "1"));
    });
  } else {
    // Solicitud simple (un curso, una o varias personas)
    const base = obtenerPrecioBase(sol.curso ?? "", catalogoCursos);
    subtotal = base * (sol.numero_personas ?? 1);
  }

  const final = subtotal - subtotal * (descuento / 100);
  return final.toLocaleString("es-CO");
};