import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { buscar, preguntar } from '../api/cliente'
import { BarraLateral } from '../componentes/BarraLateral'
import { Cargando, ErrorDeIa, Vacio } from '../componentes/Estados'
import { TarjetaPost } from '../componentes/TarjetaPost'
import { usePeticion } from '../ganchos/usePeticion'
import { puntuacionLegible } from '../utilidades/formato'

/**
 * Busqueda semantica. Las dos mitades de esta pagina (`POST /buscar` y `POST /preguntar`)
 * son las UNICAS del front que cruzan un segundo limite de servicio: blog-api recibe la
 * peticion y la delega en blog-ai. Por eso van en peticiones separadas y con su propio
 * estado de error: si el modelo esta caido, cae esta pagina y no el resto del blog.
 */
export function Busqueda() {
  const [parametros, setParametros] = useSearchParams()
  const consulta = (parametros.get('q') ?? '').trim()
  const [borrador, setBorrador] = useState(consulta)

  return (
    <div className="disposicion-dos-columnas">
      <div>
        <header className="portada__cabecera">
          <h1>Búsqueda semántica</h1>
          <p>
            Esto no es un <code>LIKE</code> sobre el título: la consulta se convierte en vectores y se compara por
            significado.{' '}
            <strong>
              Lo resuelve <code>blog-ai</code>, un repositorio aparte
            </strong>
            , al que <code>blog-web</code> llega siempre a través de <code>blog-api</code>.
          </p>
        </header>

        <form
          className="buscador buscador--grande"
          onSubmit={(evento) => {
            evento.preventDefault()
            const limpia = borrador.trim()
            if (limpia.length >= 3) {
              setParametros({ q: limpia })
            }
          }}
        >
          <label className="visualmente-oculto" htmlFor="buscador-pagina">
            Consulta
          </label>
          <input
            id="buscador-pagina"
            type="search"
            placeholder="Por ejemplo: cómo repartir el trabajo entre servicios"
            value={borrador}
            onChange={(evento) => setBorrador(evento.target.value)}
            minLength={3}
          />
          <button type="submit" className="boton">
            Buscar
          </button>
        </form>

        {consulta.length < 3 ? (
          <Vacio texto="Escribe al menos 3 caracteres para lanzar una búsqueda." />
        ) : (
          <>
            <RespuestaGenerada consulta={consulta} />
            <Resultados consulta={consulta} />
          </>
        )}
      </div>

      <BarraLateral />
    </div>
  )
}

function Resultados({ consulta }: { consulta: string }) {
  const { datos, cargando, error, recargar } = usePeticion(() => buscar(consulta, 5), [consulta])

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Artículos parecidos</h2>
      <p className="seccion__fuente">
        Origen: <code>POST /buscar</code> en blog-api → blog-ai
      </p>

      {cargando && <Cargando texto="Comparando significados… (el modelo puede tardar unos segundos)" />}
      {error && <ErrorDeIa error={error} onReintentar={recargar} />}

      {datos && datos.resultados.length === 0 && (
        <Vacio texto="La búsqueda no ha encontrado ningún artículo parecido." />
      )}

      {datos && datos.resultados.length > 0 && (
        <ul className="resultados">
          {datos.resultados.map((resultado) => (
            <li key={resultado.post_id}>
              <div className="resultado">
                <div className="resultado__cabecera">
                  <h3>
                    <Link to={`/post/${resultado.slug}`}>{resultado.titulo}</Link>
                  </h3>
                  <span className="puntuacion" title="Similitud semántica de 0 a 1">
                    {puntuacionLegible(resultado.puntuacion)}
                  </span>
                </div>
                <p className="resultado__resumen">{resultado.resumen}</p>

                {resultado.fragmento && (
                  <p className="resultado__fragmento">
                    <span className="resultado__rotulo">Fragmento que ha coincidido</span>
                    {resultado.fragmento}
                  </p>
                )}

                {resultado.post ? (
                  <div className="resultado__tarjeta">
                    <TarjetaPost post={resultado.post} compacta />
                  </div>
                ) : (
                  <p className="resultado__aviso">
                    El índice semántico conoce este artículo, pero blog-api no ha devuelto su ficha (puede haber
                    pasado a borrador después de indexarse).
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RespuestaGenerada({ consulta }: { consulta: string }) {
  const { datos, cargando, error, recargar } = usePeticion(() => preguntar(consulta), [consulta])

  return (
    <section className="seccion respuesta-ia">
      <h2 className="seccion__titulo">Respuesta generada</h2>
      <p className="seccion__fuente">
        Origen: <code>POST /preguntar</code> en blog-api → blog-ai · redactada a partir de los artículos del blog
      </p>

      {cargando && <Cargando texto="Redactando la respuesta… (esto tarda más que una búsqueda normal)" />}
      {error && <ErrorDeIa error={error} onReintentar={recargar} />}

      {datos && (
        <>
          <p className="respuesta-ia__texto">{datos.respuesta}</p>

          {datos.modelo && (
            <p className="respuesta-ia__modelo">
              Redactado por el modelo <code>{datos.modelo}</code>, que corre dentro de blog-ai.
            </p>
          )}

          {datos.fuentes.length > 0 && (
            <div className="respuesta-ia__fuentes">
              <h3>Fuentes citadas</h3>
              <ul>
                {datos.fuentes.map((fuente) => (
                  <li key={fuente.post_id}>
                    <Link to={`/post/${fuente.slug}`}>{fuente.titulo}</Link>
                    <span className="puntuacion puntuacion--pequena">{puntuacionLegible(fuente.puntuacion)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}
