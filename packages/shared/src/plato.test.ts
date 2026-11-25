import { describe, expect, it } from "vitest";
import { PlatoSchema } from "./plato.js";
import { platoMinimo } from "./plato.fixture.js";

// Arma un plato cambiando solo lo que interesa en cada caso.
const conCambios = (cambios: Record<string, unknown>) => ({
  ...platoMinimo,
  ...cambios,
});

const conPrecio = (centavos: number) =>
  conCambios({
    formatos: [{ nombre: "Unidad", precio: { centavos, moneda: "ARS" } }],
  });

describe("PlatoSchema", () => {
  it("acepta un plato válido mínimo", () => {
    expect(PlatoSchema.safeParse(platoMinimo).success).toBe(true);
  });

  it("acepta una bebida con 2 formatos", () => {
    const bebida = conCambios({
      id: "vermu-de-la-casa",
      nombre: "Vermú de la casa",
      categoriaId: "tragos",
      tipo: "bebida",
      formatos: [
        { nombre: "Vaso", precio: { centavos: 400000, moneda: "ARS" } },
        { nombre: "Jarra", precio: { centavos: 1100000, moneda: "ARS" } },
      ],
      alergenos: ["sulfitos"],
    });
    expect(PlatoSchema.safeParse(bebida).success).toBe(true);
  });

  it("acepta etiquetas, destacado, no disponible y media con poster", () => {
    const plato = conCambios({
      etiquetas: ["vegano", "sin_tacc"],
      destacado: true,
      disponible: false,
      media: { tipo: "video", url: "videos/empanada.mp4", poster: "p.jpg" },
    });
    expect(PlatoSchema.safeParse(plato).success).toBe(true);
  });

  it("acepta media de foto sin poster", () => {
    const plato = conCambios({ media: { tipo: "foto", url: "fotos/e.jpg" } });
    expect(PlatoSchema.safeParse(plato).success).toBe(true);
  });

  it.each([
    ["precio negativo", conPrecio(-1)],
    ["precio con decimales", conPrecio(1500.5)],
    ["formatos vacío", conCambios({ formatos: [] })],
    ["alérgeno inexistente", conCambios({ alergenos: ["palta"] })],
    ["alérgeno repetido", conCambios({ alergenos: ["gluten", "gluten"] })],
    ["etiqueta inexistente", conCambios({ etiquetas: ["keto"] })],
    ["etiqueta repetida", conCambios({ etiquetas: ["vegano", "vegano"] })],
    ["categoriaId que no es slug", conCambios({ categoriaId: "Entradas" })],
    ["sin disponible", conCambios({ disponible: undefined })],
    ["destacado no booleano", conCambios({ destacado: "si" })],
    ["media con url vacía", conCambios({ media: { tipo: "foto", url: "" } })],
    ["media de tipo inválido", conCambios({ media: { tipo: "3d", url: "x" } })],
    [
      "el campo viejo seccion",
      conCambios({ categoriaId: undefined, seccion: "Entradas" }),
    ],
  ])("rechaza %s", (_caso, plato) => {
    expect(PlatoSchema.safeParse(plato).success).toBe(false);
  });
});
