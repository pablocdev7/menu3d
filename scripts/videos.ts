// Lógica pura de preparar:videos: arma los argumentos de ffmpeg y la tabla final.
// No toca disco ni procesos, así se puede probar sin ffmpeg.
import { z } from "zod";

export const ANCHO = 720;
export const ALTO = 1280;

// Escala hasta cubrir 720x1280 y recorta lo que sobra, centrado.
const FILTRO_ENCUADRE = `scale=${ANCHO}:${ALTO}:force_original_aspect_ratio=increase,crop=${ANCHO}:${ALTO},setsar=1`;

// Nombre de archivo sin carpeta ni caracteres raros que rompan la URL pública.
const NombreMp4Schema = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*\.mp4$/i, "Nombre de video inválido");

export type VideoOrigen = { archivo: string; nombre: string };

// Se queda con los .mp4 válidos de un listado, con su nombre sin extensión, ordenados.
export function videosDeOrigen(archivos: string[]): VideoOrigen[] {
  return archivos
    .filter((archivo) => NombreMp4Schema.safeParse(archivo).success)
    .map((archivo) => ({ archivo, nombre: archivo.replace(/\.mp4$/i, "") }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// 5 s desde el segundo 1, H.264 crf 28 veryfast, 30 fps, sin audio y +faststart.
export function argsVideo(entrada: string, salida: string): string[] {
  return [
    "-y",
    "-ss",
    "1",
    "-i",
    entrada,
    "-t",
    "5",
    "-an",
    "-vf",
    `${FILTRO_ENCUADRE},fps=30`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    salida,
  ];
}

// Un cuadro del segundo 1,5 como JPG. En mjpeg, -q:v 5 equivale a calidad ~80.
export function argsPoster(entrada: string, salida: string): string[] {
  return [
    "-y",
    "-ss",
    "1.5",
    "-i",
    entrada,
    "-frames:v",
    "1",
    "-update",
    "1",
    "-vf",
    FILTRO_ENCUADRE,
    "-q:v",
    "5",
    salida,
  ];
}

// Peso legible en KB o MB con coma decimal ("850 KB", "1,2 MB").
export function formatearPeso(bytes: number): string {
  if (!Number.isInteger(bytes) || bytes < 0) {
    throw new Error(`Peso inválido: ${bytes}`);
  }
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1).replace(".", ",")} MB`;
}

export type FilaPeso = { nombre: string; bytes: number };

// Tabla de texto con columnas alineadas y una fila de total al final.
export function armarTabla(filas: FilaPeso[]): string {
  const total = filas.reduce((suma, fila) => suma + fila.bytes, 0);
  const datos: [string, string][] = [
    ["Archivo", "Peso"],
    ...filas.map((f): [string, string] => [f.nombre, formatearPeso(f.bytes)]),
    ["Total", formatearPeso(total)],
  ];
  const ancho = Math.max(...datos.map(([nombre]) => nombre.length));
  return datos
    .map(([nombre, peso]) => `${nombre.padEnd(ancho)}  ${peso}`)
    .join("\n");
}
