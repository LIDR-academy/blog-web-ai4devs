import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Disposicion } from './componentes/Disposicion'
import { Busqueda } from './paginas/Busqueda'
import { DetallePost } from './paginas/DetallePost'
import { FichaAutor } from './paginas/FichaAutor'
import { NoEncontrada } from './paginas/NoEncontrada'
import { Portada } from './paginas/Portada'

/**
 * Rutas del front. Los filtros (categoria, etiqueta, autor) NO son rutas propias:
 * van como query de la portada, que es la misma llamada a `GET /posts` con parametros.
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Disposicion />}>
          <Route path="/" element={<Portada />} />
          <Route path="/post/:slug" element={<DetallePost />} />
          <Route path="/autor/:id" element={<FichaAutor />} />
          <Route path="/buscar" element={<Busqueda />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
