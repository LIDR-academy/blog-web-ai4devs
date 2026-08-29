import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { detalleDePost, postsRelacionados } from '../api/cliente'
import { BarraLateral } from '../componentes/BarraLateral'
import { CajaAutor } from '../componentes/CajaAutor'
import { Comentarios } from '../componentes/Comentarios'
import { CompartirLateral } from '../componentes/CompartirLateral'
import { CuerpoMarkdown } from '../componentes/CuerpoMarkdown'
import { Cargando, ErrorApi } from '../componentes/Estados'
import { Migas } from '../componentes/Migas'
import { TarjetaPost } from '../componentes/TarjetaPost'
import { usePeticion } from '../ganchos/usePeticion'
import { fechaLegible } from '../utilidades/formato'

export function DetallePost() {
  const { slug = '' } = useParams()
  const { datos: post, cargando, error, recargar } = usePeticion(() => detalleDePost(slug), [slug])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (cargando) {
    return <Cargando texto="Cargando el artículo…" />
  }

  if (error) {
    // Un borrador y un slug inexistente responden lo mismo (404): la API no filtra ni su existencia.
    if (error.esNoEncontrado) {
      return (
        <div className="estado estado--vacio">
          <p className="estado__titulo">Ese artículo no existe</p>
          <p>Puede que la dirección esté mal escrita o que el artículo todavía sea un borrador.</p>
          <Link className="boton" to="/">
            Volver a la portada
          </Link>
        </div>
      )
    }
    return <ErrorApi error={error} onReintentar={recargar} />
  }

  if (!post) {
    return null
  }

  return (
    <div className="disposicion-dos-columnas">
      <div>
        <Migas
          migas={[
            { texto: 'Portada', a: '/' },
            { texto: post.categoria.nombre, a: `/?categoria=${post.categoria.slug}` },
            { texto: post.titulo },
          ]}
        />

        <article className="articulo">
          <header className="articulo__cabecera">
            <Link className="etiqueta-categoria" to={`/?categoria=${post.categoria.slug}`}>
              {post.categoria.nombre}
            </Link>
            <h1 className="articulo__titulo">{post.titulo}</h1>
            <p className="articulo__resumen">{post.resumen}</p>

            <div className="articulo__firma">
              <img className="avatar" src={post.autor.avatar} alt="" />
              <div>
                <Link to={`/autor/${post.autor.id}`} className="articulo__autor">
                  {post.autor.nombre}
                </Link>
                <p className="articulo__rol">{post.autor.rol}</p>
              </div>
              <p className="articulo__fecha">
                <time dateTime={post.publicado_en ?? undefined}>{fechaLegible(post.publicado_en)}</time>
              </p>
            </div>
          </header>

          <img className="articulo__portada" src={post.imagen_portada} alt="" />

          <div className="articulo__lienzo">
            <CompartirLateral titulo={post.titulo} slug={post.slug} />
            <CuerpoMarkdown cuerpo={post.cuerpo} />
          </div>

          {post.etiquetas.length > 0 && (
            <ul className="lista-etiquetas lista-etiquetas--articulo">
              {post.etiquetas.map((etiqueta) => (
                <li key={etiqueta.id}>
                  <Link to={`/?etiqueta=${etiqueta.slug}`} className="pastilla">
                    #{etiqueta.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <CajaAutor autor={post.autor} />

        <nav className="vecinos" aria-label="Artículo anterior y siguiente">
          {post.anterior ? (
            <Link className="vecino vecino--anterior" to={`/post/${post.anterior.slug}`}>
              <span className="vecino__rotulo">← Anterior</span>
              <span className="vecino__titulo">{post.anterior.titulo}</span>
            </Link>
          ) : (
            <span className="vecino vecino--vacio">Este es el artículo más antiguo</span>
          )}

          {post.siguiente ? (
            <Link className="vecino vecino--siguiente" to={`/post/${post.siguiente.slug}`}>
              <span className="vecino__rotulo">Siguiente →</span>
              <span className="vecino__titulo">{post.siguiente.titulo}</span>
            </Link>
          ) : (
            <span className="vecino vecino--vacio">Este es el artículo más reciente</span>
          )}
        </nav>

        <Relacionados slug={post.slug} />

        <Comentarios slug={post.slug} comentarios={post.comentarios_lista} total={post.comentarios} />
      </div>

      <BarraLateral />
    </div>
  )
}

/**
 * Los relacionados son una peticion aparte (`/posts/:slug/relacionados`), no vienen dentro
 * del detalle. Si fallan, el articulo se sigue leyendo: por eso tienen su propio estado.
 */
function Relacionados({ slug }: { slug: string }) {
  const { datos, cargando, error } = usePeticion(() => postsRelacionados(slug, 2), [slug])

  if (cargando) {
    return <Cargando texto="Buscando artículos relacionados…" />
  }

  if (error || !datos || datos.length === 0) {
    return null
  }

  return (
    <section className="relacionados">
      <h2 className="seccion__titulo">También te puede interesar</h2>
      <div className="rejilla rejilla--dos">
        {datos.map((post) => (
          <TarjetaPost key={post.id} post={post} mostrarComentarios />
        ))}
      </div>
    </section>
  )
}
