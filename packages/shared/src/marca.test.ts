import { describe, expect, it } from "vitest";
import { MarcaSchema } from "./marca.js";

describe("MarcaSchema", () => {
  it.each([
    ["solo color", { colorPrincipal: "#B5462F" }],
    ["color en minúsculas", { colorPrincipal: "#b5462f" }],
    [
      "con portada y logo",
      { colorPrincipal: "#000000", portadaUrl: "p.jpg", logoUrl: "l.png" },
    ],
  ])("acepta %s", (_caso, marca) => {
    expect(MarcaSchema.safeParse(marca).success).toBe(true);
  });

  it.each([
    ["color sin #", "B5462F"],
    ["color corto", "#B54"],
    ["color con 8 dígitos", "#B5462FFF"],
    ["color con letras no hex", "#GGGGGG"],
    ["color por nombre", "red"],
  ])("rechaza %s", (_caso, colorPrincipal) => {
    expect(MarcaSchema.safeParse({ colorPrincipal }).success).toBe(false);
  });

  it("rechaza si falta el color", () => {
    expect(MarcaSchema.safeParse({ logoUrl: "l.png" }).success).toBe(false);
  });
});
