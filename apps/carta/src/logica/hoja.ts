// Lógica de las hojas inferiores (sin DOM, para poder probarla).

export type Altura = "media" | "completa";
export type Destino = Altura | "cerrada";

// Debe coincidir con --duracion en estilos.css.
export const DURACION_MS = 400;
// Cuántos píxeles hay que arrastrar para cambiar de altura.
export const UMBRAL_PX = 80;
// Si se arrastra hacia abajo más de esta fracción de la hoja, se cierra directo.
export const FRACCION_CIERRE = 0.6;

// Decide dónde queda la hoja al soltarla. `deltaY` > 0 es hacia abajo.
export function destinoAlSoltar(
  actual: Altura,
  deltaY: number,
  altoPx: number,
): Destino {
  if (!Number.isFinite(deltaY)) return actual;
  if (altoPx > 0 && deltaY > altoPx * FRACCION_CIERRE) return "cerrada";
  if (deltaY > UMBRAL_PX) return actual === "completa" ? "media" : "cerrada";
  if (deltaY < -UMBRAL_PX) return "completa";
  return actual;
}

// Cuánto se plegó el título grande: 0 arriba de todo, 1 tras `rangoPx` de scroll.
export const RANGO_TITULO_PX = 48;

export function progresoTitulo(
  scrollTop: number,
  rangoPx = RANGO_TITULO_PX,
): number {
  if (!Number.isFinite(scrollTop) || rangoPx <= 0) return 0;
  return Math.min(1, Math.max(0, scrollTop / rangoPx));
}

export function alternarAltura(actual: Altura): Altura {
  return actual === "media" ? "completa" : "media";
}
