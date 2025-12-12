# Registro de rutas Dimerc

Aplicación web ligera para registrar, editar y consultar rutas con los campos: **Ruta, NV, Jaula, Transportista, Guía, Factura, Día, Estado, Placa y Foto**.

## Uso
1. Abre `index.html` en tu navegador.
2. Completa el formulario de "Nueva ruta" (incluye NV y carga opcional de foto) y presiona **Agregar ruta**.
3. Usa el filtro para buscar por ruta, transportista, estado, NV o placa.
4. Haz clic en **Editar** para modificar un registro y en **Cancelar edición** para descartar cambios.
5. Exporta todo a Excel con el botón **Exportar a Excel**; las fotos no se incluyen en el archivo (para que pese menos).
6. Los datos se guardan en tu navegador (localStorage); puedes eliminar filas con el botón **Eliminar**.

### Sincronizar con Google Sheets (opcional)
Si quieres que la app escriba en una hoja de cálculo además de guardarse en el navegador:

1. Crea un nuevo proyecto en [Google Apps Script](https://script.google.com/) y pega este código:
   ```javascript
   const SHEET_NAME = 'rutas';
   const TOKEN = 'secreto-opcional';

   function doPost(e) {
     const body = JSON.parse(e.postData.contents);
     if (TOKEN && body.token !== TOKEN) return ContentService.createTextOutput('Token inválido').setMimeType(ContentService.MimeType.TEXT);

     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
     if (sheet.getLastRow() === 0) {
       sheet.appendRow(['id', 'ruta', 'nv', 'jaula', 'transportista', 'guia', 'factura', 'dia', 'estado', 'placa']);
     }

     const row = [body.id, body.ruta, body.nv, body.jaula, body.transportista, body.guia, body.factura, body.dia, body.estado, body.placa];
     sheet.appendRow(row);
     return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
   }
   ```
2. En **Deploy → New deployment**, elige **Web app**, establece *Who has access* en **Anyone**, y copia la URL.
3. En la app, pega esa URL en "URL del Web App" y, si usaste token, escríbelo también. A partir de ahí cada alta, edición o eliminación intentará sincronizarse con la hoja.
4. Si quieres limpiar la conexión y usar solo almacenamiento local, presiona **Usar solo local**.

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
