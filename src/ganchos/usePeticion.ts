import { useCallback, useEffect, useRef, useState } from 'react'
import { ErrorDeApi } from '../api/cliente'

export type EstadoPeticion<T> = {
  datos: T | null
  cargando: boolean
  error: ErrorDeApi | null
  recargar: () => void
}

/**
 * Envuelve una llamada a blog-api en los tres estados que la interfaz tiene que pintar
 * siempre: cargando, error y dato. Sin esto, cada pagina reinventa el mismo `useEffect`
 * y alguna se deja el caso de error, que es justo el que el usuario acaba viendo.
 *
 * `dependencias` funciona como en `useEffect`: cambia una, se repite la peticion.
 */
export function usePeticion<T>(peticion: () => Promise<T>, dependencias: unknown[]): EstadoPeticion<T> {
  const [datos, setDatos] = useState<T | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<ErrorDeApi | null>(null)
  const [contador, setContador] = useState(0)

  // Guardamos la peticion en una ref para no obligar a quien llama a memoizarla.
  const referenciaPeticion = useRef(peticion)
  referenciaPeticion.current = peticion

  useEffect(() => {
    let vigente = true
    setCargando(true)
    setError(null)

    referenciaPeticion
      .current()
      .then((resultado) => {
        // Si el componente se desmonto o las dependencias cambiaron, esta respuesta ya
        // no interesa: pintarla provocaria el clasico parpadeo de datos viejos.
        if (vigente) {
          setDatos(resultado)
        }
      })
      .catch((fallo: unknown) => {
        if (!vigente) {
          return
        }
        setDatos(null)
        setError(
          fallo instanceof ErrorDeApi ? fallo : new ErrorDeApi(0, 'Error inesperado al hablar con blog-api.')
        )
      })
      .finally(() => {
        if (vigente) {
          setCargando(false)
        }
      })

    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, contador])

  const recargar = useCallback(() => setContador((valor) => valor + 1), [])

  return { datos, cargando, error, recargar }
}
