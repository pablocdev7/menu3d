import type { Plato } from "./plato.js";

// Plato válido mínimo que reutilizan las pruebas.
export const platoMinimo: Plato = {
  id: "empanada",
  nombre: "Empanada",
  descripcion: "",
  categoriaId: "entradas",
  tipo: "plato",
  formatos: [{ nombre: "Unidad", precio: { centavos: 150000, moneda: "ARS" } }],
  ingredientesVisibles: [],
  alergenos: [],
  alergenosValidadosPorDueno: false,
  disponible: true,
  destacado: false,
  etiquetas: [],
};
