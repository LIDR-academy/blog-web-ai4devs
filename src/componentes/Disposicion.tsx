import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { URL_API } from '../api/cliente'

/** Marco comun: cabecera, contenido de la ruta y pie. */
export function Disposicion() {
  return (
    <div className="pagina">
      <Cabecera />
      <main className="contenido">
        <Outlet />
      </main>
      <PiePagina />
    </div>
  )
}

function Cabecera() {
  const navegar = useNavigate()
  const [consulta, setConsulta] = useState('')

  return (
    <header className="cabecera">
      <div className="cabecera__interior">
        <Link to="/" className="marca">
          <span className="marca__nombre">Corriente</span>
          <span className="marca__lema">Desarrollo, oficio y herramientas</span>
        </Link>

        <nav className="navegacion" aria-label="Principal">
          <NavLink to="/" end>
            Portada
          </NavLink>
          <NavLink to="/buscar">Búsqueda semántica</NavLink>
        </nav>

        <form
          className="buscador buscador--cabecera"
          onSubmit={(evento) => {
            evento.preventDefault()
            const limpia = consulta.trim()
            if (limpia.length >= 3) {
              navegar(`/buscar?q=${encodeURIComponent(limpia)}`)
            }
          }}
        >
          <label className="visualmente-oculto" htmlFor="buscador-cabecera">
            Buscar
          </label>
          <input
            id="buscador-cabecera"
            type="search"
            placeholder="Buscar…"
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
          />
        </form>
      </div>
    </header>
  )
}

function PiePagina() {
  return (
    <footer className="pie">
      <div className="pie__interior">
        <p>
          <strong>Corriente</strong> — material didáctico. Este front (<code>blog-web</code>) no tiene base de datos:
          todo lo que ves lo sirve <code>blog-api</code>.
        </p>
        <p className="pie__tenue">
          API configurada en <code>{URL_API}</code>. La búsqueda semántica la resuelve <code>blog-ai</code>, un tercer
          repositorio al que blog-web nunca llama directamente.
        </p>
      </div>
    </footer>
  )
}
