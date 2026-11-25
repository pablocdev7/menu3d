import { describe, expect, it } from "vitest";
import { CartaSchema, CategoriaSchema, type Carta } from "./carta.js";
import { platoMinimo } from "./plato.fixture.js";

const cartaMinima: Carta = {
  version: 1,
  local: {
    slug: "el-bodegon",
    nombre: "El Bodegón",
    marca: { colorPrincipal: "#B5462F" },
    linkResenasGoogle: "https://g.page/r/el-bodegon/review",
  },
  categorias: [
    { id: "entradas", nombre: "Entradas", orden: 0 },
    { id: "postres", nombre: "Postres", orden: 1 },
  ],
  platos: [platoMinimo, { ...platoMinimo, id: "flan", categoriaId: "postres" }],
};

const conLocal = (cambios: Record<string, unknown>) => ({
  ...cartaMinima,
  local: { ...cartaMinima.local, ...cambios },
});

describe("CategoriaSchema", () => {
  it("acepta una categoría válida", () => {
    const categoria = { id: "tragos", nombre: "Tragos", orden: 3 };
    expect(CategoriaSchema.safeParse(categoria).success).toBe(true);
  });

  it.each([
    ["id que no es slug", { id: "Tragos", nombre: "Tragos", orden: 0 }],
    ["nombre vacío", { id: "tragos", nombre: "", orden: 0 }],
    ["nombre de 41", { id: "tragos", nombre: "x".repeat(41), orden: 0 }],
    ["orden negativo", { id: "tragos", nombre: "Tragos", orden: -1 }],
    ["orden con decimales", { id: "tragos", nombre: "Tragos", orden: 1.5 }],
  ])("rechaza %s", (_caso, categoria) => {
    expect(CategoriaSchema.safeParse(categoria).success).toBe(false);
  });
});

describe("CartaSchema", () => {
  it("acepta una carta válida", () => {
    expect(CartaSchema.safeParse(cartaMinima).success).toBe(true);
  });

  it("acepta una carta sin link de reseñas", () => {
    const carta = conLocal({ linkResenasGoogle: undefined });
    expect(CartaSchema.safeParse(carta).success).toBe(true);
  });

  it.each([
    ["version 0", { ...cartaMinima, version: 0 }],
    ["color mal formado", conLocal({ marca: { colorPrincipal: "#12345" } })],
    ["reseñas con http", conLocal({ linkResenasGoogle: "http://g.page/r/x" })],
    ["reseñas que no es url", conLocal({ linkResenasGoogle: "g.page/r/x" })],
    ["slug de local inválido", conLocal({ slug: "El Bodegón" })],
  ])("rechaza %s", (_caso, carta) => {
    expect(CartaSchema.safeParse(carta).success).toBe(false);
  });

  it("rechaza ids de categoría duplicados", () => {
    const resultado = CartaSchema.safeParse({
      ...cartaMinima,
      categorias: [...cartaMinima.categorias, cartaMinima.categorias[0]],
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.path).toEqual(["categorias", 2, "id"]);
  });

  it("rechaza ids de plato duplicados", () => {
    const resultado = CartaSchema.safeParse({
      ...cartaMinima,
      platos: [platoMinimo, platoMinimo],
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.path).toEqual(["platos", 1, "id"]);
  });

  it("rechaza un plato con categoriaId inexistente", () => {
    const resultado = CartaSchema.safeParse({
      ...cartaMinima,
      platos: [{ ...platoMinimo, categoriaId: "bebidas" }],
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.path).toEqual([
      "platos",
      0,
      "categoriaId",
    ]);
  });
});
