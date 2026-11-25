import { z } from "zod";
import { esquemaSlug, esSlugValido } from "./slug.js";

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

// Etiquetas que se muestran como chips en la carta.
export const EtiquetaSchema = z.enum([
  "sin_tacc",
  "vegano",
  "vegetariano",
  "picante",
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

export const MediaSchema = z.object({
  tipo: z.enum(["video", "foto"]),
  url: z.string().min(1),
  poster: z.string().optional(),
});

// Lista sin elementos repetidos; `que` arma el mensaje ("alérgenos", "etiquetas").
const listaSinRepetidos = <T extends z.ZodType>(item: T, que: string) =>
  z.array(item).refine((lista) => new Set(lista).size === lista.length, {
    message: `Hay ${que} repetidos`,
  });

export const PlatoSchema = z.object({
  id: z.string().refine(esSlugValido, { message: "Slug inválido" }),
  nombre: z.string().min(1).max(80),
  descripcion: z.string().max(300),
  categoriaId: esquemaSlug,
  tipo: z.enum(["plato", "bebida"]),
  formatos: z.array(FormatoSchema).min(1),
  ingredientesVisibles: z.array(z.string().min(1).max(40)),
  alergenos: listaSinRepetidos(AlergenoSchema, "alérgenos"),
  alergenosValidadosPorDueno: z.boolean(),
  disponible: z.boolean(),
  destacado: z.boolean(),
  etiquetas: listaSinRepetidos(EtiquetaSchema, "etiquetas"),
  media: MediaSchema.optional(),
});

export type Alergeno = z.infer<typeof AlergenoSchema>;
export type Etiqueta = z.infer<typeof EtiquetaSchema>;
export type Precio = z.infer<typeof PrecioSchema>;
export type Formato = z.infer<typeof FormatoSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type Plato = z.infer<typeof PlatoSchema>;
