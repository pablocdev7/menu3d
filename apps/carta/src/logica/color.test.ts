import { describe, expect, it } from "vitest";
import {
  CONTRASTE_AA,
  FONDO_CLARO,
  FONDO_OSCURO,
  TINT_POR_DEFECTO,
  ajustarContraste,
  contraste,
  esHexValido,
  luminancia,
  variablesDeTint,
} from "./color.js";

describe("luminancia y contraste", () => {
  it("negro sobre blanco da 21", () => {
    expect(contraste("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });

  it("un color contra sí mismo da 1", () => {
    expect(contraste("#B5462F", "#B5462F")).toBeCloseTo(1, 5);
  });

  it("no depende del orden de los argumentos", () => {
    expect(contraste("#007AFF", "#FFFFFF")).toBeCloseTo(
      contraste("#FFFFFF", "#007AFF"),
      10,
    );
  });

  it("el azul de iOS sobre blanco no llega a AA", () => {
    expect(contraste("#007AFF", "#FFFFFF")).toBeLessThan(CONTRASTE_AA);
  });

  it("luminancia de los extremos", () => {
    expect(luminancia("#000000")).toBe(0);
    expect(luminancia("#FFFFFF")).toBeCloseTo(1, 10);
  });

  it.each(["", "#FFF", "007AFF", "#GGGGGG", "azul"])(
    "rechaza el color %j",
    (color) => {
      expect(() => luminancia(color)).toThrow();
    },
  );
});

describe("ajustarContraste", () => {
  it("deja igual un color que ya cumple", () => {
    expect(ajustarContraste("#000000", FONDO_CLARO)).toBe("#000000");
  });

  it("oscurece el azul de iOS hasta cumplir AA sobre fondo claro", () => {
    const ajustado = ajustarContraste("#007AFF", FONDO_CLARO);
    expect(ajustado).not.toBe("#007AFF");
    expect(contraste(ajustado, FONDO_CLARO)).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
  });

  it("aclara un color oscuro hasta cumplir AA sobre fondo oscuro", () => {
    const ajustado = ajustarContraste("#2F5D3A", FONDO_OSCURO);
    expect(contraste(ajustado, FONDO_OSCURO)).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
    expect(luminancia(ajustado)).toBeGreaterThan(luminancia("#2F5D3A"));
  });

  it("rechaza un color inválido", () => {
    expect(() => ajustarContraste("rojo", FONDO_CLARO)).toThrow();
  });
});

describe("variablesDeTint", () => {
  it("usa el color del local y genera versiones legibles", () => {
    const vars = variablesDeTint("#b5462f");
    expect(vars["--tint"]).toBe("#B5462F");
    expect(contraste(vars["--tint-claro"], FONDO_CLARO)).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
    expect(contraste(vars["--tint-claro"], "#FFFFFF")).toBeGreaterThanOrEqual(
      CONTRASTE_AA,
    );
    expect(
      contraste(vars["--tint-oscuro"], FONDO_OSCURO),
    ).toBeGreaterThanOrEqual(CONTRASTE_AA);
  });

  it.each([undefined, "", "rojo", "#12345"])(
    "usa el azul de iOS con %j",
    (color) => {
      expect(variablesDeTint(color)["--tint"]).toBe(TINT_POR_DEFECTO);
    },
  );

  it("esHexValido distingue válidos de inválidos", () => {
    expect(esHexValido("#007AFF")).toBe(true);
    expect(esHexValido("#007AF")).toBe(false);
    expect(esHexValido(undefined)).toBe(false);
  });
});
