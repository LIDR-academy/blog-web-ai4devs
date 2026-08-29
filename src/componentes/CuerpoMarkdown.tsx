import { Children, type ReactNode } from 'react'
import Markdown, { type Components } from 'react-markdown'

/**
 * El cuerpo del post llega en Markdown desde blog-api, no en HTML.
 *
 * Lo unico que hay que resolver aqui es el PIE DE FOTO, y no es un detalle estetico:
 * los cuerpos reales del blog escriben la imagen y su pie en la misma linea logica,
 *
 *     ![Texto alternativo](https://…/imagen.jpg)
 *     *Este es el pie de foto.*
 *
 * y como entre las dos lineas no hay linea en blanco, Markdown las mete en el MISMO
 * parrafo. Sin tratarlo, sale un <p> con una imagen suelta y una cursiva detras: se pierde
 * la relacion entre foto y pie, y ademas montar un <figure> dentro de ese <p> es HTML
 * invalido — el navegador lo desanida por su cuenta y se lleva el estilo por delante.
 *
 * Por eso el <figure> lo construye el componente del PARRAFO, no el de la imagen: es el
 * parrafo el unico que ve la foto y su pie a la vez.
 */

/** Los saltos de linea entre la imagen y su pie llegan como cadenas en blanco. */
function esEspacioEnBlanco(nodo: ReactNode): boolean {
  return typeof nodo === 'string' && nodo.trim() === ''
}

const componentes: Components = {
  // La imagen se pinta pelada. Quien decide si va dentro de un <figure> es el parrafo.
  img: ({ src, alt }) => (
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" />
  ),

  p: ({ node, children }) => {
    const primero = node?.children?.[0]
    const empiezaConImagen = primero?.type === 'element' && primero.tagName === 'img'

    if (!empiezaConImagen) {
      return <p>{children}</p>
    }

    const partes = Children.toArray(children)
    const imagen = partes[0]
    const pie = partes.slice(1).filter((parte) => !esEspacioEnBlanco(parte))

    if (pie.length > 0) {
      return (
        <figure className="figura">
          {imagen}
          <figcaption>{pie}</figcaption>
        </figure>
      )
    }

    // Sin linea de pie, se reutiliza el texto alternativo. Va marcado como decorativo
    // porque un lector de pantalla ya lo ha leido en el `alt` de la imagen.
    const alternativo = typeof primero.properties?.alt === 'string' ? primero.properties.alt : ''

    return (
      <figure className="figura">
        {imagen}
        {alternativo && <figcaption aria-hidden="true">{alternativo}</figcaption>}
      </figure>
    )
  },

  a: ({ href, children }) => {
    const esExterno = typeof href === 'string' && /^https?:\/\//.test(href)
    return (
      <a href={href} {...(esExterno ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
        {children}
      </a>
    )
  },
}

export function CuerpoMarkdown({ cuerpo }: { cuerpo: string }) {
  return (
    <div className="prosa">
      <Markdown components={componentes}>{cuerpo}</Markdown>
    </div>
  )
}
