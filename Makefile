# Atajos de arranque de blog-web. Los tres repositorios del modulo traen los mismos:
#
#   make check  - comprueba que la maquina esta lista (no toca nada)
#   make setup  - instala las dependencias y crea el .env (solo la primera vez)
#   make up     - arranca el servicio
#
# Si algo falla, el mensaje dice que falta. No hace falta leer este archivo.

SHELL := /bin/bash
CARPETA := blog-web
REPO := blog-web-ai4devs

.PHONY: ayuda check setup up build

ayuda:
	@echo "make check  comprueba que la maquina esta lista"
	@echo "make setup  instala dependencias y crea el .env"
	@echo "make up     arranca la interfaz en http://localhost:5402"
	@echo "make build  compila para produccion"

check:
	@if [ "$$(basename $$PWD)" != "$(CARPETA)" ]; then \
	  echo "ERROR: esta carpeta se llama '$$(basename $$PWD)' y tiene que llamarse '$(CARPETA)'."; \
	  echo "       Los tres repositorios viven como carpetas hermanas con el nombre corto,"; \
	  echo "       y todo lo demas (las rutas relativas entre ellos) lo da por hecho."; \
	  echo "       Vuelve a clonar poniendo la carpeta destino al final:"; \
	  echo "         git clone git@github.com:<tu-usuario>/$(REPO).git $(CARPETA)"; \
	  exit 1; \
	fi
	@command -v node >/dev/null 2>&1 || { \
	  echo "ERROR: no encuentro 'node'."; \
	  echo "       Instala Node.js 20 o superior (version LTS) desde nodejs.org/en/download."; \
	  exit 1; }
	@node -e 'var v=+process.versions.node.split(".")[0]; if(v<20){console.error("ERROR: tienes Node "+process.versions.node+" y hace falta 20 o superior.");process.exit(1)}'
	@echo "OK  blog-web: carpeta correcta y Node $$(node -v)."

setup: check
	npm ci
	@if [ ! -f .env ]; then cp .env.example .env; echo "OK  .env creado a partir de .env.example."; fi
	@echo ""
	@echo "OK  blog-web listo. Arrancalo con 'make up' (http://localhost:5402)."

up:
	npm run dev

build:
	npm run build
