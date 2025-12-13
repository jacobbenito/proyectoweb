const form = document.querySelector('#route-form');
const tableBody = document.querySelector('#routes-table tbody');
const filterInput = document.querySelector('#filter');
const rowTemplate = document.querySelector('#row-template');
const sheetsForm = document.querySelector('#sheets-form');
const sheetsStatus = document.querySelector('#sheets-status');
const clearSheetsBtn = document.querySelector('#clear-sheets');
const exportBtn = document.querySelector('#export-excel');
const importBtn = document.querySelector('#import-excel');
const importInput = document.querySelector('#import-input');
const submitBtn = document.querySelector('#submit-btn');
const cancelEditBtn = document.querySelector('#cancel-edit');
const sheetsPanel = document.querySelector('#sheets-panel');

const STORAGE_KEY = 'registro-rutas-dimerc';
const SHEETS_CONFIG_KEY = 'registro-rutas-dimerc-sheets';

const loadRoutes = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveRoutes = (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

const loadSheetsConfig = () => JSON.parse(localStorage.getItem(SHEETS_CONFIG_KEY) || '{}');
const saveSheetsConfig = (value) => localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(value));

let routes = loadRoutes();
let sheetsConfig = loadSheetsConfig();
let editingId = null;

function generateId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `route-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateSheetsStatus(message, type = 'muted') {
  if (!sheetsStatus) return;
  sheetsStatus.textContent = message;
  sheetsStatus.dataset.type = type;
}

function renderRows(list = routes) {
  tableBody.innerHTML = '';

  if (!list.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 11;
    cell.textContent = 'Sin registros aún';
    cell.className = 'empty';
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  list.forEach((route) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);

    row.querySelector('[data-field="ruta"]').textContent = route.ruta;
    row.querySelector('[data-field="nv"]').textContent = route.nv || '';
    row.querySelector('[data-field="jaula"]').textContent = route.jaula;
    row.querySelector('[data-field="transportista"]').textContent = route.transportista;
    row.querySelector('[data-field="guia"]').textContent = route.guia;
    row.querySelector('[data-field="factura"]').textContent = route.factura;
    row.querySelector('[data-field="dia"]').textContent = route.dia;

    const estadoCell = row.querySelector('[data-field="estado"]');
    estadoCell.textContent = route.estado;
    estadoCell.dataset.value = route.estado;

    row.querySelector('[data-field="placa"]').textContent = route.placa;

    const fotoCell = row.querySelector('[data-field="foto"]');
    if (route.fotoUrl || route.foto) {
      const img = document.createElement('img');
      img.src = route.fotoUrl || route.foto;
      img.alt = `Foto de ${route.ruta}`;
      img.className = 'thumb';
      fotoCell.appendChild(img);
    } else {
      fotoCell.textContent = '—';
      fotoCell.classList.add('muted');
    }

    row.querySelector('[data-action="edit"]').addEventListener('click', () => startEdit(route.id));

    row.querySelector('[data-action="delete"]').addEventListener('click', () => {
      const idx = routes.findIndex((item) => item.id === route.id);
      if (idx === -1) return;
      routes.splice(idx, 1);
      saveRoutes(routes);
      renderRows(applyFilter());
      syncWithSheets({ ...route, action: 'delete' });
      resetForm();
    });

    tableBody.appendChild(row);
  });
}

function applyFilter() {
  const term = filterInput.value.toLowerCase().trim();
  if (!term) return routes;
  return routes.filter((route) =>
    [route.ruta, route.transportista, route.estado, route.nv, route.placa]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term))
  );
}

function resetForm() {
  form.reset();
  editingId = null;
  submitBtn.textContent = 'Agregar ruta';
  cancelEditBtn.hidden = true;
}

function startEdit(id) {
  const route = routes.find((item) => item.id === id);
  if (!route) return;
  editingId = id;
  form.elements['ruta'].value = route.ruta || '';
  form.elements['nv'].value = route.nv || '';
  form.elements['jaula'].value = route.jaula || '';
  form.elements['transportista'].value = route.transportista || '';
  form.elements['guia'].value = route.guia || '';
  form.elements['factura'].value = route.factura || '';
  form.elements['dia'].value = route.dia || '';
  form.elements['estado'].value = route.estado || 'Pendiente';
  form.elements['placa'].value = route.placa || '';
  submitBtn.textContent = 'Actualizar ruta';
  cancelEditBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function syncWithSheets(payload) {
  const { endpoint, token } = sheetsConfig;
  if (!endpoint) return;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, token }),
    });

    if (!response.ok) throw new Error(await response.text());
    updateSheetsStatus('Sincronizado con Google Sheets.', 'success');
  } catch (error) {
    updateSheetsStatus(`No se pudo sincronizar: ${error.message}`, 'warning');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const photoFile = form.elements['foto'].files[0] || null;
  const routeData = Object.fromEntries(formData.entries());

  if (editingId) {
    const index = routes.findIndex((item) => item.id === editingId);
    if (index === -1) return;
    const existingPhoto = routes[index].foto || routes[index].fotoUrl || null;
    routes[index] = {
      ...routes[index],
      ...routeData,
      id: editingId,
      foto: photoFile ? await readFileAsDataUrl(photoFile) : existingPhoto,
    };
    saveRoutes(routes);
    renderRows(applyFilter());
    syncWithSheets({ ...routes[index], action: 'update' });
    resetForm();
  } else {
    const newRoute = { ...routeData, id: generateId() };
    newRoute.foto = photoFile ? await readFileAsDataUrl(photoFile) : null;
    routes.unshift(newRoute);
    saveRoutes(routes);
    form.reset();
    renderRows(applyFilter());
    syncWithSheets({ ...newRoute, action: 'insert' });
  }
});

filterInput.addEventListener('input', () => renderRows(applyFilter()));

if (sheetsForm) {
  sheetsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(sheetsForm).entries());
    sheetsConfig = data;
    saveSheetsConfig(data);
    if (data.endpoint) {
      updateSheetsStatus('Conexión guardada. Se sincronizará al guardar cambios.', 'success');
    } else {
      updateSheetsStatus('Guardando solo en tu navegador.', 'muted');
    }
  });
}

if (clearSheetsBtn) {
  clearSheetsBtn.addEventListener('click', () => {
    sheetsConfig = {};
    saveSheetsConfig({});
    sheetsForm.reset();
    updateSheetsStatus('Guardando solo en tu navegador.', 'muted');
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener('click', resetForm);
}

function exportToExcel() {
  const data = routes.map(({ foto, ...rest }) => rest);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rutas');
  XLSX.writeFile(workbook, 'rutas-dimerc.xlsx');
}

if (exportBtn) {
  exportBtn.addEventListener('click', exportToExcel);
}

function normalizeRow(row) {
  const map = (key) => row[key] ?? row[key?.toLowerCase()] ?? '';
  return {
    ruta: map('Ruta') || map('ruta'),
    nv: map('NV') || map('nv'),
    jaula: map('Jaula') || map('jaula'),
    transportista: map('Transportista') || map('transportista'),
    guia: map('Guía') || map('Guia') || map('guia'),
    factura: map('Factura') || map('factura'),
    dia: map('Día') || map('Dia') || map('dia'),
    estado: map('Estado') || map('estado') || 'Pendiente',
    placa: map('Placa') || map('placa'),
  };
}

async function importFromFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const newRecords = rows
    .map(normalizeRow)
    .filter((row) => row.ruta && row.guia && row.factura);

  if (!newRecords.length) return;

  const withIds = newRecords.map((item) => ({ ...item, id: generateId(), foto: null }));
  routes = [...withIds, ...routes];
  saveRoutes(routes);
  renderRows(applyFilter());
  withIds.forEach((record) => syncWithSheets({ ...record, action: 'insert' }));
}

if (importBtn && importInput) {
  importBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    await importFromFile(file);
    importInput.value = '';
  });
}

updateSheetsStatus(sheetsConfig.endpoint ? 'Conexión guardada. Se sincronizará al guardar cambios.' : 'Guardando solo en tu navegador.', 'muted');
if (sheetsConfig.endpoint && sheetsPanel) {
  sheetsPanel.open = true;
}
renderRows();
