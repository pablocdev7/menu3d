import type { ReactNode } from "react";

// Lista agrupada estilo iOS ("inset grouped"): título chico, filas sobre una tarjeta
// con separadores y una nota opcional al pie.
export function Grupo(props: {
  titulo?: string;
  pie?: string;
  children: ReactNode;
}) {
  return (
    <section className="grupo">
      {props.titulo && <h3 className="grupo-titulo">{props.titulo}</h3>}
      <ul className="grupo-filas">{props.children}</ul>
      {props.pie && <p className="grupo-pie">{props.pie}</p>}
    </section>
  );
}

export function Fila(props: { children: ReactNode; secundaria?: boolean }) {
  return (
    <li className={props.secundaria ? "fila fila-secundaria" : "fila"}>
      {props.children}
    </li>
  );
}
