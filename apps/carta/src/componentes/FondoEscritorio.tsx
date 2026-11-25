import { useSyncExternalStore } from "react";
import type { Plato } from "@menu3d/shared";

const CONSULTA = "(min-width: 768px)";

// Lee una media query y re-renderiza cuando cambia (por ejemplo, al rotar o redimensionar).
function usarPantallaGrande(): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const consulta = window.matchMedia(CONSULTA);
      consulta.addEventListener("change", avisar);
      return () => consulta.removeEventListener("change", avisar);
    },
    () => window.matchMedia(CONSULTA).matches,
  );
}

// En pantallas grandes, detrás de la columna: el video o la foto del plato actual,
// muy desenfocado y oscurecido. En el celular no se monta (no gasta datos).
export function FondoEscritorio({ plato }: { plato: Plato | undefined }) {
  const grande = usarPantallaGrande();
  const media = plato?.media;
  if (!grande || !media) return null;
  return (
    <div className="fondo-escritorio" aria-hidden="true">
      {media.tipo === "video" ? (
        <video
          key={media.url}
          src={media.url}
          poster={media.poster}
          muted
          loop
          autoPlay
          playsInline
        />
      ) : (
        <img key={media.url} src={media.url} alt="" />
      )}
    </div>
  );
}
