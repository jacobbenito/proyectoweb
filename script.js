const form = document.querySelector('#route-form');
const tableBody = document.querySelector('#routes-table tbody');
const filterInput = document.querySelector('#filter');
const rowTemplate = document.querySelector('#row-template');
const STORAGE_KEY = 'registro-rutas-dimerc';

const loadRoutes = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveRoutes = (routes) => localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));

let routes = loadRoutes();

function renderRows(list = routes) {
  tableBody.innerHTML = '';

  if (!list.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 9;
    cell.textContent = 'Sin registros aún';
    cell.className = 'empty';
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  list.forEach((route, index) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);

    row.querySelector('[data-field="ruta"]').textContent = route.ruta;
    row.querySelector('[data-field="jaula"]').textContent = route.jaula;
    row.querySelector('[data-field="transportista"]').textContent = route.transportista;
    row.querySelector('[data-field="guia"]').textContent = route.guia;
    row.querySelector('[data-field="factura"]').textContent = route.factura;
    row.querySelector('[data-field="dia"]').textContent = route.dia;

    const estadoCell = row.querySelector('[data-field="estado"]');
    estadoCell.textContent = route.estado;
    estadoCell.dataset.value = route.estado;

    row.querySelector('[data-field="placa"]').textContent = route.placa;

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
    [route.ruta, route.transportista, route.estado]
      .some((value) => value.toLowerCase().includes(term))
  );
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const newRoute = Object.fromEntries(formData.entries());
  routes.unshift(newRoute);
  saveRoutes(routes);
  form.reset();
  renderRows(applyFilter());
});

filterInput.addEventListener('input', () => renderRows(applyFilter()));

renderRows();
