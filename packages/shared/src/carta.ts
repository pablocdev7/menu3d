import { z } from "zod";
import { MarcaSchema } from "./marca.js";
import { PlatoSchema } from "./plato.js";
import { esquemaSlug } from "./slug.js";

export const CategoriaSchema = z.object({
  id: esquemaSlug,
  nombre: z.string().min(1).max(40),
  orden: z.number().int().min(0),
});

export const LocalSchema = z.object({
  slug: esquemaSlug,
  nombre: z.string().min(1).max(80),
  marca: MarcaSchema,
  linkResenasGoogle: z
    .url({
      protocol: /^https$/,
      message: "El link de reseñas tiene que ser https",
    })
    .optional(),
});

// Agrega un error por cada id repetido, apuntando a su posición en la lista.
function marcarIdsRepetidos(
  items: { id: string }[],
  lista: "categorias" | "platos",
  ctx: z.RefinementCtx,
): void {
  const vistos = new Set<string>();
  items.forEach((item, i) => {
    if (vistos.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        message: `Id duplicado: "${item.id}"`,
        path: [lista, i, "id"],
      });
    }
    vistos.add(item.id);
  });
}

export const CartaSchema = z
  .object({
    version: z.number().int().min(1),
    local: LocalSchema,
    categorias: z.array(CategoriaSchema),
    platos: z.array(PlatoSchema),
  })
  .superRefine((carta, ctx) => {
    marcarIdsRepetidos(carta.categorias, "categorias", ctx);
    marcarIdsRepetidos(carta.platos, "platos", ctx);

    // Cada plato tiene que apuntar a una categoría que exista.
    const idsCategorias = new Set(carta.categorias.map((c) => c.id));
    carta.platos.forEach((plato, i) => {
      if (!idsCategorias.has(plato.categoriaId)) {
        ctx.addIssue({
          code: "custom",
          message: `La categoría "${plato.categoriaId}" no existe`,
          path: ["platos", i, "categoriaId"],
        });
      }
    });
  });

export type Categoria = z.infer<typeof CategoriaSchema>;
export type Local = z.infer<typeof LocalSchema>;
export type Carta = z.infer<typeof CartaSchema>;
