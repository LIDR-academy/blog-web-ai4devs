import { Link } from 'react-router-dom'
import type { AutorPublico, Redes } from '../api/tipos'

const NOMBRES_DE_RED: Record<keyof Redes, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
  linkedin: 'LinkedIn',
}

/**
 * Caja de biografia del pie del post. `redes` puede llegar vacia: la API devuelve `{}`
 * cuando el autor no tiene ninguna, asi que se recorre lo que haya, no una lista fija.
 */
export function CajaAutor({ autor }: { autor: AutorPublico }) {
  const redes = Object.entries(autor.redes).filter(([, url]) => Boolean(url)) as [keyof Redes, string][]

  return (
    <section className="caja-autor">
      <img className="avatar avatar--grande" src={autor.avatar} alt={autor.nombre} loading="lazy" />
      <div>
        <p className="caja-autor__rol">{autor.rol}</p>
        <h2 className="caja-autor__nombre">
          <Link to={`/autor/${autor.id}`}>{autor.nombre}</Link>
        </h2>
        <p className="caja-autor__bio">{autor.bio}</p>
        {redes.length > 0 && (
          <ul className="caja-autor__redes">
            {redes.map(([red, url]) => (
              <li key={red}>
                <a href={url} target="_blank" rel="noreferrer noopener">
                  {NOMBRES_DE_RED[red]}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
