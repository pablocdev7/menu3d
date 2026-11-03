import { describe, expect, it } from "vitest";
import { MenuSchema, PlatoSchema, type Plato } from "./plato.js";

const platoMinimo: Plato = {
  id: "empanada",
  nombre: "Empanada",
  descripcion: "",
  seccion: "Entradas",
  tipo: "plato",
  formatos: [{ nombre: "Unidad", precio: { centavos: 150000, moneda: "ARS" } }],
  ingredientesVisibles: [],
  alergenos: [],
  alergenosValidadosPorDueno: false,
};

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
      seccion: "Tragos",
      tipo: "bebida",
      formatos: [
        { nombre: "Vaso", precio: { centavos: 400000, moneda: "ARS" } },
        { nombre: "Jarra", precio: { centavos: 1100000, moneda: "ARS" } },
      ],
      alergenos: ["sulfitos"],
    });
    expect(PlatoSchema.safeParse(bebida).success).toBe(true);
  });

  it.each([
    ["precio negativo", conPrecio(-1)],
    ["precio con decimales", conPrecio(1500.5)],
    ["formatos vacío", conCambios({ formatos: [] })],
    ["alérgeno inexistente", conCambios({ alergenos: ["palta"] })],
    ["alérgeno repetido", conCambios({ alergenos: ["gluten", "gluten"] })],
  ])("rechaza %s", (_caso, plato) => {
    expect(PlatoSchema.safeParse(plato).success).toBe(false);
  });
});

describe("MenuSchema", () => {
  it("acepta un menú con ids únicos", () => {
    const menu = {
      local: "El Bodegón",
      platos: [platoMinimo, conCambios({ id: "provoleta" })],
    };
    expect(MenuSchema.safeParse(menu).success).toBe(true);
  });

  it("rechaza ids duplicados en el menú", () => {
    const resultado = MenuSchema.safeParse({
      local: "El Bodegón",
      platos: [platoMinimo, platoMinimo],
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.path).toEqual(["platos", 1, "id"]);
  });
});
