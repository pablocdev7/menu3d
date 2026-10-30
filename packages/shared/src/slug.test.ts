import { describe, expect, it } from "vitest";
import { esSlugValido } from "./slug.js";

describe("esSlugValido", () => {
  it.each([
    ["abc"], // largo mínimo
    ["la-parrilla"],
    ["bodegon-1990"],
    ["a1b2c3"],
    ["x".repeat(40)], // largo máximo
  ])("acepta %s", (slug) => {
    expect(esSlugValido(slug)).toBe(true);
  });

  it.each([
    ["", "vacío"],
    ["ab", "muy corto"],
    ["x".repeat(41), "muy largo"],
    ["-parrilla", "guion al inicio"],
    ["parrilla-", "guion al final"],
    ["La-Parrilla", "mayúsculas"],
    ["la parrilla", "espacio"],
    ["café-bar", "acento"],
    ["la_parrilla", "guion bajo"],
  ])("rechaza %j (%s)", (slug) => {
    expect(esSlugValido(slug)).toBe(false);
  });
});
