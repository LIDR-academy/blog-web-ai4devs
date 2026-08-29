import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listarCategorias, listarEtiquetas, postsRecientes } from '../api/cliente'
import { usePeticion } from '../ganchos/usePeticion'
import { fechaCorta } from '../utilidades/formato'
import { Cargando, ErrorApi } from './Estados'

/**
 * Barra lateral reutilizable: la pintan la portada, el detalle, la busqueda y la ficha de autor.
 *
 * Se trae sus propios datos (categorias, etiquetas y recientes) en vez de recibirlos por props:
 * asi ninguna pagina tiene que acordarse de pedirlos, y si una seccion falla, las demas siguen.
 */
export function BarraLateral() {
  return (
    <aside className="lateral">
      <Buscador />
      <Categorias />
      <Recientes />
      <NubeDeEtiquetas />
      <Galeria />
    </aside>
  )
}

function Buscador() {
  const navegar = useNavigate()
  const [consulta, setConsulta] = useState('')

  return (
    <section className="lateral__bloque">
      <h2 className="lateral__titulo">Buscar</h2>
      <form
        className="buscador"
        onSubmit={(evento) => {
          evento.preventDefault()
          const limpia = consulta.trim()
          if (limpia.length >= 3) {
            navegar(`/buscar?q=${encodeURIComponent(limpia)}`)
          }
        }}
      >
        <label className="visualmente-oculto" htmlFor="buscador-lateral">
          Buscar en el blog
        </label>
        <input
          id="buscador-lateral"
          type="search"
          placeholder="¿Sobre qué quieres leer?"
          value={consulta}
          onChange={(evento) => setConsulta(evento.target.value)}
          minLength={3}
        />
        <button type="submit" className="boton">
          Buscar
        </button>
      </form>
      <p className="lateral__nota">Búsqueda semántica: mínimo 3 caracteres.</p>
    </section>
  )
}

function Categorias() {
  const { datos, cargando, error, recargar } = usePeticion(() => listarCategorias(), [])

  return (
    <section className="lateral__bloque">
      <h2 className="lateral__titulo">Categorías</h2>
      {cargando && <Cargando />}
      {error && <ErrorApi error={error} onReintentar={recargar} />}
      {datos && (
        <ul className="lista-categorias">
          {datos.map((categoria) => (
            <li key={categoria.id}>
              <Link to={`/?categoria=${categoria.slug}`}>{categoria.nombre}</Link>
              <span className="recuento">{categoria.posts}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Recientes() {
  const { datos, cargando, error, recargar } = usePeticion(() => postsRecientes(5), [])

  return (
    <section className="lateral__bloque">
      <h2 className="lateral__titulo">Publicaciones recientes</h2>
      {cargando && <Cargando />}
      {error && <ErrorApi error={error} onReintentar={recargar} />}
      {datos && (
        <ul className="lista-recientes">
          {datos.map((post) => (
            <li key={post.id}>
              <Link to={`/post/${post.slug}`} className="reciente">
                <img src={post.imagen_portada} alt="" loading="lazy" />
                <span>
                  <span className="reciente__titulo">{post.titulo}</span>
                  <span className="reciente__fecha">{fechaCorta(post.publicado_en)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function NubeDeEtiquetas() {
  const { datos, cargando, error, recargar } = usePeticion(() => listarEtiquetas(), [])

  return (
    <section className="lateral__bloque">
      <h2 className="lateral__titulo">Etiquetas</h2>
      {cargando && <Cargando />}
      {error && <ErrorApi error={error} onReintentar={recargar} />}
      {datos && (
        <ul className="nube">
          {datos.map((etiqueta) => (
            <li key={etiqueta.id}>
              <Link to={`/?etiqueta=${etiqueta.slug}`} className="pastilla" title={`${etiqueta.posts} artículos`}>
                #{etiqueta.nombre}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** La galeria no tiene endpoint propio: reutiliza las portadas de los recientes. */
function Galeria() {
  const { datos } = usePeticion(() => postsRecientes(6), [])

  if (!datos || datos.length === 0) {
    return null
  }

  return (
    <section className="lateral__bloque">
      <h2 className="lateral__titulo">Galería</h2>
      <ul className="galeria">
        {datos.map((post) => (
          <li key={post.id}>
            <Link to={`/post/${post.slug}`} title={post.titulo}>
              <img src={post.imagen_portada} alt={post.titulo} loading="lazy" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
