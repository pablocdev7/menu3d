# 02 · Carta pública

La app que ve el comensal al escanear el QR. Vive en `apps/carta` (React + Vite, sin
librerías de UI, de CSS ni de íconos) y sigue el estilo Liquid Glass de iOS.

## Cómo está organizada

| Carpeta / archivo  | Qué hace                                                             |
| ------------------ | -------------------------------------------------------------------- |
| `src/App.tsx`      | Valida `demo/carta.json`, inyecta el color del local y abre hojas    |
| `src/logica/`      | Lógica pura con tests: `carta.ts`, `color.ts` (contraste), `hoja.ts` |
| `src/pantallas/`   | `Reels`, `HojaInfo`, `HojaCarta`, `PantallaError`                    |
| `src/componentes/` | `Hoja`, `Lista`, `MediaPlato`, `Miniatura`, `FondoEscritorio`        |
| `src/estilos.css`  | Todo el estilo; los tokens están arriba de todo                      |

Regla: si algo se puede probar sin navegador, va en `logica/` y lleva tests.

## Componentes y useState, para alguien de Java/Spring

Un **componente** es una función que recibe datos (`props`) y devuelve lo que se ve,
como una vista de Thymeleaf con su controller pegado. `useState` es su estado, como
un campo de un bean `@SessionScope`, pero no se asigna directo: llamás al setter y
React vuelve a ejecutar la función para redibujar. `useEffect` es para hablar con el
mundo de afuera (eventos, `IntersectionObserver`); lo que devuelve es la limpieza,
como un `@PreDestroy`.

## Cómo correrla

- **PC:** desde la raíz, `pnpm --filter @menu3d/carta dev` → `http://localhost:5173`.
- **Celular:** el mismo comando usa `vite --host`; abrí la URL `Network:` que muestra,
  con el celu en la misma Wi-Fi. Si no carga, permití Node en el firewall de Windows.

## Layout de la pantalla

Liquid Glass es el lenguaje visual de iOS donde el contenido es protagonista y los
controles son de vidrio: dejan ver lo que pasa detrás, desenfocado. Acá todo va sobre
negro puro y el vidrio queda solo en la cabecera y en las hojas.

```
┌──────────────────────────────┐  ← safe-area de arriba
│ Brasa & Copa        ☰ Carta  │  barra (44px) ┐ cabecera global, fija,
│ Entradas  Para compartir  Pr…│  pestañas     ┘ de vidrio oscuro
│ ‾‾‾‾‾‾‾‾                     │  indicador de 2px
│ ┌──────────────────────────┐ │
│ │                          │ │  tarjeta de video: 8px por lado, radio 24px,
│ │          video           │ │  alto = min(ancho × 1,5, espacio libre)
│ │                          │ │
│ └──────────────────────────┘ │
│ Bife de chorizo a la brasa   │  nombre (2 líneas máx.)
│ $ 26.000                     │  precio en el color del local
│ De la casa · Sin TACC        │  etiquetas (1 renglón)
│ Descripción en dos líneas…   │  descripción (2 líneas máx.)
│ Ingredientes y alérgenos     │  abre la HojaInfo
└──────────────────────────────┘
```

- **Cabecera global** (no se repite por plato): el nombre del local (y su logo, si
  hay) y el botón **Carta**, que abre la HojaCarta. Debajo, las pestañas.
- **Pestañas:** solo texto; la activa en blanco y el resto en gris. El indicador se
  desliza con `transform` y la activa se centra con `scrollIntoView`. Los bordes se
  funden con `mask-image` en lugar de cortar el texto.
- **Un plato por pantalla** con `scroll-snap` vertical. La tarjeta es el único
  elemento elástico: el texto no pasa de ~176px y la tarjeta se lleva el resto. Si la
  pantalla es baja, se achica la tarjeta (el video se recorta con `object-fit: cover`)
  y el texto queda entero.
- **Texto sin velo:** va sobre negro, así que no necesita velo ni vidrio para leerse.

## La clase `.vidrio`

Cualquier elemento con `class="vidrio"` se vuelve vidrio: `backdrop-filter`
(desenfoque 24px y saturación 180%), fondo blanco al 14% y un borde interior de 1px.
Se configura con variables, así cada superficie usa la misma clase con otro tinte:

| Variable         | Para qué                                    |
| ---------------- | ------------------------------------------- |
| `--vidrio-fondo` | Color del vidrio (las hojas usan uno denso) |
| `--vidrio-borde` | El borde interior                           |
| `--vidrio-opaco` | El color cuando el vidrio pasa a opaco      |

## Accesibilidad

- **Más contraste** (`prefers-contrast: more`) o **menos transparencia**
  (`prefers-reduced-transparency`): el vidrio pasa a opaco y las filas también.
- **Sin soporte de `backdrop-filter`**: `@supports` usa el fondo opaco.
- **Menos movimiento** (`prefers-reduced-motion`): no gira el placeholder, no
  animan las hojas y el indicador de las pestañas cambia de lugar sin deslizarse.
- Áreas táctiles de 44px, foco visible con teclado, Escape cierra las hojas.

## Dónde se cambia cada cosa

| Qué                                    | Dónde                                                |
| -------------------------------------- | ---------------------------------------------------- |
| Color del local (único acento)         | `local.marca.colorPrincipal` en la carta             |
| Variantes legibles del color           | `logica/color.ts` (`--tint-claro`, `--tint-oscuro`)  |
| Nombre y logo del local en la cabecera | `local.nombre` y `local.marca.logoUrl` en la carta   |
| Vidrio oscuro de la cabecera           | `--vidrio-cabecera`                                  |
| Alto de la barra y de las pestañas     | `--alto-barra` y `--alto-pestanas`                   |
| Fundido de los bordes de las pestañas  | `--fundido-pestanas`                                 |
| Indicador de la pestaña activa         | `.indicador` y `--duracion-indicador` (300ms)        |
| Margen y radio de la tarjeta de video  | `--margen-tarjeta` y `--radio-tarjeta`               |
| Proporción máxima de la tarjeta (2:3)  | el `× 1.5` del `flex` de `.tarjeta`                  |
| Líneas del nombre y de la descripción  | `line-clamp` en `.reel-nombre` y `.reel-descripcion` |
| Gris del texto secundario              | `--video-secundario`                                 |
| Tinte de las hojas                     | `--hoja-tinte` (claro y oscuro)                      |
| Radios y demás tokens                  | `:root` de `src/estilos.css`                         |
| Ancho de la columna en escritorio      | `--columna` (430px desde 768px)                      |
| Curva y duración de las animaciones    | `--resorte`, `--duracion` y `DURACION_MS`            |
| Cuándo se cierra o cambia una hoja     | `logica/hoja.ts`                                     |
