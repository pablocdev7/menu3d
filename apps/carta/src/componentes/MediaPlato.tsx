import { useEffect, useRef } from "react";
import type { Plato } from "@menu3d/shared";

// Elige qué mostrar: video, foto o el placeholder que gira 360°.
export function MediaPlato({ plato }: { plato: Plato }) {
  const { media } = plato;
  if (media?.tipo === "video") {
    return <VideoVisible url={media.url} poster={media.poster} />;
  }
  if (media?.tipo === "foto") {
    return (
      <img
        className="media"
        src={media.url}
        alt={plato.nombre}
        loading="lazy"
      />
    );
  }
  return <Giro360 />;
}

// Se reproduce solo cuando está en pantalla y se pausa al salir, para no gastar
// datos ni batería con los videos de los platos que no se ven.
function VideoVisible(props: { url: string; poster: string | undefined }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          // Si el navegador bloquea el autoplay, queda el poster: no es un error.
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 },
    );
    observador.observe(video);
    return () => observador.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="media"
      src={props.url}
      poster={props.poster}
      muted
      playsInline
      loop
      preload="metadata"
    />
  );
}

// Un plato en perspectiva que gira lento sobre sí mismo (colores planos, sin degradados).
// Con prefers-reduced-motion queda quieto.
function Giro360() {
  return (
    <div className="media giro" aria-hidden="true">
      <div className="giro-plato">
        <span className="giro-bocado giro-bocado-1" />
        <span className="giro-bocado giro-bocado-2" />
        <span className="giro-bocado giro-bocado-3" />
      </div>
    </div>
  );
}
