import { Link } from 'react-router-dom'

export type Miga = { texto: string; a?: string }

/** Migas de pan del detalle. La ultima nunca es enlace: es donde estas. */
export function Migas({ migas }: { migas: Miga[] }) {
  return (
    <nav className="migas" aria-label="Migas de pan">
      <ol>
        {migas.map((miga, indice) => (
          <li key={`${miga.texto}-${indice}`}>
            {miga.a ? <Link to={miga.a}>{miga.texto}</Link> : <span aria-current="page">{miga.texto}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
