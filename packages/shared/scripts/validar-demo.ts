// Valida un menú JSON contra MenuSchema y muestra los errores legibles.
// Uso: tsx packages/shared/scripts/validar-demo.ts [ruta]  (por defecto demo/menu.json)
import { readFileSync } from "node:fs";
import { z } from "zod";
import { MenuSchema } from "../src/index.js";

const ruta = process.argv[2] ?? "demo/menu.json";

let datos: unknown;
try {
  datos = JSON.parse(readFileSync(ruta, "utf8"));
} catch (error) {
  console.error(`No pude leer o parsear ${ruta}:`, (error as Error).message);
  process.exit(1);
}

const resultado = MenuSchema.safeParse(datos);

if (!resultado.success) {
  console.error(`✗ ${ruta} no es válido:\n`);
  console.error(z.prettifyError(resultado.error));
  process.exit(1);
}

console.log(
  `✓ ${ruta} es válido: "${resultado.data.local}" con ${resultado.data.platos.length} platos.`,
);
