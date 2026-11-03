import { z } from "zod";
import { esSlugValido } from "./slug.js";

// Los 14 alérgenos de declaración obligatoria.
export const AlergenoSchema = z.enum([
  "gluten",
  "crustaceos",
  "huevo",
  "pescado",
  "mani",
  "soja",
  "lacteos",
  "frutos_de_cascara",
  "apio",
  "mostaza",
  "sesamo",
  "sulfitos",
  "altramuces",
  "moluscos",
]);

// Guardamos centavos enteros para no arrastrar errores de punto flotante.
export const PrecioSchema = z.object({
  centavos: z.number().int().min(0),
  moneda: z.enum(["ARS", "USD"]),
});

export const FormatoSchema = z.object({
  nombre: z.string().min(1).max(30),
  precio: PrecioSchema,
});

export const PlatoSchema = z.object({
  id: z.string().refine(esSlugValido, { message: "Slug inválido" }),
  nombre: z.string().min(1).max(80),
  descripcion: z.string().max(300),
  seccion: z.string().min(1).max(40),
  tipo: z.enum(["plato", "bebida"]),
  formatos: z.array(FormatoSchema).min(1),
  ingredientesVisibles: z.array(z.string().min(1).max(40)),
  alergenos: z
    .array(AlergenoSchema)
    .refine((lista) => new Set(lista).size === lista.length, {
      message: "Hay alérgenos repetidos",
    }),
  alergenosValidadosPorDueno: z.boolean(),
});

export const MenuSchema = z.object({
  local: z.string().min(1).max(80),
  platos: z.array(PlatoSchema).superRefine((platos, ctx) => {
    // Marcamos cada id repetido en su posición para que el error sea fácil de ubicar.
    const vistos = new Set<string>();
    platos.forEach((plato, i) => {
      if (vistos.has(plato.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Id duplicado: "${plato.id}"`,
          path: [i, "id"],
        });
      }
      vistos.add(plato.id);
    });
  }),
});

export type Alergeno = z.infer<typeof AlergenoSchema>;
export type Precio = z.infer<typeof PrecioSchema>;
export type Formato = z.infer<typeof FormatoSchema>;
export type Plato = z.infer<typeof PlatoSchema>;
export type Menu = z.infer<typeof MenuSchema>;
