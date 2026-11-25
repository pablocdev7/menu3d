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

## Qué es Liquid Glass

Es el lenguaje visual de iOS donde el contenido es protagonista y los controles
flotan encima como vidrio: dejan ver lo que hay detrás, desenfocado. Acá el video
ocupa toda la pantalla (también detrás de la barra de estado) y arriba y abajo
flotan cápsulas de vidrio. El texto del plato va directo sobre el video, con un velo
oscuro en el tercio inferior para que se lea aunque el plato sea claro.

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
- **Menos movimiento** (`prefers-reduced-motion`): no gira el placeholder ni animan
  las hojas, la pastilla ni la cápsula.
- Áreas táctiles de 44px, foco visible con teclado, Escape cierra las hojas.

## Dónde se cambia cada cosa

| Qué                                  | Dónde                                               |
| ------------------------------------ | --------------------------------------------------- |
| Color del local (único acento)       | `local.marca.colorPrincipal` en la carta            |
| Variantes legibles del color         | `logica/color.ts` (`--tint-claro`, `--tint-oscuro`) |
| Nombre y logo del local en cada reel | `local.nombre` y `local.marca.logoUrl` en la carta  |
| Vidrio oscuro de las cápsulas        | `--vidrio-video-fondo` y `--vidrio-video-borde`     |
| Tinte de las hojas                   | `--hoja-tinte` (claro y oscuro)                     |
| Velo, radios y demás tokens          | `:root` de `src/estilos.css`                        |
| Ancho de la columna en escritorio    | `--columna` (430px desde 768px)                     |
| Curva y duración de las animaciones  | `--resorte`, `--duracion` y `DURACION_MS`           |
| Cuándo se cierra o cambia una hoja   | `logica/hoja.ts`                                    |
