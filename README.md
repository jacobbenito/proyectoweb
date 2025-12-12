# Registro de rutas Dimerc

Aplicación web ligera para registrar y consultar rutas con los campos: **Ruta, NV, Jaula, Transportista, Guía, Factura, Día, Estado, Placa y Foto**.

## Uso
1. Abre `index.html` en tu navegador.
2. Completa el formulario de "Nueva ruta" (incluye NV y carga opcional de foto) y presiona **Agregar ruta**.
3. Usa el filtro para buscar por ruta, transportista, estado, NV o placa.
4. Los datos se guardan en tu navegador (localStorage); puedes eliminar filas con el botón **Eliminar**.

### Sincronizar con Supabase (opcional)
Si quieres persistir los datos en tu proyecto Supabase y alojarlo luego en otro host:

1. En la tarjeta "Conexión opcional a Supabase", escribe tu **Supabase URL** y la **anon/public key**.
2. Define el nombre de la tabla y del bucket de almacenamiento (por defecto `rutas` y `rutas-fotos`).
3. Crea la tabla con columnas que coincidan con los campos (ejemplo: `id`, `ruta`, `nv`, `jaula`, `transportista`, `guia`, `factura`, `dia`, `estado`, `placa`, `foto_url`).
4. Crea el bucket de almacenamiento y márcalo como **public** para que las imágenes sean accesibles; la app subirá la foto a ese bucket y guardará la URL pública en `foto_url`.
5. Guarda la configuración; a partir de ese momento cada alta intentará insertarse en Supabase sin dejar de almacenar en localStorage.

## Publicar gratis en GitHub Pages
Puedes servir la aplicación como sitio estático con GitHub Pages:
1. Sube este repositorio a GitHub (por ejemplo, con el nombre `rutas-dimerc`).
2. En GitHub, ve a **Settings → Pages**.
3. En **Build and deployment**, elige **Source: Deploy from a branch**.
4. Selecciona la rama (por ejemplo `main`) y la carpeta `/` (root), luego presiona **Save**.
5. En unos minutos tendrás una URL del tipo `https://tu_usuario.github.io/rutas-dimerc/`.
6. Si quieres usar otra rama para publicar (ej. `gh-pages`), crea esa rama con estos archivos y repite los pasos 2‑5.

Si la app queda en una subcarpeta, asegúrate de acceder con la URL completa (`https://tu_usuario.github.io/rutas-dimerc/index.html`).
