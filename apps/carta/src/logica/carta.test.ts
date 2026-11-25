import { describe, expect, it } from "vitest";
import type { Categoria, Etiqueta, Plato } from "@menu3d/shared";
import datosDemo from "../../../../demo/carta.json";
import {
  MENSAJE_CONSULTAR_ALERGENOS,
  TEXTO_AGOTADO,
  agruparPorCategoria,
  alergenoLegible,
  capitalizar,
  cargarCarta,
  estaAgotado,
  etiquetaLegible,
  imagenDe,
  infoAlergenos,
  lineaEtiquetas,
  textoPrecio,
} from "./carta.js";

describe("infoAlergenos", () => {
  it("validado con alérgenos: los lista en español", () => {
    expect(
      infoAlergenos({
        alergenosValidadosPorDueno: true,
        alergenos: ["gluten", "lacteos"],
      }),
    ).toEqual({ tipo: "lista", alergenos: ["Gluten", "Lácteos"] });
  });

  it("validado sin alérgenos: lista vacía", () => {
    expect(
      infoAlergenos({ alergenosValidadosPorDueno: true, alergenos: [] }),
    ).toEqual({
      tipo: "lista",
      alergenos: [],
    });
  });

  it("no validado: no muestra alérgenos y manda a consultar", () => {
    expect(
      infoAlergenos({
        alergenosValidadosPorDueno: false,
        alergenos: ["huevo"],
      }),
    ).toEqual({ tipo: "consultar", mensaje: MENSAJE_CONSULTAR_ALERGENOS });
    expect(MENSAJE_CONSULTAR_ALERGENOS).toBe(
      "Consultá por alérgenos al personal.",
    );
  });
});

// Intl separa símbolo y número con un espacio duro (NBSP).
const NBSP = " ";

const plato = (
  id: string,
  categoriaId: string,
  cambios: Partial<Plato> = {},
): Plato => ({
  id,
  nombre: id,
  descripcion: "",
  categoriaId,
  tipo: "plato",
  formatos: [{ nombre: "Unidad", precio: { centavos: 450000, moneda: "ARS" } }],
  ingredientesVisibles: [],
  alergenos: [],
  alergenosValidadosPorDueno: false,
  disponible: true,
  destacado: false,
  etiquetas: [],
  ...cambios,
});

const categoria = (id: string, orden: number): Categoria => ({
  id,
  nombre: id,
  orden,
});

describe("cargarCarta", () => {
  it("acepta la carta demo", () => {
    const resultado = cargarCarta(datosDemo);
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.carta.platos).toHaveLength(13);
  });

  it("rechaza datos inválidos con detalle técnico", () => {
    const resultado = cargarCarta({ version: 0, platos: "nada" });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.length).toBeGreaterThan(0);
  });

  it("rechaza el formato viejo del menú", () => {
    expect(cargarCarta({ local: "Bodegón", platos: [] }).ok).toBe(false);
  });

  it("rechaza algo que no es un objeto", () => {
    expect(cargarCarta(null).ok).toBe(false);
  });
});

describe("agruparPorCategoria", () => {
  it("ordena las categorías por orden, no por cómo vienen", () => {
    const grupos = agruparPorCategoria(
      [categoria("postres", 2), categoria("entradas", 0)],
      [plato("flan", "postres"), plato("empanada", "entradas")],
    );
    expect(grupos.map((g) => g.categoria.id)).toEqual(["entradas", "postres"]);
  });

  it("mantiene el orden del JSON dentro de cada categoría", () => {
    const grupos = agruparPorCategoria(
      [categoria("entradas", 0), categoria("principales", 1)],
      [
        plato("aaa", "entradas"),
        plato("bbb", "principales"),
        plato("ccc", "entradas"),
      ],
    );
    expect(grupos[0]?.platos.map((p) => p.id)).toEqual(["aaa", "ccc"]);
  });

  it("con orden empatado respeta el orden original", () => {
    const grupos = agruparPorCategoria(
      [categoria("bbb", 1), categoria("aaa", 1)],
      [plato("x1", "aaa"), plato("x2", "bbb")],
    );
    expect(grupos.map((g) => g.categoria.id)).toEqual(["bbb", "aaa"]);
  });

  it("omite categorías sin platos", () => {
    const grupos = agruparPorCategoria(
      [categoria("entradas", 0), categoria("vacia", 1)],
      [plato("aaa", "entradas")],
    );
    expect(grupos.map((g) => g.categoria.id)).toEqual(["entradas"]);
  });

  it("ignora platos de una categoría que no está en la lista", () => {
    expect(
      agruparPorCategoria([categoria("entradas", 0)], [plato("a1", "otra")]),
    ).toEqual([]);
  });

  it("no modifica el array de categorías recibido", () => {
    const categorias = [categoria("bbb", 1), categoria("aaa", 0)];
    agruparPorCategoria(categorias, []);
    expect(categorias.map((c) => c.id)).toEqual(["bbb", "aaa"]);
  });

  it("con la demo arranca por Entradas", () => {
    const resultado = cargarCarta(datosDemo);
    if (!resultado.ok) throw new Error("La demo debería ser válida");
    const grupos = agruparPorCategoria(
      resultado.carta.categorias,
      resultado.carta.platos,
    );
    expect(grupos[0]?.categoria.nombre).toBe("Entradas");
  });
});

describe("textos legibles", () => {
  it.each([
    ["sin_tacc", "Sin TACC"],
    ["vegano", "Vegano"],
    ["vegetariano", "Vegetariano"],
    ["picante", "Picante"],
  ] as const)("etiqueta %s → %s", (etiqueta, texto) => {
    expect(etiquetaLegible(etiqueta)).toBe(texto);
  });

  it("arma la línea de etiquetas con separador", () => {
    const etiquetas: Etiqueta[] = ["sin_tacc", "vegano"];
    expect(lineaEtiquetas(etiquetas)).toBe("Sin TACC · Vegano");
  });

  it("la línea de etiquetas queda vacía sin etiquetas", () => {
    expect(lineaEtiquetas([])).toBe("");
  });

  it("traduce alérgenos con tildes", () => {
    expect(alergenoLegible("frutos_de_cascara")).toBe("Frutos de cáscara");
    expect(alergenoLegible("lacteos")).toBe("Lácteos");
  });

  it("no devuelve códigos crudos", () => {
    expect(alergenoLegible("sesamo")).not.toBe("sesamo");
    expect(etiquetaLegible("sin_tacc")).not.toBe("sin_tacc");
  });

  it("capitaliza la primera letra, también con tilde", () => {
    expect(capitalizar("carne vacuna")).toBe("Carne vacuna");
    expect(capitalizar("ñoquis")).toBe("Ñoquis");
  });

  it("capitalizar no rompe con texto vacío", () => {
    expect(capitalizar("")).toBe("");
  });
});

describe("agotados y precio", () => {
  it("un plato disponible no está agotado", () => {
    expect(estaAgotado(plato("a1", "x"))).toBe(false);
  });

  it("un plato no disponible está agotado", () => {
    expect(estaAgotado(plato("a1", "x", { disponible: false }))).toBe(true);
  });

  it("muestra el precio si hay un solo formato", () => {
    expect(textoPrecio(plato("a1", "x"))).toBe(`$${NBSP}4.500`);
  });

  it("muestra 'Hoy no hay' en lugar del precio si está agotado", () => {
    expect(textoPrecio(plato("a1", "x", { disponible: false }))).toBe(
      TEXTO_AGOTADO,
    );
    expect(TEXTO_AGOTADO).toBe("Hoy no hay");
  });

  it("con varios formatos muestra 'desde' el más barato", () => {
    const vermu = plato("vermu", "bebidas", {
      formatos: [
        { nombre: "Jarra", precio: { centavos: 1900000, moneda: "ARS" } },
        { nombre: "Vaso", precio: { centavos: 700000, moneda: "ARS" } },
      ],
    });
    expect(textoPrecio(vermu)).toBe(`desde $${NBSP}7.000`);
  });

  it("no compara precios de monedas distintas", () => {
    const mixto = plato("mixto", "x", {
      formatos: [
        { nombre: "Local", precio: { centavos: 500000, moneda: "ARS" } },
        { nombre: "Turista", precio: { centavos: 500, moneda: "USD" } },
      ],
    });
    expect(textoPrecio(mixto)).toBe(`desde $${NBSP}5.000`);
  });

  it("devuelve vacío si no hay formatos (dato que el schema no deja pasar)", () => {
    expect(textoPrecio({ disponible: true, formatos: [] })).toBe("");
  });
});

describe("imagenDe", () => {
  it("usa la url si es foto", () => {
    expect(imagenDe({ media: { tipo: "foto", url: "f.jpg" } })).toBe("f.jpg");
  });

  it("usa el póster si es video", () => {
    expect(
      imagenDe({ media: { tipo: "video", url: "v.mp4", poster: "p.jpg" } }),
    ).toBe("p.jpg");
  });

  it("devuelve null si es video sin póster", () => {
    expect(imagenDe({ media: { tipo: "video", url: "v.mp4" } })).toBeNull();
  });

  it("devuelve null si el póster está vacío", () => {
    expect(
      imagenDe({ media: { tipo: "video", url: "v.mp4", poster: "" } }),
    ).toBeNull();
  });

  it("devuelve null sin media", () => {
    expect(imagenDe({})).toBeNull();
  });
});
