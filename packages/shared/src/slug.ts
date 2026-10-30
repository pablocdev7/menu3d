import { z } from "zod";

// Minúsculas, números y guiones; no puede arrancar ni terminar con guion.
const PATRON_SLUG = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export const esquemaSlug = z.string().min(3).max(40).regex(PATRON_SLUG);

export function esSlugValido(slug: string): boolean {
  return esquemaSlug.safeParse(slug).success;
}
