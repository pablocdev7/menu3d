import { useCallback, useMemo, useState, type CSSProperties } from "react";
import type { Carta, Plato } from "@menu3d/shared";
import datosCarta from "../../../demo/carta.json";
import { Hoja } from "./componentes/Hoja.js";
import { agruparPorCategoria, cargarCarta } from "./logica/carta.js";
import { variablesDeTint } from "./logica/color.js";
import { HojaCarta } from "./pantallas/HojaCarta.js";
import { HojaInfo } from "./pantallas/HojaInfo.js";
import { PantallaError } from "./pantallas/PantallaError.js";
import { Reels } from "./pantallas/Reels.js";

// Validamos una sola vez al cargar el módulo; el JSON se trata como entrada externa.
const resultado = cargarCarta(datosCarta as unknown);
if (!resultado.ok) console.error("Carta inválida:\n" + resultado.error);

type HojaAbierta = { tipo: "info"; plato: Plato } | { tipo: "carta" } | null;

export function App() {
  if (!resultado.ok) return <PantallaError />;
  return <CartaPublica carta={resultado.carta} />;
}

function CartaPublica({ carta }: { carta: Carta }) {
  const grupos = useMemo(
    () => agruparPorCategoria(carta.categorias, carta.platos),
    [carta],
  );
  // --tint y sus variantes legibles se inyectan acá y las hereda todo el CSS.
  const estilo = useMemo(
    () => variablesDeTint(carta.local.marca.colorPrincipal) as CSSProperties,
    [carta],
  );

  const [categoriaId, setCategoriaId] = useState(grupos[0]?.categoria.id);
  const [platoDestino, setPlatoDestino] = useState<string | null>(null);
  const [hoja, setHoja] = useState<HojaAbierta>(null);
  const alLlegar = useCallback(() => setPlatoDestino(null), []);
  const cerrarHoja = useCallback(() => setHoja(null), []);

  const grupo = grupos.find((g) => g.categoria.id === categoriaId) ?? grupos[0];
  if (!grupo) return <PantallaError />; // una carta sin platos no tiene nada que mostrar

  return (
    <div className="app" style={estilo}>
      <Reels
        nombreLocal={carta.local.nombre}
        logoLocal={carta.local.marca.logoUrl}
        grupos={grupos}
        grupo={grupo}
        platoDestino={platoDestino}
        alElegirCategoria={setCategoriaId}
        alLlegar={alLlegar}
        alVerInfo={(plato) => setHoja({ tipo: "info", plato })}
        alVerCarta={() => setHoja({ tipo: "carta" })}
      />

      {hoja?.tipo === "info" && (
        <Hoja
          etiqueta={`Ingredientes y alérgenos de ${hoja.plato.nombre}`}
          alturaInicial="media"
          alCerrar={cerrarHoja}
        >
          {() => <HojaInfo plato={hoja.plato} />}
        </Hoja>
      )}

      {hoja?.tipo === "carta" && (
        <Hoja
          etiqueta="Carta completa"
          alturaInicial="completa"
          alCerrar={cerrarHoja}
        >
          {(cerrar) => (
            <HojaCarta
              grupos={grupos}
              linkResenasGoogle={carta.local.linkResenasGoogle}
              alElegirPlato={(plato) => {
                // El reel salta detrás de la hoja mientras ella baja.
                setCategoriaId(plato.categoriaId);
                setPlatoDestino(plato.id);
                cerrar();
              }}
            />
          )}
        </Hoja>
      )}
    </div>
  );
}
