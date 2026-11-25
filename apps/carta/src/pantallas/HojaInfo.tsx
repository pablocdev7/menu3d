import { formatearPrecio, type Plato } from "@menu3d/shared";
import { Fila, Grupo } from "../componentes/Lista.js";
import { capitalizar, infoAlergenos } from "../logica/carta.js";

export const NOTA_INFO =
  "Imagen ilustrativa. Los alérgenos los informa el local.";

// Contenido de la hoja "Ingredientes y alérgenos".
export function HojaInfo({ plato }: { plato: Plato }) {
  const alergenos = infoAlergenos(plato);
  return (
    <>
      <h2 className="hoja-titulo">{plato.nombre}</h2>

      {/* Con varios formatos el reel muestra "desde …": acá van todos los precios. */}
      {plato.formatos.length > 1 && (
        <Grupo titulo="Formatos">
          {plato.formatos.map((formato) => (
            <Fila key={formato.nombre} secundaria={!plato.disponible}>
              <span>{formato.nombre}</span>
              <span className="precio">{formatearPrecio(formato.precio)}</span>
            </Fila>
          ))}
        </Grupo>
      )}

      <Grupo titulo="Ingredientes">
        {plato.ingredientesVisibles.length > 0 ? (
          plato.ingredientesVisibles.map((ingrediente) => (
            <Fila key={ingrediente}>{capitalizar(ingrediente)}</Fila>
          ))
        ) : (
          <Fila secundaria>Sin ingredientes cargados</Fila>
        )}
      </Grupo>

      <Grupo titulo="Alérgenos" pie={NOTA_INFO}>
        {alergenos.tipo === "consultar" ? (
          <Fila>{alergenos.mensaje}</Fila>
        ) : alergenos.alergenos.length > 0 ? (
          alergenos.alergenos.map((texto) => <Fila key={texto}>{texto}</Fila>)
        ) : (
          <Fila secundaria>Sin alérgenos declarados</Fila>
        )}
      </Grupo>
    </>
  );
}
