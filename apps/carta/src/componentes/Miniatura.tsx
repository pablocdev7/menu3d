import type { Plato } from "@menu3d/shared";
import { imagenDe } from "../logica/carta.js";

// Miniatura de 56px para la carta completa: foto, póster del video o un plato vacío.
export function Miniatura({ plato }: { plato: Plato }) {
  const url = imagenDe(plato);
  if (url) {
    return <img className="miniatura" src={url} alt="" loading="lazy" />;
  }
  return (
    <span className="miniatura miniatura-vacia" aria-hidden="true">
      <span className="miniatura-plato" />
    </span>
  );
}
