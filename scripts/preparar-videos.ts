// Convierte cada .mp4 de media-origen/ en un clip liviano + póster para la carta.
// Uso: pnpm preparar:videos  (requiere ffmpeg en el PATH)
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  argsPoster,
  argsVideo,
  armarTabla,
  videosDeOrigen,
  type FilaPeso,
} from "./videos.js";

const ORIGEN = "media-origen";
const DESTINO = join("apps", "carta", "public", "videos");

function fallar(mensaje: string): never {
  console.error(mensaje);
  process.exit(1);
}

function correrFfmpeg(args: string[]): void {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", ...args],
    {
      stdio: "inherit",
    },
  );
  if (r.status !== 0) fallar(`ffmpeg falló con: ffmpeg ${args.join(" ")}`);
}

const chequeo = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
if (chequeo.error || chequeo.status !== 0) {
  fallar("Instalá ffmpeg con: winget install Gyan.FFmpeg");
}

if (!existsSync(ORIGEN)) fallar(`No existe la carpeta ${ORIGEN}/`);
const videos = videosDeOrigen(readdirSync(ORIGEN));
if (videos.length === 0) fallar(`No hay archivos .mp4 en ${ORIGEN}/`);

mkdirSync(DESTINO, { recursive: true });
const filas: FilaPeso[] = [];

for (const { archivo, nombre } of videos) {
  const entrada = join(ORIGEN, archivo);
  const video = join(DESTINO, `${nombre}.mp4`);
  const poster = join(DESTINO, `${nombre}.jpg`);

  console.log(`→ ${nombre}`);
  correrFfmpeg(argsVideo(entrada, video));
  correrFfmpeg(argsPoster(entrada, poster));
  filas.push(
    { nombre: `${nombre}.mp4`, bytes: statSync(video).size },
    { nombre: `${nombre}.jpg`, bytes: statSync(poster).size },
  );
}

console.log(`\n${armarTabla(filas)}`);
