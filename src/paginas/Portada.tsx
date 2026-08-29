import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fichaDeAutor, listarPosts } from '../api/cliente'
import type { FiltrosDeListado } from '../api/tipos'
import { BarraLateral } from '../componentes/BarraLateral'
import { Cargando, ErrorApi, Vacio } from '../componentes/Estados'
import { Paginacion } from '../componentes/Paginacion'
import { TarjetaPost } from '../componentes/TarjetaPost'
import { usePeticion } from '../ganchos/usePeticion'

const POR_PAGINA = 6

/**
 * Portada y, a la vez, pagina de filtros: categoria, etiqueta, autor y texto viajan en la
 * query (`/?categoria=herramientas`). Asi un filtro es una URL que se puede compartir y
 * el boton «atras» del navegador funciona solo.
 */
export function Portada() {
  const [parametros, setParametros] = useSearchParams()

  const filtros: FiltrosDeListado = useMemo(() => {
    const autor = parametros.get('autor')
    return {
      pagina: Number(parametros.get('pagina') ?? 1) || 1,
      por_pagina: POR_PAGINA,
      categoria: parametros.get('categoria') ?? undefined,
      etiqueta: parametros.get('etiqueta') ?? undefined,
      autor: autor ? Number(autor) : undefined,
      q: parametros.get('q') ?? undefined,
    }
  }, [parametros])

  const { datos, cargando, error, recargar } = usePeticion(() => listarPosts(filtros), [
    filtros.pagina,
    filtros.categoria,
    filtros.etiqueta,
    filtros.autor,
    filtros.q,
  ])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [filtros.pagina])

  function cambiarPagina(pagina: number) {
    const siguientes = new URLSearchParams(parametros)
    siguientes.set('pagina', String(pagina))
    setParametros(siguientes)
  }

  const hayFiltro = Boolean(filtros.categoria || filtros.etiqueta || filtros.autor || filtros.q)

  return (
    <div className="disposicion-dos-columnas">
      <div>
        {hayFiltro ? (
          <AvisoDeFiltro filtros={filtros} total={datos?.meta.total} />
        ) : (
          <header className="portada__cabecera">
            <h1>Últimos artículos</h1>
            <p>Todo lo publicado en Corriente, de lo más reciente a lo más antiguo.</p>
          </header>
        )}

        {cargando && <Cargando texto="Cargando artículos…" />}
        {error && <ErrorApi error={error} onReintentar={recargar} />}

        {datos && datos.datos.length === 0 && <Vacio texto="No hay artículos que cumplan ese filtro." />}

        {datos && datos.datos.length > 0 && (
          <>
            <div className="rejilla">
              {datos.datos.map((post) => (
                <TarjetaPost key={post.id} post={post} />
              ))}
            </div>
            <Paginacion meta={datos.meta} onCambiar={cambiarPagina} />
          </>
        )}
      </div>

      <BarraLateral />
    </div>
  )
}

/** Cabecera alternativa cuando hay filtro activo, con el enlace para quitarlo. */
function AvisoDeFiltro({ filtros, total }: { filtros: FiltrosDeListado; total?: number }) {
  const { datos: autor } = usePeticion(
    () => (filtros.autor ? fichaDeAutor(filtros.autor) : Promise.resolve(null)),
    [filtros.autor]
  )

  const partes: string[] = []
  if (filtros.categoria) partes.push(`categoría «${filtros.categoria}»`)
  if (filtros.etiqueta) partes.push(`etiqueta «${filtros.etiqueta}»`)
  if (filtros.autor) partes.push(`autor «${autor?.nombre ?? filtros.autor}»`)
  if (filtros.q) partes.push(`texto «${filtros.q}»`)

  return (
    <header className="portada__cabecera">
      <h1>Artículos filtrados</h1>
      <p>
        Filtrando por {partes.join(' + ')}
        {typeof total === 'number' && ` · ${total} resultado${total === 1 ? '' : 's'}`}.{' '}
        <Link to="/" className="enlace-boton">
          Quitar filtros
        </Link>
      </p>
    </header>
  )
}
