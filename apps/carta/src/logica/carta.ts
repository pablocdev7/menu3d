import {
  CartaSchema,
  formatearPrecio,
  type Alergeno,
  type Carta,
  type Categoria,
  type Etiqueta,
  type Plato,
} from "@menu3d/shared";
import { z } from "zod";

export const MENSAJE_ERROR_CARTA =
  "No pudimos cargar la carta. Volvé a escanear el QR o avisale al mozo.";

export type ResultadoCarta =
  { ok: true; carta: Carta } | { ok: false; error: string };

// Valida datos externos sin lanzar: la pantalla decide qué mostrar.
// `error` es el detalle técnico (para la consola), no el texto para el comensal.
export function cargarCarta(datos: unknown): ResultadoCarta {
  const resultado = CartaSchema.safeParse(datos);
  if (!resultado.success) {
    return { ok: false, error: z.prettifyError(resultado.error) };
  }
  return { ok: true, carta: resultado.data };
}

export interface Grupo {
  categoria: Categoria;
  platos: Plato[];
}

// Categorías ordenadas por `orden` (si empatan, quedan como vienen) con sus platos
// en el orden del JSON. Las categorías sin platos no se devuelven.
export function agruparPorCategoria(
  categorias: readonly Categoria[],
  platos: readonly Plato[],
): Grupo[] {
  const porCategoria = new Map<string, Plato[]>();
  for (const plato of platos) {
    const lista = porCategoria.get(plato.categoriaId);
    if (lista) lista.push(plato);
    else porCategoria.set(plato.categoriaId, [plato]);
  }
  return [...categorias]
    .sort((a, b) => a.orden - b.orden)
    .flatMap((categoria) => {
      const lista = porCategoria.get(categoria.id);
      return lista ? [{ categoria, platos: lista }] : [];
    });
}

// Record<…> obliga a TypeScript a exigir un texto por cada valor del enum.
const TEXTO_ETIQUETA: Record<Etiqueta, string> = {
  sin_tacc: "Sin TACC",
  vegano: "Vegano",
  vegetariano: "Vegetariano",
  picante: "Picante",
};

export function etiquetaLegible(etiqueta: Etiqueta): string {
  return TEXTO_ETIQUETA[etiqueta];
}

// "Sin TACC · Vegano"; vacío si no hay etiquetas.
export function lineaEtiquetas(etiquetas: readonly Etiqueta[]): string {
  return etiquetas.map(etiquetaLegible).join(" · ");
}

const TEXTO_ALERGENO: Record<Alergeno, string> = {
  gluten: "Gluten",
  crustaceos: "Crustáceos",
  huevo: "Huevo",
  pescado: "Pescado",
  mani: "Maní",
  soja: "Soja",
  lacteos: "Lácteos",
  frutos_de_cascara: "Frutos de cáscara",
  apio: "Apio",
  mostaza: "Mostaza",
  sesamo: "Sésamo",
  sulfitos: "Sulfitos",
  altramuces: "Altramuces",
  moluscos: "Moluscos",
};

export function alergenoLegible(alergeno: Alergeno): string {
  return TEXTO_ALERGENO[alergeno];
}

// "carne vacuna" → "Carne vacuna", para las filas de ingredientes.
export function capitalizar(texto: string): string {
  return texto.charAt(0).toLocaleUpperCase("es-AR") + texto.slice(1);
}

export const MENSAJE_CONSULTAR_ALERGENOS =
  "Consultá por alérgenos al personal.";

export type InfoAlergenos =
  | { tipo: "lista"; alergenos: string[] }
  | { tipo: "consultar"; mensaje: string };

// Solo mostramos alérgenos si el dueño los validó; si no, mandamos a consultar.
// Una lista vacía validada significa "sin alérgenos declarados".
export function infoAlergenos(
  plato: Pick<Plato, "alergenos" | "alergenosValidadosPorDueno">,
): InfoAlergenos {
  if (!plato.alergenosValidadosPorDueno) {
    return { tipo: "consultar", mensaje: MENSAJE_CONSULTAR_ALERGENOS };
  }
  return { tipo: "lista", alergenos: plato.alergenos.map(alergenoLegible) };
}

// Imagen fija para miniaturas: la foto, o el póster si es video. Sin imagen → null
// (la UI muestra el placeholder).
export function imagenDe(plato: Pick<Plato, "media">): string | null {
  const { media } = plato;
  if (!media) return null;
  if (media.tipo === "foto") return media.url;
  return media.poster ? media.poster : null;
}

export const TEXTO_AGOTADO = "Hoy no hay";

export function estaAgotado(plato: Pick<Plato, "disponible">): boolean {
  return !plato.disponible;
}

// Texto del precio en una sola línea: "Hoy no hay" si está agotado, el precio si hay
// un formato, o "desde …" con el más barato (de la misma moneda) si hay varios.
export function textoPrecio(
  plato: Pick<Plato, "disponible" | "formatos">,
): string {
  if (estaAgotado(plato)) return TEXTO_AGOTADO;
  const [primero, ...resto] = plato.formatos;
  if (!primero) return "";
  if (resto.length === 0) return formatearPrecio(primero.precio);
  const masBarato = resto
    .filter((f) => f.precio.moneda === primero.precio.moneda)
    .reduce(
      (min, f) => (f.precio.centavos < min.precio.centavos ? f : min),
      primero,
    );
  return `desde ${formatearPrecio(masBarato.precio)}`;
}
