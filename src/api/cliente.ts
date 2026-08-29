/**
 * El unico punto del front que sabe la URL de blog-api.
 *
 * Ningun componente construye una URL ni llama a `fetch` por su cuenta: si manana la API
 * cambia de puerto, de prefijo o de forma de envolver la respuesta, se toca este archivo
 * y nada mas. Eso es lo que hace que dos repositorios puedan evolucionar por separado.
 */

import type {
  AutorConPosts,
  ComentarioCreado,
  FiltrosDeListado,
  ListadoDePosts,
  NuevoComentario,
  PostDetalle,
  PostResumen,
  RespuestaBusqueda,
  RespuestaPregunta,
  TaxonomiaConRecuento,
} from './tipos'

export const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3402'

/** Puerto de blog-ai. No se llama desde aqui; se muestra en la interfaz para explicar de donde sale la IA. */
export const URL_IA_INFORMATIVA = 'http://localhost:8402'

/**
 * Error de red o de la API con el codigo HTTP a la vista.
 * `estado === 0` significa que ni siquiera hubo respuesta (blog-api caido).
 */
export class ErrorDeApi extends Error {
  constructor(
    public estado: number,
    mensaje: string
  ) {
    super(mensaje)
    this.name = 'ErrorDeApi'
  }

  /** blog-api responde 502 cuando quien esta caido es blog-ai, el repositorio de detras. */
  get esFalloDeIa(): boolean {
    return this.estado === 502 || this.estado === 503 || this.estado === 504
  }

  get esNoEncontrado(): boolean {
    return this.estado === 404
  }
}

/** Todas las respuestas de blog-api vienen envueltas en `datos`. */
type Sobre<T> = { datos: T }

async function pedir<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  let respuesta: Response

  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      ...opciones,
      headers: {
        Accept: 'application/json',
        ...(opciones?.body ? { 'Content-Type': 'application/json' } : {}),
        ...opciones?.headers,
      },
    })
  } catch {
    throw new ErrorDeApi(0, `No se ha podido contactar con blog-api en ${URL_API}.`)
  }

  if (!respuesta.ok) {
    throw new ErrorDeApi(respuesta.status, await mensajeDeError(respuesta))
  }

  return (await respuesta.json()) as T
}

/**
 * blog-api no usa una sola forma de error, y las tres de abajo estan comprobadas contra
 * el servicio real, no supuestas:
 *  - `{ error: "Post no encontrado" }`                        en los 404 de sus controladores;
 *  - `{ message, name: "ContratoIncumplido", status: 502 }`   cuando blog-ai rompe el contrato;
 *  - `{ errors: [{ message, field }] }`                       en los 422 del validador.
 */
async function mensajeDeError(respuesta: Response): Promise<string> {
  try {
    const cuerpo = (await respuesta.json()) as Record<string, unknown>

    if (cuerpo && typeof cuerpo === 'object') {
      for (const clave of ['error', 'mensaje', 'message'] as const) {
        if (typeof cuerpo[clave] === 'string') {
          return cuerpo[clave] as string
        }
      }

      if (Array.isArray(cuerpo.errors)) {
        const detalles = cuerpo.errors
          .map((fallo) => (fallo as { message?: string }).message)
          .filter((mensaje): mensaje is string => typeof mensaje === 'string')
        if (detalles.length > 0) {
          return detalles.join(' · ')
        }
      }
    }
  } catch {
    // Un cuerpo que no es JSON no aporta nada: nos quedamos con el mensaje generico.
  }

  return `blog-api ha respondido ${respuesta.status}.`
}

/** Desenvuelve `{ datos: ... }` para que los componentes trabajen con el dato pelado. */
async function pedirDatos<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  const sobre = await pedir<Sobre<T>>(ruta, opciones)
  return sobre.datos
}

function comoConsulta(filtros: FiltrosDeListado): string {
  const parametros = new URLSearchParams()
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      parametros.set(clave, String(valor))
    }
  }
  const cadena = parametros.toString()
  return cadena ? `?${cadena}` : ''
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

/** Listado paginado. Es el unico endpoint que devuelve `meta` ademas de `datos`. */
export function listarPosts(filtros: FiltrosDeListado = {}): Promise<ListadoDePosts> {
  return pedir<ListadoDePosts>(`/posts${comoConsulta(filtros)}`)
}

export function postsRecientes(limite = 5): Promise<PostResumen[]> {
  return pedirDatos<PostResumen[]>(`/posts/recientes?limite=${limite}`)
}

/** Lanza `ErrorDeApi` con estado 404 si el slug no existe o el post es un borrador. */
export function detalleDePost(slug: string): Promise<PostDetalle> {
  return pedirDatos<PostDetalle>(`/posts/${encodeURIComponent(slug)}`)
}

export function postsRelacionados(slug: string, limite = 2): Promise<PostResumen[]> {
  return pedirDatos<PostResumen[]>(`/posts/${encodeURIComponent(slug)}/relacionados?limite=${limite}`)
}

// ---------------------------------------------------------------------------
// Taxonomias y autores
// ---------------------------------------------------------------------------

export function listarCategorias(): Promise<TaxonomiaConRecuento[]> {
  return pedirDatos<TaxonomiaConRecuento[]>('/categorias')
}

export function listarEtiquetas(): Promise<TaxonomiaConRecuento[]> {
  return pedirDatos<TaxonomiaConRecuento[]>('/etiquetas')
}

export function fichaDeAutor(id: number): Promise<AutorConPosts> {
  return pedirDatos<AutorConPosts>(`/autores/${id}`)
}

// ---------------------------------------------------------------------------
// Comentarios
// ---------------------------------------------------------------------------

/** Devuelve el comentario en estado «pendiente»: la moderacion es manual (regla 2). */
export function crearComentario(slug: string, comentario: NuevoComentario): Promise<ComentarioCreado> {
  return pedirDatos<ComentarioCreado>(`/posts/${encodeURIComponent(slug)}/comentarios`, {
    method: 'POST',
    body: JSON.stringify(comentario),
  })
}

// ---------------------------------------------------------------------------
// Busqueda semantica — blog-api delega en blog-ai (otro repositorio)
// ---------------------------------------------------------------------------

/**
 * Las dos funciones de abajo son las unicas que pueden tardar segundos o devolver 502:
 * detras hay un modelo local. Quien las llame TIENE que pintar ese caso.
 */
export function buscar(consulta: string, limite = 5): Promise<RespuestaBusqueda> {
  return pedirDatos<RespuestaBusqueda>('/buscar', {
    method: 'POST',
    body: JSON.stringify({ consulta, limite }),
  })
}

export function preguntar(consulta: string): Promise<RespuestaPregunta> {
  return pedirDatos<RespuestaPregunta>('/preguntar', {
    method: 'POST',
    body: JSON.stringify({ consulta }),
  })
}
