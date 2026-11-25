# 01 · Contrato de datos

## Qué es

El contrato es la forma exacta que tiene que tener una carta para que el resto del
sistema (la app de la carta, la API, las métricas) la pueda usar sin sorpresas.
Vive en `packages/shared/src` y está escrito con Zod:

| Archivo    | Qué define                                                                  |
| ---------- | --------------------------------------------------------------------------- |
| `plato.ts` | `PlatoSchema`, precios, formatos, alérgenos, etiquetas y media              |
| `marca.ts` | `MarcaSchema`: color principal `#RRGGBB`, portada y logo                    |
| `carta.ts` | `CartaSchema`: versión, local, categorías y platos, con sus reglas cruzadas |

Todo se exporta desde `index.ts` (`import { CartaSchema } from "@menu3d/shared"`).

## La analogía con Java

Si venís de Spring, pensalo así:

| Java                                        | Acá                                        |
| ------------------------------------------- | ------------------------------------------ |
| Clase DTO `PlatoDto`                        | `type Plato = z.infer<typeof PlatoSchema>` |
| `@NotBlank`, `@Size(max = 80)`              | `z.string().min(1).max(80)`                |
| `@Pattern(regexp = "^#[0-9a-fA-F]{6}$")`    | `.regex(/^#[0-9a-fA-F]{6}$/)`              |
| `@Min(0)` sobre un `int`                    | `z.number().int().min(0)`                  |
| Validador de clase (`@ConstraintValidator`) | `.superRefine(...)` en `CartaSchema`       |
| `validator.validate(dto)`                   | `CartaSchema.safeParse(datos)`             |

La diferencia grande: en Java escribís la clase y le pegás anotaciones. Acá escribís
el schema y **el tipo se deriva solo**, así que nunca se desincronizan.

Las reglas que miran más de un campo (ids únicos, que cada `plato.categoriaId`
exista en `categorias`) van en el `superRefine` de `CartaSchema`, porque es el
único lugar que ve las dos listas a la vez.

## Cómo agregar un campo, paso a paso

Ejemplo: agregar `calorias` (entero opcional) al plato.

1. En `plato.ts`, sumalo al objeto: `calorias: z.number().int().min(0).optional(),`.
   El tipo `Plato` se actualiza solo.
2. En `plato.test.ts`, agregá un caso positivo (`calorias: 450`) y negativos
   (`-1`, `12.5`, `"mucho"`) en el `it.each` de rechazos.
3. Si es obligatorio, actualizá `plato.fixture.ts` y `demo/carta.json`; si no,
   igual conviene usarlo en algún plato de la demo.
4. Si el cambio rompe cartas viejas (campo obligatorio, renombre), subí `version`.
5. Corré `pnpm typecheck` y `pnpm test`: TypeScript te va a marcar cada lugar
   que use `Plato` y necesite el campo nuevo.
6. Contalo en este manual si cambia cómo se arma una carta.

## Cómo validar

- **La demo:** `pnpm validar:demo` valida `demo/carta.json` y muestra los errores
  con su ruta (por ejemplo `platos[3].categoriaId`).
- **Otro archivo:** `pnpm tsx packages/shared/scripts/validar-demo.ts ruta/a/carta.json`.
- **En código:** toda entrada externa pasa por el schema antes de usarse:

```ts
const resultado = CartaSchema.safeParse(json);
if (!resultado.success) {
  console.error(z.prettifyError(resultado.error));
} else {
  usar(resultado.data); // acá ya es una Carta tipada y válida
}
```

Usá `safeParse` cuando quieras manejar el error vos, y `parse` cuando un dato
inválido sea un bug y prefieras que explote.
