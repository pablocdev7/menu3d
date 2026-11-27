import { describe, expect, it } from "vitest";
import {
  argsPoster,
  argsVideo,
  armarTabla,
  formatearPeso,
  videosDeOrigen,
} from "./videos.js";

// Devuelve el valor que sigue a una opción de ffmpeg ("-crf" → "28").
const valor = (args: string[], opcion: string) =>
  args[args.indexOf(opcion) + 1];

describe("videosDeOrigen", () => {
  it("toma los .mp4 (sin importar mayúsculas), quita la extensión y ordena", () => {
    expect(
      videosDeOrigen(["pinchos.mp4", "bifes.MP4", "vaso-wishky.mp4"]),
    ).toEqual([
      { archivo: "bifes.MP4", nombre: "bifes" },
      { archivo: "pinchos.mp4", nombre: "pinchos" },
      { archivo: "vaso-wishky.mp4", nombre: "vaso-wishky" },
    ]);
  });

  it("descarta otros formatos y nombres con espacios o rutas", () => {
    expect(
      videosDeOrigen([
        "foto.jpg",
        "con espacio.mp4",
        "../fuera.mp4",
        ".mp4",
        "notas.txt",
      ]),
    ).toEqual([]);
  });
});

describe("argsVideo", () => {
  const args = argsVideo("media-origen/a.mp4", "salida/a.mp4");

  it("recorta 5 s desde el segundo 1 a 720x1280, H.264 crf 28, 30 fps, sin audio", () => {
    expect(valor(args, "-ss")).toBe("1");
    expect(valor(args, "-t")).toBe("5");
    expect(valor(args, "-c:v")).toBe("libx264");
    expect(valor(args, "-crf")).toBe("28");
    expect(valor(args, "-preset")).toBe("veryfast");
    expect(valor(args, "-movflags")).toBe("+faststart");
    expect(valor(args, "-vf")).toContain("crop=720:1280");
    expect(valor(args, "-vf")).toContain("fps=30");
    expect(args).toContain("-an");
    expect(args.at(-1)).toBe("salida/a.mp4");
  });

  it("no deja audio ni re-escalado sin recorte", () => {
    expect(args).not.toContain("-c:a");
    expect(valor(args, "-vf")).not.toMatch(/scale=720:1280(,|$)/);
  });
});

describe("argsPoster", () => {
  const args = argsPoster("a.mp4", "a.jpg");

  it("saca un solo cuadro del segundo 1,5 a 720x1280 con calidad ~80", () => {
    expect(valor(args, "-ss")).toBe("1.5");
    expect(valor(args, "-frames:v")).toBe("1");
    expect(valor(args, "-q:v")).toBe("5");
    expect(valor(args, "-vf")).toContain("crop=720:1280");
    expect(args.at(-1)).toBe("a.jpg");
  });

  it("no codifica video", () => {
    expect(args).not.toContain("libx264");
    expect(args).not.toContain("-t");
  });
});

describe("formatearPeso", () => {
  it("muestra KB por debajo de 1 MB y MB con coma decimal arriba", () => {
    expect(formatearPeso(0)).toBe("0 KB");
    expect(formatearPeso(850 * 1024)).toBe("850 KB");
    expect(formatearPeso(1.25 * 1024 * 1024)).toBe("1,3 MB");
  });

  it("rechaza pesos negativos o no enteros", () => {
    expect(() => formatearPeso(-1)).toThrow("Peso inválido");
    expect(() => formatearPeso(1.5)).toThrow("Peso inválido");
    expect(() => formatearPeso(Number.NaN)).toThrow("Peso inválido");
  });
});

describe("armarTabla", () => {
  it("alinea columnas y agrega el total", () => {
    const tabla = armarTabla([
      { nombre: "bifes.mp4", bytes: 2048 },
      { nombre: "bifes.jpg", bytes: 1024 },
    ]);
    expect(tabla.split("\n")).toEqual([
      "Archivo    Peso",
      "bifes.mp4  2 KB",
      "bifes.jpg  1 KB",
      "Total      3 KB",
    ]);
  });

  it("sin filas muestra solo encabezado y total en cero", () => {
    expect(armarTabla([]).split("\n")).toEqual([
      "Archivo  Peso",
      "Total    0 KB",
    ]);
  });
});
