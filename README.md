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

### Pasos rápidos para subir el repo a GitHub desde tu PC
Si aún no tienes el código en GitHub, puedes clonarlo o copiarlo y subirlo así:

1. Crea un repositorio vacío en GitHub (sin README inicial), por ejemplo `rutas-dimerc`.
2. En tu computadora, clona este proyecto (o coloca tus archivos en una carpeta nueva):
   ```bash
   git clone <URL-del-repo> rutas-dimerc
   cd rutas-dimerc
   ```
   > Si ya tienes los archivos en una carpeta local, entra a ella y ejecuta `git init` para iniciar el repo.
3. Añade GitHub como remoto y sube todo:
   ```bash
   git remote add origin https://github.com/<tu-usuario>/rutas-dimerc.git
   git add .
   git commit -m "Sube app de rutas"
   git push -u origin main
   ```
4. Abre tu repositorio en GitHub y sigue los pasos de **GitHub Pages** (sección anterior) para publicarlo.
