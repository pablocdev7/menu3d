// Utilidades de color para cumplir contraste WCAG AA con cualquier color de marca.

export const TINT_POR_DEFECTO = "#007AFF";
export const FONDO_CLARO = "#F2F2F7";
export const FONDO_OSCURO = "#1C1C1E";
export const CONTRASTE_AA = 4.5;

const PATRON_HEX = /^#[0-9a-fA-F]{6}$/;

export function esHexValido(color: string | undefined): color is string {
  return color !== undefined && PATRON_HEX.test(color);
}

function aRgb(hex: string): [number, number, number] {
  if (!esHexValido(hex)) throw new Error(`Color inválido: "${hex}"`);
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function aHex([r, g, b]: [number, number, number]): string {
  const canal = (c: number) => Math.round(c).toString(16).padStart(2, "0");
  return `#${canal(r)}${canal(g)}${canal(b)}`.toUpperCase();
}

// Luminancia relativa según WCAG 2.x (0 = negro, 1 = blanco).
export function luminancia(hex: string): number {
  const [r, g, b] = aRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Relación de contraste entre 1 (iguales) y 21 (negro sobre blanco).
export function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro! + 0.05) / (oscuro! + 0.05);
}

function mezclar(a: string, b: string, t: number): string {
  const ra = aRgb(a);
  const rb = aRgb(b);
  return aHex(
    [0, 1, 2].map((i) => ra[i]! + (rb[i]! - ra[i]!) * t) as [
      number,
      number,
      number,
    ],
  );
}

// Devuelve el color tal cual si ya contrasta con el fondo; si no, lo aclara (fondo
// oscuro) u oscurece (fondo claro) de a poco hasta llegar al mínimo.
export function ajustarContraste(
  color: string,
  fondo: string,
  minimo = CONTRASTE_AA,
): string {
  const base = aHex(aRgb(color));
  if (contraste(base, fondo) >= minimo) return base;
  const hacia = luminancia(fondo) < 0.5 ? "#FFFFFF" : "#000000";
  for (let t = 0.05; t < 1; t += 0.05) {
    const candidato = mezclar(base, hacia, t);
    if (contraste(candidato, fondo) >= minimo) return candidato;
  }
  return hacia;
}

// Variables CSS del color del local: el original y sus versiones legibles.
export function variablesDeTint(color: string | undefined) {
  const tint = esHexValido(color) ? color.toUpperCase() : TINT_POR_DEFECTO;
  return {
    "--tint": tint,
    // Sobre fondos claros (y como relleno con texto blanco encima).
    "--tint-claro": ajustarContraste(tint, FONDO_CLARO),
    // Sobre los reels y las hojas en modo oscuro.
    "--tint-oscuro": ajustarContraste(tint, FONDO_OSCURO),
  };
}
