import { Link } from 'react-router-dom'
import { ErrorDeApi, URL_API, URL_IA_INFORMATIVA } from '../api/cliente'

/** Bloque de carga. Con `alto` para que la pagina no de un salto al llegar el dato. */
export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="estado estado--cargando" role="status" aria-live="polite">
      <span className="estado__punto" aria-hidden="true" />
      {texto}
    </div>
  )
}

export function Vacio({ texto }: { texto: string }) {
  return <div className="estado estado--vacio">{texto}</div>
}

/**
 * Error de la API con lenguaje distinto segun de QUE repositorio viene el fallo.
 * Es una diferencia que conviene que se vea: un 502 en /buscar no es «la web
 * esta rota», es «el servicio de IA de detras no responde».
 */
export function ErrorApi({ error, onReintentar }: { error: ErrorDeApi; onReintentar?: () => void }) {
  const sinConexion = error.estado === 0

  return (
    <div className="estado estado--error" role="alert">
      <p className="estado__titulo">
        {sinConexion ? 'No se ha podido contactar con blog-api' : `Error ${error.estado}`}
      </p>
      <p className="estado__detalle">{error.message}</p>
      {sinConexion && (
        <p className="estado__pista">
          Comprueba que blog-api está levantado en <code>{URL_API}</code>.
        </p>
      )}
      {onReintentar && (
        <button type="button" className="boton" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}

/**
 * Caso especial de /buscar y /preguntar: quien esta caido no es blog-api sino blog-ai,
 * al que blog-api llama por detras. La interfaz lo dice con esas palabras.
 */
export function ErrorDeIa({ error, onReintentar }: { error: ErrorDeApi; onReintentar?: () => void }) {
  return (
    <div className="estado estado--error" role="alert">
      <p className="estado__titulo">La búsqueda semántica no está disponible</p>
      <p className="estado__detalle">
        {error.esFalloDeIa
          ? `blog-api ha respondido ${error.estado}: no ha podido hablar con blog-ai, el servicio que genera los embeddings y las respuestas.`
          : error.message}
      </p>
      <p className="estado__pista">
        blog-ai es otro repositorio y corre aparte (por defecto en <code>{URL_IA_INFORMATIVA}</code>). blog-web
        nunca lo llama directamente: siempre pasa por blog-api. Mientras esté caído, el resto del blog funciona con
        normalidad.
      </p>
      <div className="estado__acciones">
        {onReintentar && (
          <button type="button" className="boton" onClick={onReintentar}>
            Reintentar
          </button>
        )}
        <Link className="boton boton--suave" to="/">
          Volver a la portada
        </Link>
      </div>
    </div>
  )
}
