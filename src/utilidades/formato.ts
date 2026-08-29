/** Formateo compartido: fechas legibles y puntuaciones de la busqueda semantica. */

const FORMATEADOR = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** `publicado_en` puede venir a null (post sin fecha), asi que se contempla. */
export function fechaLegible(iso: string | null): string {
  if (!iso) {
    return 'Sin fecha'
  }
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) {
    return 'Sin fecha'
  }
  return FORMATEADOR.format(fecha)
}

export function fechaCorta(iso: string | null): string {
  if (!iso) {
    return ''
  }
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(fecha)
}

/**
 * La API devuelve 0..1 y la interfaz la ensena con dos decimales.
 *
 * La guarda no es paranoia: durante la integracion se vio a blog-ai mandar este campo con
 * OTRO nombre (`score`), y sin la comprobacion la pantalla habria pintado «NaN» sin que
 * nadie supiera de donde salia. Un guion visible es un sintoma; un NaN es un misterio.
 */
export function puntuacionLegible(puntuacion: number): string {
  return Number.isFinite(puntuacion) ? puntuacion.toFixed(2) : '—'
}

/** «3 comentarios» / «1 comentario» / «Sin comentarios». */
export function recuentoDeComentarios(total: number): string {
  if (total === 0) {
    return 'Sin comentarios'
  }
  return total === 1 ? '1 comentario' : `${total} comentarios`
}
