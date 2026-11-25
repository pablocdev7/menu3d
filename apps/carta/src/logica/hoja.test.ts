import { describe, expect, it } from "vitest";
import {
  RANGO_TITULO_PX,
  UMBRAL_PX,
  alternarAltura,
  destinoAlSoltar,
  progresoTitulo,
} from "./hoja.js";

const ALTO = 800;

describe("destinoAlSoltar", () => {
  it("un arrastre corto no cambia nada", () => {
    expect(destinoAlSoltar("media", 20, ALTO)).toBe("media");
    expect(destinoAlSoltar("completa", -20, ALTO)).toBe("completa");
  });

  it("justo en el umbral todavía no cambia", () => {
    expect(destinoAlSoltar("media", UMBRAL_PX, ALTO)).toBe("media");
  });

  it("hacia arriba desde media pasa a completa", () => {
    expect(destinoAlSoltar("media", -120, ALTO)).toBe("completa");
  });

  it("hacia arriba desde completa se queda en completa", () => {
    expect(destinoAlSoltar("completa", -120, ALTO)).toBe("completa");
  });

  it("hacia abajo desde completa baja a media", () => {
    expect(destinoAlSoltar("completa", 120, ALTO)).toBe("media");
  });

  it("hacia abajo desde media se cierra", () => {
    expect(destinoAlSoltar("media", 120, ALTO)).toBe("cerrada");
  });

  it("un arrastre largo desde completa cierra directo", () => {
    expect(destinoAlSoltar("completa", ALTO * 0.7, ALTO)).toBe("cerrada");
  });

  it("ignora valores no numéricos", () => {
    expect(destinoAlSoltar("media", Number.NaN, ALTO)).toBe("media");
    expect(destinoAlSoltar("completa", Number.POSITIVE_INFINITY, ALTO)).toBe(
      "completa",
    );
  });

  it("con alto 0 usa solo el umbral", () => {
    expect(destinoAlSoltar("completa", 120, 0)).toBe("media");
  });
});

describe("alternarAltura", () => {
  it("alterna entre media y completa", () => {
    expect(alternarAltura("media")).toBe("completa");
    expect(alternarAltura("completa")).toBe("media");
  });
});

describe("progresoTitulo", () => {
  it("arriba de todo es 0", () => {
    expect(progresoTitulo(0)).toBe(0);
  });

  it("a mitad del rango es 0.5", () => {
    expect(progresoTitulo(RANGO_TITULO_PX / 2)).toBe(0.5);
  });

  it("pasado el rango queda en 1", () => {
    expect(progresoTitulo(500)).toBe(1);
  });

  it("el rebote negativo de iOS queda en 0", () => {
    expect(progresoTitulo(-30)).toBe(0);
  });

  it("ignora valores no numéricos o rango inválido", () => {
    expect(progresoTitulo(Number.NaN)).toBe(0);
    expect(progresoTitulo(20, 0)).toBe(0);
  });
});
