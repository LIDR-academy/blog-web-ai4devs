import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El puerto es fijo a proposito: en un sistema polirepo cada servicio tiene el suyo
// (blog-web 5402, blog-api 3402, blog-ai 8402) y `strictPort` hace que Vite falle
// en vez de saltar a otro puerto libre, que es como se pierde la trazabilidad.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5402,
    strictPort: true,
  },
})
