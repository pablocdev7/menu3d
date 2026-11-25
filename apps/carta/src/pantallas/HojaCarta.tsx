import { useEffect, useRef } from "react";
import type { Plato } from "@menu3d/shared";
import { Fila, Grupo as GrupoLista } from "../componentes/Lista.js";
import { Miniatura } from "../componentes/Miniatura.js";
import { estaAgotado, textoPrecio, type Grupo } from "../logica/carta.js";
import { progresoTitulo } from "../logica/hoja.js";

// Contenido de la hoja "Ver toda la carta": título grande que se pliega al hacer
// scroll, lista por categoría con miniaturas y la reseña al final.
export function HojaCarta(props: {
  grupos: Grupo[];
  linkResenasGoogle: string | undefined;
  alElegirPlato: (plato: Plato) => void;
}) {
  const refTitulo = useRef<HTMLHeadingElement>(null);

  // Escribimos --progreso directo en el DOM: re-renderizar en cada scroll sería caro.
  useEffect(() => {
    const titulo = refTitulo.current;
    const contenedor = titulo?.closest(".hoja-contenido");
    if (!titulo || !(contenedor instanceof HTMLElement)) return;
    const actualizar = () =>
      titulo.style.setProperty(
        "--progreso",
        String(progresoTitulo(contenedor.scrollTop)),
      );
    actualizar();
    contenedor.addEventListener("scroll", actualizar, { passive: true });
    return () => contenedor.removeEventListener("scroll", actualizar);
  }, []);

  return (
    <>
      <h2 ref={refTitulo} className="titulo-plegable">
        <span>Carta</span>
      </h2>

      {props.grupos.map(({ categoria, platos }) => (
        <GrupoLista key={categoria.id} titulo={categoria.nombre}>
          {platos.map((plato) => (
            <Fila key={plato.id} secundaria={estaAgotado(plato)}>
              <button
                type="button"
                className="fila-boton fila-plato"
                onClick={() => props.alElegirPlato(plato)}
              >
                <Miniatura plato={plato} />
                <span className="fila-textos">
                  <span className="fila-nombre">{plato.nombre}</span>
                  {plato.descripcion && (
                    <span className="fila-descripcion">
                      {plato.descripcion}
                    </span>
                  )}
                </span>
                <span className="precio">{textoPrecio(plato)}</span>
              </button>
            </Fila>
          ))}
        </GrupoLista>
      ))}

      {props.linkResenasGoogle && (
        <a
          className="boton-relleno"
          href={props.linkResenasGoogle}
          target="_blank"
          rel="noopener"
        >
          Dejá tu reseña en Google
        </a>
      )}
    </>
  );
}
