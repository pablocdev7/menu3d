import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  DURACION_MS,
  alternarAltura,
  destinoAlSoltar,
  type Altura,
} from "../logica/hoja.js";

interface Gesto {
  inicioY: number;
  altoInicial: number;
  movio: boolean;
}

// Hoja inferior estilo iOS: barrita de arrastre, dos alturas (media y completa) y
// cierre deslizando hacia abajo, tocando afuera, con "Listo" o con Escape.
// `children` recibe `cerrar` para que el contenido pueda cerrar con animación.
export function Hoja(props: {
  etiqueta: string;
  alturaInicial: Altura;
  alCerrar: () => void;
  children: (cerrar: () => void) => ReactNode;
}) {
  const { alCerrar } = props;
  const ref = useRef<HTMLElement>(null);
  const gesto = useRef<Gesto | null>(null);
  const huboArrastre = useRef(false);
  const cerrando = useRef(false);

  const [visible, setVisible] = useState(false);
  const [altura, setAltura] = useState<Altura>(props.alturaInicial);
  // Alto en px mientras se arrastra (y al cerrar desde un arrastre, para que no salte).
  const [altoFijo, setAltoFijo] = useState<number | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  // Forzamos un layout con la hoja abajo y recién ahí la subimos, así la transición corre.
  useLayoutEffect(() => {
    ref.current?.getBoundingClientRect();
    setVisible(true);
  }, []);

  // Foco adentro al abrir y de vuelta donde estaba al cerrar (navegación con teclado).
  useEffect(() => {
    const anterior =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    ref.current?.focus({ preventScroll: true });
    return () => anterior?.focus({ preventScroll: true });
  }, []);

  const cerrar = useCallback(() => {
    if (cerrando.current) return;
    cerrando.current = true;
    setVisible(false);
    const sinMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.setTimeout(alCerrar, sinMovimiento ? 0 : DURACION_MS);
  }, [alCerrar]);

  useEffect(() => {
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [cerrar]);

  const alBajar = (evento: PointerEvent<HTMLDivElement>) => {
    const hoja = ref.current;
    if (!hoja) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    gesto.current = {
      inicioY: evento.clientY,
      altoInicial: hoja.offsetHeight,
      movio: false,
    };
  };

  const alMover = (evento: PointerEvent<HTMLDivElement>) => {
    const g = gesto.current;
    if (!g) return;
    const delta = evento.clientY - g.inicioY;
    if (!g.movio && Math.abs(delta) < 6) return; // un toque no es un arrastre
    g.movio = true;
    setArrastrando(true);
    setAltoFijo(
      Math.min(window.innerHeight, Math.max(0, g.altoInicial - delta)),
    );
  };

  const alSoltar = (evento: PointerEvent<HTMLDivElement>) => {
    const g = gesto.current;
    gesto.current = null;
    if (!g?.movio) return;
    huboArrastre.current = true;
    setArrastrando(false);
    const destino = destinoAlSoltar(
      altura,
      evento.clientY - g.inicioY,
      g.altoInicial,
    );
    if (destino === "cerrada") {
      cerrar();
    } else {
      setAltura(destino);
      setAltoFijo(null);
    }
  };

  const alCancelar = () => {
    gesto.current = null;
    setArrastrando(false);
    setAltoFijo(null);
  };

  // El click que sigue a un arrastre no debe alternar la altura.
  const alTocarAgarre = () => {
    if (huboArrastre.current) {
      huboArrastre.current = false;
      return;
    }
    setAltura(alternarAltura);
  };

  const clases = [
    "hoja vidrio",
    `hoja-${altura}`,
    visible ? "" : "hoja-fuera",
    arrastrando ? "hoja-arrastrando" : "",
  ].join(" ");

  return (
    <>
      <div
        className={visible ? "hoja-fondo visible" : "hoja-fondo"}
        onClick={cerrar}
        aria-hidden="true"
      />
      <section
        ref={ref}
        className={clases}
        style={altoFijo !== null ? { height: `${altoFijo}px` } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={props.etiqueta}
        tabIndex={-1}
      >
        <div
          className="hoja-asa"
          onPointerDown={alBajar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alCancelar}
        >
          <button
            type="button"
            className="hoja-agarre"
            aria-label={altura === "media" ? "Agrandar" : "Achicar"}
            onClick={alTocarAgarre}
          >
            <span className="hoja-barrita" />
          </button>
          <button type="button" className="hoja-listo" onClick={cerrar}>
            Listo
          </button>
        </div>
        <div className="hoja-contenido">{props.children(cerrar)}</div>
      </section>
    </>
  );
}
