import { Link, useParams } from 'react-router-dom'
import { fichaDeAutor } from '../api/cliente'
import { BarraLateral } from '../componentes/BarraLateral'
import { CajaAutor } from '../componentes/CajaAutor'
import { Cargando, ErrorApi, Vacio } from '../componentes/Estados'
import { Migas } from '../componentes/Migas'
import { TarjetaPost } from '../componentes/TarjetaPost'
import { usePeticion } from '../ganchos/usePeticion'

/** Ficha de autor: su biografia y todo lo que ha publicado (`GET /autores/:id`). */
export function FichaAutor() {
  const { id = '' } = useParams()
  const identificador = Number(id)
  const { datos, cargando, error, recargar } = usePeticion(() => fichaDeAutor(identificador), [identificador])

  if (cargando) {
    return <Cargando texto="Cargando la ficha del autor…" />
  }

  if (error) {
    if (error.esNoEncontrado) {
      return (
        <div className="estado estado--vacio">
          <p className="estado__titulo">Ese autor no existe</p>
          <Link className="boton" to="/">
            Volver a la portada
          </Link>
        </div>
      )
    }
    return <ErrorApi error={error} onReintentar={recargar} />
  }

  if (!datos) {
    return null
  }

  return (
    <div className="disposicion-dos-columnas">
      <div>
        <Migas migas={[{ texto: 'Portada', a: '/' }, { texto: datos.nombre }]} />

        <CajaAutor autor={datos} />

        <section className="seccion">
          <h2 className="seccion__titulo">Artículos de {datos.nombre}</h2>
          {datos.posts.length === 0 ? (
            <Vacio texto="Este autor todavía no tiene artículos publicados." />
          ) : (
            <div className="rejilla">
              {datos.posts.map((post) => (
                <TarjetaPost key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>

      <BarraLateral />
    </div>
  )
}
