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

// Cuánto hay que desplazarse para que la cápsula de categorías se achique.
const UMBRAL_COMPACTAR_PX = 8;

// Pantalla principal: el video a pantalla completa, la cápsula de categorías arriba
// y dos cápsulas de acciones abajo, todo flotando en vidrio.
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
  const ultimoScroll = useRef(0);
  const [compacta, setCompacta] = useState(false);
  const [actual, setActual] = useState<Plato | undefined>(grupo.platos[0]);

  // Al venir desde "Ver toda la carta", saltamos directo al plato elegido.
  // (El reel arranca arriba solo: tiene key={activa} y se remonta al cambiar.)
  useLayoutEffect(() => {
    ultimoScroll.current = 0;
    if (!platoDestino) return;
    document
      .getElementById(idDePlato(platoDestino))
      ?.scrollIntoView({ block: "start" });
    alLlegar();
  }, [activa, platoDestino, alLlegar]);

  // Qué plato está en pantalla: lo usan las cápsulas de abajo y el fondo de escritorio.
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

  const alDesplazar = () => {
    const y = refReel.current?.scrollTop ?? 0;
    if (Math.abs(y - ultimoScroll.current) < UMBRAL_COMPACTAR_PX) return;
    ultimoScroll.current = y;
    setCompacta(true);
  };

  const platoActual =
    actual && actual.categoriaId === activa ? actual : grupo.platos[0];

  return (
    <div className="escena">
      <FondoEscritorio plato={platoActual} />

      <div className="reels">
        <CapsulaCategorias
          grupos={props.grupos}
          activa={activa}
          compacta={compacta}
          alElegir={(id) => {
            setCompacta(false);
            props.alElegirCategoria(id);
          }}
          alExpandir={() => setCompacta(false)}
        />

        <main
          key={activa}
          ref={refReel}
          className="reel"
          aria-label={grupo.categoria.nombre}
          onScroll={alDesplazar}
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
              <MediaPlato plato={plato} />
              <TextoPlato
                plato={plato}
                nombreLocal={props.nombreLocal}
                logoLocal={props.logoLocal}
              />
            </article>
          ))}
        </main>

        <div className="capsulas-abajo">
          <button
            type="button"
            className="capsula-boton vidrio"
            onClick={() => platoActual && props.alVerInfo(platoActual)}
          >
            Ingredientes y alérgenos
          </button>
          <button
            type="button"
            className="capsula-boton vidrio"
            onClick={props.alVerCarta}
          >
            Ver toda la carta
          </button>
        </div>
      </div>
    </div>
  );
}

// Cápsula de vidrio con las categorías. La pastilla clara se desliza hasta la activa;
// en modo compacto solo queda la activa, y tocarla vuelve a abrir la cápsula.
function CapsulaCategorias(props: {
  grupos: Grupo[];
  activa: string;
  compacta: boolean;
  alElegir: (categoriaId: string) => void;
  alExpandir: () => void;
}) {
  const refPista = useRef<HTMLDivElement>(null);
  const refPastilla = useRef<HTMLSpanElement>(null);
  const { activa, compacta } = props;
  const nombreActiva =
    props.grupos.find((g) => g.categoria.id === activa)?.categoria.nombre ?? "";

  // Movemos la pastilla con estilos directos: así la transición corre en CSS.
  useLayoutEffect(() => {
    const ubicar = () => {
      const pista = refPista.current;
      const pastilla = refPastilla.current;
      const boton = pista?.querySelector<HTMLElement>('[aria-current="true"]');
      if (!pista || !pastilla || !boton) return;
      pastilla.style.width = `${boton.offsetWidth}px`;
      pastilla.style.transform = `translateX(${boton.offsetLeft}px)`;
      boton.scrollIntoView({ block: "nearest", inline: "nearest" });
    };
    ubicar();
    window.addEventListener("resize", ubicar);
    return () => window.removeEventListener("resize", ubicar);
  }, [activa, compacta]);

  return (
    <div className="capsulas-arriba">
      <nav
        className={compacta ? "capsula vidrio oculta" : "capsula vidrio"}
        aria-label="Categorías"
        inert={compacta}
      >
        <div className="capsula-pista" ref={refPista}>
          <span className="pastilla" ref={refPastilla} aria-hidden="true" />
          {props.grupos.map(({ categoria }) => (
            <button
              key={categoria.id}
              type="button"
              className="categoria"
              aria-current={categoria.id === activa ? "true" : undefined}
              onClick={() => props.alElegir(categoria.id)}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </nav>

      <button
        type="button"
        className={
          compacta
            ? "capsula-compacta vidrio"
            : "capsula-compacta vidrio oculta"
        }
        aria-label={`${nombreActiva}. Ver todas las categorías`}
        inert={!compacta}
        onClick={props.alExpandir}
      >
        <span className="pastilla-compacta">{nombreActiva}</span>
      </button>
    </div>
  );
}

// Identidad del local, nombre, precio y descripción directo sobre el video,
// con un velo oscuro detrás.
function TextoPlato(props: {
  plato: Plato;
  nombreLocal: string;
  logoLocal: string | undefined;
}) {
  const { plato } = props;
  const etiquetas = lineaEtiquetas(plato.etiquetas);
  return (
    <div className="reel-texto">
      <p className="reel-local">
        {/* alt vacío: el nombre del local está al lado y no queremos leerlo dos veces. */}
        {props.logoLocal && (
          <img className="reel-local-logo" src={props.logoLocal} alt="" />
        )}
        <span>{props.nombreLocal}</span>
      </p>
      <div className="reel-cabecera">
        <h2 className="reel-nombre">{plato.nombre}</h2>
        <span className="reel-precio precio">{textoPrecio(plato)}</span>
      </div>
      {plato.descripcion && (
        <p className="reel-descripcion">{plato.descripcion}</p>
      )}
      {(plato.destacado || etiquetas) && (
        <p className="reel-etiquetas">
          {plato.destacado && <span className="de-la-casa">De la casa</span>}
          {plato.destacado && etiquetas && " · "}
          {etiquetas}
        </p>
      )}
    </div>
  );
}
