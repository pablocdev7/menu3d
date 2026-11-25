import { MENSAJE_ERROR_CARTA } from "../logica/carta.js";

// Se muestra cuando la carta no pasa la validación: la app no se rompe.
// El detalle técnico va a la consola, no al comensal.
export function PantallaError() {
  return (
    <main className="error">
      <p>{MENSAJE_ERROR_CARTA}</p>
    </main>
  );
}
