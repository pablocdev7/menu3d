import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Plato } from "@menu3d/shared";
import { FondoEscritorio } from "../componentes/FondoEscritorio.js";
import { MediaPlato } from "../componentes/MediaPlato.js";
import {
  estaAgotado,
  lineaEtiquetas,
  textoPrecio,
  type Grupo,
} from "../logica/carta.js";

export const idDePlato = (id: string) => `plato-${id}`;

// Pantalla principal: arriba una barra global (local y "Carta") con las pestañas de
// categorías; debajo, un plato por pantalla con su tarjeta de video y el texto.
export function Reels(props: {
  nombreLocal: string;
  logoLocal: string | undefined;
  grupos: Grupo[];
  grupo: Grupo;
  platoDestino: string | null;
  alElegirCategoria: (categoriaId: string) => void;
  alLlegar: () => void;
  alVerInfo: (plato: Plato) => void;
  alVerCarta: () => void;
}) {
  const { grupo, platoDestino, alLlegar } = props;
  const activa = grupo.categoria.id;
  const refReel = useRef<HTMLElement>(null);
  const [actual, setActual] = useState<Plato | undefined>(grupo.platos[0]);

  // Al elegir un plato en la HojaCarta, saltamos directo a él.
  // (El reel arranca arriba solo: tiene key={activa} y se remonta al cambiar.)
  useLayoutEffect(() => {
    if (!platoDestino) return;
    document
      .getElementById(idDePlato(platoDestino))
      ?.scrollIntoView({ block: "start" });
    alLlegar();
  }, [activa, platoDestino, alLlegar]);

  // Qué plato está en pantalla: lo usa el fondo de escritorio.
  useEffect(() => {
    const reel = refReel.current;
    if (!reel) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const id = (entrada.target as HTMLElement).dataset.plato;
          const plato = grupo.platos.find((p) => p.id === id);
          if (plato) setActual(plato);
        }
      },
      { root: reel, threshold: 0.6 },
    );
    reel
      .querySelectorAll("[data-plato]")
      .forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [grupo]);

  const platoActual =
    actual && actual.categoriaId === activa ? actual : grupo.platos[0];

  return (
    <div className="escena">
      <FondoEscritorio plato={platoActual} />

      <div className="reels">
        <header className="cabecera vidrio">
          <div className="barra">
            <p className="barra-local">
              {/* alt vacío: el nombre del local está al lado y no queremos leerlo dos veces. */}
              {props.logoLocal && (
                <img className="barra-logo" src={props.logoLocal} alt="" />
              )}
              <span>{props.nombreLocal}</span>
            </p>
            <button
              type="button"
              className="barra-carta"
              onClick={props.alVerCarta}
            >
              <IconoLista />
              Carta
            </button>
          </div>

          <PestanasCategorias
            grupos={props.grupos}
            activa={activa}
            alElegir={props.alElegirCategoria}
          />
        </header>

        <main
          key={activa}
          ref={refReel}
          className="reel"
          aria-label={grupo.categoria.nombre}
        >
          {grupo.platos.map((plato) => (
            <article
              key={plato.id}
              id={idDePlato(plato.id)}
              data-plato={plato.id}
              className="reel-item"
              data-agotado={estaAgotado(plato) || undefined}
              aria-label={plato.nombre}
            >
              <div className="tarjeta">
                <MediaPlato plato={plato} />
              </div>
              <TextoPlato plato={plato} alVerInfo={props.alVerInfo} />
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}

// Pestañas de solo texto. Un indicador de 2px se desliza bajo la activa y la pista
// se desplaza para dejarla centrada.
function PestanasCategorias(props: {
  grupos: Grupo[];
  activa: string;
  alElegir: (categoriaId: string) => void;
}) {
  const refPista = useRef<HTMLDivElement>(null);
  const refIndicador = useRef<HTMLSpanElement>(null);
  const { activa } = props;

  // El indicador mide 1px y lo llevamos con transform (posición y escala) hasta el
  // texto de la activa: así la animación corre en CSS y no recalcula el layout.
  useLayoutEffect(() => {
    const ubicar = () => {
      const indicador = refIndicador.current;
      const texto = refPista.current?.querySelector<HTMLElement>(
        '[aria-current="true"] > span',
      );
      if (!indicador || !texto) return;
      indicador.style.transform = `translateX(${texto.offsetLeft}px) scaleX(${texto.offsetWidth})`;
    };
    ubicar();
    window.addEventListener("resize", ubicar);
    return () => window.removeEventListener("resize", ubicar);
  }, [activa]);

  // Centramos la activa. Sin "behavior": lo decide scroll-behavior en el CSS, que
  // con movimiento reducido salta sin animar.
  useEffect(() => {
    refPista.current
      ?.querySelector('[aria-current="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activa]);

  return (
    <nav className="pestanas" aria-label="Categorías">
      <div className="pestanas-pista" ref={refPista}>
        {props.grupos.map(({ categoria }) => (
          <button
            key={categoria.id}
            type="button"
            className="pestana"
            aria-current={categoria.id === activa ? "true" : undefined}
            onClick={() => props.alElegir(categoria.id)}
          >
            <span>{categoria.nombre}</span>
          </button>
        ))}
        <span className="indicador" ref={refIndicador} aria-hidden="true" />
      </div>
    </nav>
  );
}

// Ícono de lista (tres renglones con viñeta), del mismo color que el texto.
function IconoLista() {
  return (
    <svg
      className="icono"
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <g fill="currentColor">
        <circle cx="3.5" cy="5" r="1.5" />
        <circle cx="3.5" cy="10" r="1.5" />
        <circle cx="3.5" cy="15" r="1.5" />
        <rect x="7" y="4.1" width="11" height="1.8" rx="0.9" />
        <rect x="7" y="9.1" width="11" height="1.8" rx="0.9" />
        <rect x="7" y="14.1" width="11" height="1.8" rx="0.9" />
      </g>
    </svg>
  );
}

// Nombre, precio, etiquetas, descripción y el botón de info, sobre negro.
function TextoPlato(props: {
  plato: Plato;
  alVerInfo: (plato: Plato) => void;
}) {
  const { plato } = props;
  const etiquetas = lineaEtiquetas(plato.etiquetas);
  return (
    <div className="reel-texto">
      <h2 className="reel-nombre">{plato.nombre}</h2>
      <p className="reel-precio precio">{textoPrecio(plato)}</p>
      {(plato.destacado || etiquetas) && (
        <p className="reel-etiquetas">
          {plato.destacado && <span className="de-la-casa">De la casa</span>}
          {plato.destacado && etiquetas && " · "}
          {etiquetas}
        </p>
      )}
      {plato.descripcion && (
        <p className="reel-descripcion">{plato.descripcion}</p>
      )}
      <button
        type="button"
        className="reel-info"
        onClick={() => props.alVerInfo(plato)}
      >
        Ingredientes y alérgenos
      </button>
    </div>
  );
}
