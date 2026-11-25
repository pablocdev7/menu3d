import { z } from "zod";

// Identidad visual del local: color principal (#RRGGBB) y, si hay, portada y logo.
export const MarcaSchema = z.object({
  colorPrincipal: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, { message: "El color tiene que ser #RRGGBB" }),
  portadaUrl: z.string().optional(),
  logoUrl: z.string().optional(),
});

export type Marca = z.infer<typeof MarcaSchema>;
