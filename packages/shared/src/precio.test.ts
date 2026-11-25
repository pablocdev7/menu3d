import { describe, expect, it } from "vitest";
import { formatearPrecio } from "./precio.js";
import type { Precio } from "./plato.js";

// Intl separa símbolo y número con un espacio duro (NBSP).
const NBSP = " ";

describe("formatearPrecio", () => {
  it("formatea ARS con decimales", () => {
    expect(formatearPrecio({ centavos: 450050, moneda: "ARS" })).toBe(
      `$${NBSP}4.500,50`,
    );
  });

  it("formatea ARS sin decimales cuando el monto es entero", () => {
    expect(formatearPrecio({ centavos: 450000, moneda: "ARS" })).toBe(
      `$${NBSP}4.500`,
    );
  });

  it("formatea USD", () => {
    expect(formatearPrecio({ centavos: 1250, moneda: "USD" })).toBe(
      `US$${NBSP}12,50`,
    );
  });

  it("formatea cero", () => {
    expect(formatearPrecio({ centavos: 0, moneda: "ARS" })).toBe(`$${NBSP}0`);
  });

  it("respeta otro locale", () => {
    expect(formatearPrecio({ centavos: 1250, moneda: "USD" }, "en-US")).toBe(
      "$12.50",
    );
  });

  it("rechaza centavos no enteros", () => {
    expect(() => formatearPrecio({ centavos: 10.5, moneda: "ARS" })).toThrow();
  });

  it("rechaza centavos negativos", () => {
    expect(() => formatearPrecio({ centavos: -100, moneda: "ARS" })).toThrow();
  });

  it("rechaza una moneda desconocida", () => {
    const precio = { centavos: 100, moneda: "EUR" } as unknown as Precio;
    expect(() => formatearPrecio(precio)).toThrow();
  });
});
