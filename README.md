# blog-web

Front del blog **«Corriente»**: React + Vite + TypeScript. No tiene base de datos ni lógica de
negocio: todo lo que pinta se lo pide por HTTP a **blog-api**.

Puerto **5402**.

> 📌 **El ejercicio del Módulo 7 y cómo se entrega están en el `README.md` de `blog-api`**, no
> aquí. Este repositorio no hace falta para hacerlo: sirve para ver el sistema entero
> funcionando. La entrega es una sola y va por allí.

## Dónde encaja

```
blog-web  :5402  ──HTTP──▶  blog-api  :3402  ──HTTP──▶  blog-ai  :8402
 (este repo)                 (AdonisJS)                  (búsqueda semántica)
```

Los tres repositorios viven como **carpetas hermanas** llamadas exactamente `blog-api`,
`blog-web` y `blog-ai` dentro de una carpeta común. El repositorio se llama `blog-web-ai4devs`
y la carpeta no, así que **el `git clone` lleva siempre la carpeta destino escrita al final**:

```bash
git clone git@github.com:<tu-usuario>/blog-web-ai4devs.git blog-web
```

> 🚨 **En el formulario del fork, DESMARCA la casilla que dice copiar solo la rama por
> defecto.** Viene marcada, y si la dejas así tu fork se lleva únicamente `main`. La rama de
> partida se trae del repositorio del curso, que es inmune a eso:
>
> ```bash
> cd blog-web
> git remote add upstream git@github.com:LIDR-academy/blog-web-ai4devs.git
> git fetch upstream
> git checkout -b s7/start upstream/s7/start
> ```

## Cómo se levanta

```bash
make setup    # solo la primera vez: instala las dependencias y crea el .env
make up       # arranca la interfaz en http://localhost:5402
```

Antes de tocar nada, `make setup` comprueba que la carpeta se llama `blog-web` y que tu Node
es 20 o superior. Los tres repositorios traen los mismos atajos: `make check`, `make setup` y
`make up`, más `make ayuda` para ver la lista.

<details>
<summary>Qué hace <code>make setup</code> por dentro, si prefieres ir a mano</summary>

```bash
npm ci                   # instala exactamente lo que fija package-lock.json, sin reescribirlo
cp .env.example .env     # ajusta VITE_API_URL si blog-api no está en el puerto por defecto
```
</details>

Necesita **blog-api levantado** para tener algo que pintar. Y para que la búsqueda devuelva
resultados hace falta además `blog-ai` levantado y el índice lleno: el orden de arranque
completo está en el `README.md` de `blog-api`.

El puerto **5402** es fijo (`strictPort: true` en `vite.config.ts`): si está ocupado, Vite falla
en vez de saltar a otro. En un sistema de tres servicios eso es una feature, porque un puerto
que cambia solo es un fallo que aparece media hora más tarde y en otro sitio.

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Comprueba tipos (`tsc -b`) y compila a `dist/` |
| `npm run preview` | Sirve el build de producción en 5402 |

## De qué depende (y de qué NO)

- **blog-api en `http://localhost:3402` es su ÚNICA dependencia directa.** Sin él, blog-web
  arranca y se ve, pero cada sección muestra un error de conexión: no hay datos de reserva. La
  URL se configura con `VITE_API_URL` y se lee en un solo sitio, `src/api/cliente.ts`.
- **blog-ai en `http://localhost:8402` NO se llama desde aquí.** La búsqueda semántica
  (`/buscar`) y la respuesta generada (`/preguntar`) son endpoints **de blog-api**, que es quien
  delega en blog-ai. Si blog-ai está caído, blog-api responde `502` y la página de búsqueda lo
  explica con esas palabras; el resto del blog sigue funcionando.

Que blog-web no conozca la dirección de blog-ai no es un descuido: es el límite del sistema. Si
mañana blog-ai se sustituye por otro proveedor, este repositorio no se toca.

## Cómo está organizado

```
src/
├── api/
│   ├── cliente.ts       ← el ÚNICO sitio con la URL de blog-api y con fetch
│   └── tipos.ts         ← copia del contrato de blog-api, en snake_case a propósito
├── ganchos/
│   └── usePeticion.ts   ← cargando / error / dato, para no reinventarlo en cada página
├── componentes/         ← BarraLateral, TarjetaPost, Comentarios, CuerpoMarkdown…
├── paginas/             ← Portada, DetallePost, Busqueda, FichaAutor
└── estilos.css          ← CSS plano, sin framework
```

Dos reglas que sostienen todo lo demás:

1. **Ningún componente llama a `fetch` ni construye una URL.** Todo pasa por
   `src/api/cliente.ts`. Un cambio de puerto, de prefijo o del sobre `{ datos: … }` se arregla
   en un archivo.
2. **Los tipos usan los nombres exactos del JSON** (`imagen_portada`, `publicado_en`,
   `comentarios_lista`). Traducirlos a camelCase escondería una ruptura del contrato en vez de
   delatarla al compilar.

## Rutas

| Ruta | Qué pinta | Endpoints que consume |
|---|---|---|
| `/` | Portada paginada + barra lateral | `GET /posts`, `/posts/recientes`, `/categorias`, `/etiquetas` |
| `/?categoria=…`, `/?etiqueta=…`, `/?autor=…`, `/?q=…` | La misma portada, filtrada | `GET /posts` con parámetros |
| `/post/:slug` | Artículo, autor, relacionados y comentarios | `GET /posts/:slug`, `/posts/:slug/relacionados`, `POST /posts/:slug/comentarios` |
| `/autor/:id` | Ficha del autor y sus artículos | `GET /autores/:id` |
| `/buscar?q=…` | Búsqueda semántica + respuesta generada | `POST /buscar`, `POST /preguntar` |

## Detalles del contrato que se ven en la interfaz

- Todas las respuestas llegan envueltas en `{ "datos": … }`; solo el listado añade `meta`.
- **Ningún comentario trae correo electrónico.** El formulario lo envía (`autor_email`), pero la
  API no lo devuelve nunca, y por eso el tipo `Comentario` no tiene ese campo.
- Un comentario recién creado siempre nace `pendiente`: la interfaz avisa de que queda a la
  espera de aprobación y **no** lo añade al hilo, porque todavía no lo ve nadie más.
- Un borrador responde `404`, igual que un slug inexistente.
