// Valida una carta JSON contra CartaSchema y muestra los errores legibles.
// Uso: tsx packages/shared/scripts/validar-demo.ts [ruta]  (por defecto demo/carta.json)
import { readFileSync } from "node:fs";
import { z } from "zod";
import { CartaSchema } from "../src/index.js";

const ruta = process.argv[2] ?? "demo/carta.json";

let datos: unknown;
try {
  datos = JSON.parse(readFileSync(ruta, "utf8"));
} catch (error) {
  console.error(`No pude leer o parsear ${ruta}:`, (error as Error).message);
  process.exit(1);
}

const resultado = CartaSchema.safeParse(datos);

if (!resultado.success) {
  console.error(`✗ ${ruta} no es válido:\n`);
  console.error(z.prettifyError(resultado.error));
  process.exit(1);
}

const { local, categorias, platos } = resultado.data;
console.log(
  `✓ ${ruta} es válido: "${local.nombre}" con ${categorias.length} categorías y ${platos.length} platos.`,
);
