const form = document.querySelector('#route-form');
const tableBody = document.querySelector('#routes-table tbody');
const filterInput = document.querySelector('#filter');
const rowTemplate = document.querySelector('#row-template');
const supabaseForm = document.querySelector('#supabase-form');
const supabaseStatus = document.querySelector('#supabase-status');
const clearSupabaseBtn = document.querySelector('#clear-supabase');

const STORAGE_KEY = 'registro-rutas-dimerc';
const SUPABASE_CONFIG_KEY = 'registro-rutas-dimerc-supabase';

const loadRoutes = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveRoutes = (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

const loadSupabaseConfig = () => JSON.parse(localStorage.getItem(SUPABASE_CONFIG_KEY) || '{}');
const saveSupabaseConfig = (value) => localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(value));

let routes = loadRoutes();
let supabaseClient = null;
let supabaseConfig = loadSupabaseConfig();

function generateId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `route-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateSupabaseStatus(message, type = 'muted') {
  if (!supabaseStatus) return;
  supabaseStatus.textContent = message;
  supabaseStatus.dataset.type = type;
}

function initSupabase() {
  const { url, key } = supabaseConfig;
  if (url && key && window.supabase) {
    supabaseClient = window.supabase.createClient(url, key);
    updateSupabaseStatus('Conexión lista: se intentará sincronizar en Supabase.', 'success');
  } else {
    supabaseClient = null;
    updateSupabaseStatus('Guardando solo en tu navegador. Configura Supabase para sincronizar.', 'muted');
  }
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

  list.forEach((route, index) => {
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

    row.querySelector('[data-action="delete"]').addEventListener('click', () => {
      routes.splice(index, 1);
      saveRoutes(routes);
      renderRows(applyFilter());
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

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function syncSupabase(route, photoFile) {
  if (!supabaseClient) return;
  const table = supabaseConfig.table || 'rutas';
  const bucket = supabaseConfig.bucket || 'rutas-fotos';
  let fotoUrl = null;

  if (photoFile) {
    const path = `${route.id || Date.now()}-${photoFile.name}`;
    const upload = await supabaseClient.storage.from(bucket).upload(path, photoFile, { upsert: true });
    if (!upload.error) {
      const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
      fotoUrl = data.publicUrl;
    }
  }

  const { error, data } = await supabaseClient
    .from(table)
    .insert({ ...route, foto_url: fotoUrl });

  if (error) {
    updateSupabaseStatus(`No se pudo sincronizar en Supabase: ${error.message}`, 'warning');
    return;
  }

  if (fotoUrl) {
    const storedRoute = routes.find((item) => item.id === route.id);
    if (storedRoute) {
      storedRoute.fotoUrl = fotoUrl;
      saveRoutes(routes);
      renderRows(applyFilter());
    }
  }

  if (data) {
    updateSupabaseStatus('Último registro enviado a Supabase.', 'success');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const photoFile = form.elements['foto'].files[0] || null;
  const newRoute = Object.fromEntries(formData.entries());
  newRoute.id = generateId();
  newRoute.foto = photoFile ? await readFileAsDataUrl(photoFile) : null;
  routes.unshift(newRoute);
  saveRoutes(routes);
  form.reset();
  renderRows(applyFilter());
  syncSupabase(newRoute, photoFile);
});

filterInput.addEventListener('input', () => renderRows(applyFilter()));

if (supabaseForm) {
  supabaseForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(supabaseForm).entries());
    supabaseConfig = data;
    saveSupabaseConfig(data);
    initSupabase();
  });
}

if (clearSupabaseBtn) {
  clearSupabaseBtn.addEventListener('click', () => {
    supabaseConfig = {};
    saveSupabaseConfig({});
    initSupabase();
    supabaseForm.reset();
  });
}

initSupabase();
renderRows();
