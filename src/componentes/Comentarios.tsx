import { useState } from 'react'
import type { Comentario } from '../api/tipos'
import { fechaLegible, recuentoDeComentarios } from '../utilidades/formato'
import { FormularioComentario } from './FormularioComentario'

type Props = {
  slug: string
  comentarios: Comentario[]
  total: number
}

/**
 * Hilo de comentarios. La API lo devuelve ya en arbol de UN solo nivel
 * (`respuestas` cuelga de una raiz y no anida mas), asi que aqui no se recalcula nada.
 */
export function Comentarios({ slug, comentarios, total }: Props) {
  const [respondiendoA, setRespondiendoA] = useState<number | null>(null)

  return (
    <section className="comentarios" id="comentarios">
      <h2 className="seccion__titulo">{recuentoDeComentarios(total)}</h2>

      {comentarios.length === 0 ? (
        <p className="comentarios__vacio">Todavía no hay comentarios aprobados. Sé el primero.</p>
      ) : (
        <ul className="hilo">
          {comentarios.map((comentario) => (
            <li key={comentario.id}>
              <Burbuja comentario={comentario} onResponder={() => setRespondiendoA(comentario.id)} />

              {respondiendoA === comentario.id && (
                <div className="hilo__respuesta-formulario">
                  <FormularioComentario
                    slug={slug}
                    padreId={comentario.id}
                    onCancelar={() => setRespondiendoA(null)}
                  />
                </div>
              )}

              {comentario.respuestas.length > 0 && (
                <ul className="hilo hilo--anidado">
                  {comentario.respuestas.map((respuesta) => (
                    <li key={respuesta.id}>
                      <Burbuja comentario={respuesta} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      <FormularioComentario slug={slug} />
    </section>
  )
}

function Burbuja({ comentario, onResponder }: { comentario: Comentario; onResponder?: () => void }) {
  return (
    <article className="comentario">
      <header className="comentario__cabecera">
        <span className="comentario__autor">{comentario.autor_nombre}</span>
        <time className="comentario__fecha" dateTime={comentario.creado_en ?? undefined}>
          {fechaLegible(comentario.creado_en)}
        </time>
      </header>
      <p className="comentario__cuerpo">{comentario.cuerpo}</p>
      {onResponder && (
        <button type="button" className="enlace-boton" onClick={onResponder}>
          Responder
        </button>
      )}
    </article>
  )
}
