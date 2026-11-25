import { PrecioSchema, type Precio } from "./plato.js";

// Convierte centavos a texto de moneda. Si el monto es entero no muestra
// decimales ("$ 4.500"); si tiene centavos muestra siempre dos ("$ 4.500,50").
// Lanza error si el precio no cumple PrecioSchema (centavos no enteros o negativos).
export function formatearPrecio(precio: Precio, locale = "es-AR"): string {
  const { centavos, moneda } = PrecioSchema.parse(precio);
  const tieneCentavos = centavos % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: tieneCentavos ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}
