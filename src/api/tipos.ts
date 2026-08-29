/**
 * Tipos del contrato de blog-api.
 *
 * Esto es una COPIA del contrato de otro repositorio, no una importacion: en un sistema
 * polirepo blog-web no puede alcanzar el codigo de blog-api. Por eso los nombres de campo
 * se escriben en snake_case, tal y como viajan por HTTP, sin traducirlos a camelCase:
 * cualquier renombrado aqui esconderia una ruptura del contrato en vez de delatarla.
 *
 * Regla 6 del dominio: ni el autor ni quien comenta exponen su correo. Aunque el
 * formulario de alta SI manda `autor_email`, ninguna respuesta lo devuelve, y por eso
 * `Comentario` no tiene campo de correo. Si alguna vez lo necesitas, el fallo esta en
 * la peticion, no en este tipo.
 */

export type Taxonomia = {
  id: number
  nombre: string
  slug: string
}

export type TaxonomiaConRecuento = Taxonomia & {
  posts: number
}

export type Redes = {
  youtube?: string
  facebook?: string
  instagram?: string
  x?: string
  linkedin?: string
}

export type AutorResumen = {
  id: number
  nombre: string
  rol: string
  avatar: string
}

export type AutorPublico = AutorResumen & {
  bio: string
  redes: Redes
}

export type PostResumen = {
  id: number
  titulo: string
  slug: string
  resumen: string
  imagen_portada: string
  publicado_en: string | null
  autor: AutorResumen
  categoria: Taxonomia
  etiquetas: Taxonomia[]
  /** Recuento de comentarios APROBADOS, no la lista. */
  comentarios: number
}

/** Comentario ya aprobado. Sin correo: ver la nota de cabecera. */
export type Comentario = {
  id: number
  autor_nombre: string
  cuerpo: string
  creado_en: string | null
  respuestas: Comentario[]
}

export type Vecino = { titulo: string; slug: string } | null

export type PostDetalle = Omit<PostResumen, 'autor'> & {
  /** Markdown, se pinta con react-markdown. */
  cuerpo: string
  autor: AutorPublico
  comentarios_lista: Comentario[]
  anterior: Vecino
  siguiente: Vecino
}

export type MetaPaginacion = {
  pagina: number
  por_pagina: number
  total: number
  paginas: number
}

export type ListadoDePosts = {
  datos: PostResumen[]
  meta: MetaPaginacion
}

export type AutorConPosts = AutorPublico & {
  posts: PostResumen[]
}

export type ComentarioCreado = {
  id: number
  estado: 'pendiente'
  mensaje: string
}

/** Un resultado semantico: `post` puede venir a null si el indice va por delante del blog. */
export type ResultadoSemantico = {
  post_id: number
  slug: string
  titulo: string
  resumen: string
  /** 0..1 */
  puntuacion: number
  /** Trozo del texto que hizo saltar el resultado. Lo devuelve blog-ai. */
  fragmento?: string
  post: PostResumen | null
}

export type RespuestaBusqueda = {
  consulta: string
  resultados: ResultadoSemantico[]
}

export type FuenteCitada = {
  post_id: number
  slug: string
  titulo: string
  puntuacion: number
}

export type RespuestaPregunta = {
  consulta: string
  respuesta: string
  fuentes: FuenteCitada[]
  /** Modelo de generacion que ha redactado la respuesta. Lo informa blog-ai. */
  modelo?: string
}

export type FiltrosDeListado = {
  pagina?: number
  por_pagina?: number
  categoria?: string
  etiqueta?: string
  autor?: number
  q?: string
}

export type NuevoComentario = {
  autor_nombre: string
  autor_email: string
  cuerpo: string
  padre_id?: number
}
