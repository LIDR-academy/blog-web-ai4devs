import type { MetaPaginacion } from '../api/tipos'

type Props = {
  meta: MetaPaginacion
  onCambiar: (pagina: number) => void
}

/** Paginacion sencilla: anterior, numeros y siguiente. Se oculta sola si solo hay una pagina. */
export function Paginacion({ meta, onCambiar }: Props) {
  if (meta.paginas <= 1) {
    return null
  }

  const paginas = Array.from({ length: meta.paginas }, (_, indice) => indice + 1)

  return (
    <nav className="paginacion" aria-label="Paginación de artículos">
      <button
        type="button"
        className="paginacion__salto"
        disabled={meta.pagina <= 1}
        onClick={() => onCambiar(meta.pagina - 1)}
      >
        ← Anterior
      </button>

      <ul className="paginacion__numeros">
        {paginas.map((numero) => (
          <li key={numero}>
            <button
              type="button"
              className={numero === meta.pagina ? 'paginacion__numero paginacion__numero--activo' : 'paginacion__numero'}
              aria-current={numero === meta.pagina ? 'page' : undefined}
              onClick={() => onCambiar(numero)}
            >
              {numero}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="paginacion__salto"
        disabled={meta.pagina >= meta.paginas}
        onClick={() => onCambiar(meta.pagina + 1)}
      >
        Siguiente →
      </button>
    </nav>
  )
}
