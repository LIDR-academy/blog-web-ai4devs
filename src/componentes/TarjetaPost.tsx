import { Link } from 'react-router-dom'
import type { PostResumen } from '../api/tipos'
import { fechaLegible, recuentoDeComentarios } from '../utilidades/formato'

type Props = {
  post: PostResumen
  /** La variante compacta se usa en «relacionados» y en la barra lateral. */
  compacta?: boolean
  /** Muestra el numero de comentarios (obligatorio en los relacionados del detalle). */
  mostrarComentarios?: boolean
}

export function TarjetaPost({ post, compacta = false, mostrarComentarios = true }: Props) {
  return (
    <article className={compacta ? 'tarjeta tarjeta--compacta' : 'tarjeta'}>
      <Link to={`/post/${post.slug}`} className="tarjeta__portada">
        <img src={post.imagen_portada} alt="" loading="lazy" />
        <span className="etiqueta-categoria etiqueta-categoria--sobre-imagen">{post.categoria.nombre}</span>
      </Link>

      <div className="tarjeta__cuerpo">
        <p className="tarjeta__meta">
          <time dateTime={post.publicado_en ?? undefined}>{fechaLegible(post.publicado_en)}</time>
          {mostrarComentarios && (
            <>
              <span aria-hidden="true"> · </span>
              <span className="tarjeta__comentarios">{recuentoDeComentarios(post.comentarios)}</span>
            </>
          )}
        </p>

        <h3 className="tarjeta__titulo">
          <Link to={`/post/${post.slug}`}>{post.titulo}</Link>
        </h3>

        {!compacta && <p className="tarjeta__resumen">{post.resumen}</p>}

        <footer className="tarjeta__pie">
          <img className="avatar avatar--pequeno" src={post.autor.avatar} alt="" loading="lazy" />
          <span>
            <Link to={`/autor/${post.autor.id}`} className="tarjeta__autor">
              {post.autor.nombre}
            </Link>
            <span className="tarjeta__rol">{post.autor.rol}</span>
          </span>
        </footer>

        {!compacta && post.etiquetas.length > 0 && (
          <ul className="lista-etiquetas">
            {post.etiquetas.map((etiqueta) => (
              <li key={etiqueta.id}>
                <Link to={`/?etiqueta=${etiqueta.slug}`} className="pastilla">
                  #{etiqueta.nombre}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
