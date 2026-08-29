import { useState } from 'react'
import { crearComentario, ErrorDeApi } from '../api/cliente'
import type { ComentarioCreado } from '../api/tipos'

type Props = {
  slug: string
  /** Si viene, el comentario se manda como respuesta a ese comentario raíz. */
  padreId?: number
  onEnviado?: () => void
  onCancelar?: () => void
}

/**
 * Alta de comentario. La API SIEMPRE lo devuelve en estado «pendiente» (la moderacion es
 * manual), asi que el formulario no anade el comentario a la lista: seria mentirle al
 * lector ensenandole algo que nadie mas ve todavia.
 */
export function FormularioComentario({ slug, padreId, onEnviado, onCancelar }: Props) {
  const [autorNombre, setAutorNombre] = useState('')
  const [autorEmail, setAutorEmail] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creado, setCreado] = useState<ComentarioCreado | null>(null)

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)

    try {
      const resultado = await crearComentario(slug, {
        autor_nombre: autorNombre.trim(),
        autor_email: autorEmail.trim(),
        cuerpo: cuerpo.trim(),
        ...(padreId ? { padre_id: padreId } : {}),
      })
      setCreado(resultado)
      setAutorNombre('')
      setAutorEmail('')
      setCuerpo('')
      onEnviado?.()
    } catch (fallo) {
      setError(
        fallo instanceof ErrorDeApi ? fallo.message : 'No se ha podido enviar el comentario. Inténtalo de nuevo.'
      )
    } finally {
      setEnviando(false)
    }
  }

  if (creado) {
    return (
      <div className="aviso aviso--exito" role="status">
        <p className="aviso__titulo">Pendiente de aprobación</p>
        <p>{creado.mensaje}</p>
        <button type="button" className="boton boton--suave" onClick={() => setCreado(null)}>
          Escribir otro
        </button>
      </div>
    )
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h3 className="formulario__titulo">{padreId ? 'Responder a este comentario' : 'Deja un comentario'}</h3>
      <p className="formulario__nota">
        Tu correo no se publica: la API nunca lo devuelve en ninguna respuesta.
      </p>

      <div className="formulario__fila">
        <label>
          Nombre
          <input
            type="text"
            required
            minLength={2}
            maxLength={80}
            value={autorNombre}
            onChange={(evento) => setAutorNombre(evento.target.value)}
          />
        </label>
        <label>
          Correo electrónico
          <input
            type="email"
            required
            maxLength={160}
            value={autorEmail}
            onChange={(evento) => setAutorEmail(evento.target.value)}
          />
        </label>
      </div>

      <label>
        Comentario
        <textarea
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          value={cuerpo}
          onChange={(evento) => setCuerpo(evento.target.value)}
        />
      </label>

      {error && <p className="formulario__error" role="alert">{error}</p>}

      <div className="formulario__acciones">
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar comentario'}
        </button>
        {onCancelar && (
          <button type="button" className="boton boton--suave" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
