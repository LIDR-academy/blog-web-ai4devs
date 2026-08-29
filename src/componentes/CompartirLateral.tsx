type Props = {
  titulo: string
  slug: string
}

/**
 * Barra vertical de compartir. Son enlaces estaticos a propósito: compartir no toca
 * blog-api ni necesita JavaScript, y anadir un SDK de terceros no aporta nada aqui.
 */
export function CompartirLateral({ titulo, slug }: Props) {
  const url = `${window.location.origin}/post/${slug}`
  const textoCodificado = encodeURIComponent(titulo)
  const urlCodificada = encodeURIComponent(url)

  const enlaces = [
    { nombre: 'X', letra: 'X', href: `https://twitter.com/intent/tweet?text=${textoCodificado}&url=${urlCodificada}` },
    { nombre: 'Facebook', letra: 'f', href: `https://www.facebook.com/sharer/sharer.php?u=${urlCodificada}` },
    {
      nombre: 'LinkedIn',
      letra: 'in',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${urlCodificada}`,
    },
    { nombre: 'Correo', letra: '@', href: `mailto:?subject=${textoCodificado}&body=${urlCodificada}` },
  ]

  return (
    <div className="compartir">
      <span className="compartir__rotulo">Compartir</span>
      <ul>
        {enlaces.map((enlace) => (
          <li key={enlace.nombre}>
            <a
              href={enlace.href}
              target="_blank"
              rel="noreferrer noopener"
              title={`Compartir en ${enlace.nombre}`}
              aria-label={`Compartir en ${enlace.nombre}`}
            >
              <span aria-hidden="true">{enlace.letra}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
