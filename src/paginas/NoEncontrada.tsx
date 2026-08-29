import { Link } from 'react-router-dom'

export function NoEncontrada() {
  return (
    <div className="estado estado--vacio">
      <p className="estado__titulo">Página no encontrada</p>
      <p>La dirección que has abierto no corresponde a ninguna sección de Corriente.</p>
      <Link className="boton" to="/">
        Volver a la portada
      </Link>
    </div>
  )
}
