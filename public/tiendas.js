// public/tiendas.js - Lógica de página de tiendas con búsqueda y filtro

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let allStores = [];
let currentStore = null;
let filteredStores = [];

// Mostrar notificación toast
function showNotification(msg) {
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast bg-primary text-white px-4 py-3 rounded-lg shadow-2xl';
  toast.innerText = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('opacity-100'));
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

// Cargar tiendas desde API
async function loadStores() {
  try {
    const res = await fetch('/api/locales');
    allStores = await res.json();
    filteredStores = [...allStores];
    renderStores();
  } catch (err) {
    console.error('Error cargando tiendas:', err);
    showNotification('Error al cargar las tiendas');
  }
}

// Renderizar grid de tiendas
function renderStores() {
  const grid = $('#storesGrid');
  const noResults = $('#noResults');

  if (filteredStores.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');
  // Limit to 12 realistic results
  const toShow = filteredStores.slice(0, 12);
  grid.innerHTML = toShow.map(store => {
    const rating = (store.rating || 4.5).toFixed(1);
    // determine open now by matching hour in horarios_disponibles
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const openNow = ((store.horarios_disponibles || store.slots) || []).some(t => t.startsWith(hh));
    return `
    <div class="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer" onclick="openStoreModal(${store.id})">
      <img src="${store.imagen_portada}" alt="${store.nombre}" class="w-full h-44 object-cover" />
      <div class="p-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-lg text-primary">${store.nombre}</h3>
          <div class="text-sm text-slate-500">${store.categorias ? store.categorias.join(', ') : (store.category || '')}</div>
        </div>
        <p class="text-sm text-slate-600 mt-1">${store.ciudad} • ${store.descripcion}</p>
        <div class="mt-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-yellow-400 text-sm">${'★'.repeat(Math.round(rating))}</div>
            <div class="text-slate-500 text-sm">${rating}</div>
          </div>
          <div>
            ${openNow ? '<span class="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Abierta ahora</span>' : '<span class="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs">Cerrada</span>'}
          </div>
        </div>
      </div>
    </div>
  `}).join('');
}

// Abrir modal de tienda
function openStoreModal(storeId) {
  const store = allStores.find(s => s.id === storeId);
  if (!store) return;

  currentStore = store;
  document.body.classList.add('overflow-hidden');

  $('#modalTitle').innerText = store.nombre;
  $('#modalDescription').innerText = store.descripcion;
  $('#modalHorario').innerText = `Horario: ${store.horario}`;
  $('#modalTelefono').innerText = `Teléfono: ${store.telefono}`;
  $('#modalStatus').innerText = `Estado: ${store.estado}`;
  $('#modalBanner').style.backgroundImage = `url('${store.imagen_portada}')`;

  // Franjas horarias (soporta 'horarios_disponibles' o 'slots')
  const timeSelect = $('#timeSlotSelect');
  timeSelect.innerHTML = '<option value="">-- Elige una hora --</option>';
  const slots = store.horarios_disponibles || store.slots || [];
  slots.forEach(time => {
    const opt = document.createElement('option');
    opt.value = time;
    opt.innerText = time;
    timeSelect.appendChild(opt);
  });

  // Catálogo
  const catalog = $('#catalog');
  catalog.innerHTML = '';
  (store.productos || []).forEach(prod => {
    const p = document.createElement('div');
    p.className = 'bg-white rounded-lg border p-3 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-shadow';
    p.innerHTML = `
      <img src="${prod.image_url || prod.imagen || prod.image}" alt="${prod.nombre}" class="w-full h-20 object-cover rounded mb-2" />
      <div class="text-sm font-semibold">${prod.nombre}</div>
      <div class="text-sm text-slate-600">€${prod.precio.toFixed(2)}</div>
      <div class="text-xs text-slate-500 mt-1">Stock: ${prod.stock}</div>
    `;
    p.addEventListener('click', () => {
      p.classList.add('animate-bounce');
      setTimeout(() => p.classList.remove('animate-bounce'), 600);
      showNotification('Producto añadido correctamente');
    });
    catalog.appendChild(p);
  });

  $('#modal').classList.remove('hidden');
  $('#modal').classList.add('flex');
}

// Cerrar modal
function closeModal() {
  $('#modal').classList.add('hidden');
  $('#modal').classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
}

// Filtrar tiendas: búsqueda + ciudad
function filterStores() {
  const searchTerm = $('#searchInput').value.toLowerCase();
  const selectedCity = $('#cityFilter').value;
  const selectedCategory = $('#categoryFilter') ? $('#categoryFilter').value : '';

  filteredStores = allStores.filter(store => {
    const matchesSearch = store.nombre.toLowerCase().includes(searchTerm) || 
                          store.descripcion.toLowerCase().includes(searchTerm);
    const matchesCity = !selectedCity || store.ciudad === selectedCity;
    const storeCats = store.categorias || (store.category ? [store.category] : []);
    const matchesCategory = !selectedCategory || storeCats.includes(selectedCategory);
    return matchesSearch && matchesCity && matchesCategory;
  });

  renderStores();
}

// Confirmar reserva
function confirmReserve() {
  const user = localStorage.getItem('yt_user');
  if (!user) {
    showAuthModal();
    return;
  }

  const slot = $('#timeSlotSelect').value;
  if (!slot) {
    showNotification('Selecciona una franja horaria');
    return;
  }

  // POST /api/reservas
  fetch('/api/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      localId: currentStore.id,
      user,
      slot
    })
  })
  .then(r => r.json())
  .then(() => {
    showNotification('Reserva confirmada correctamente');
    closeModal();
  })
  .catch(err => showNotification('Error al confirmar la reserva'));
}

// Auth modal
function showAuthModal() {
  document.body.classList.add('overflow-hidden');
  const modal = $('#modalAuth');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modal.classList.add('fullscreen');
}

function closeAuthModal() {
  document.body.classList.remove('overflow-hidden');
  const modal = $('#modalAuth');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.classList.remove('fullscreen');
}

function updateUserUI() {
  const user = localStorage.getItem('yt_user');
  if (user) {
    $('#userStatus').innerText = `Conectado: ${user}`;
  } else {
    $('#userStatus').innerText = 'No has iniciado sesión';
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadStores();

  // Búsqueda y filtro
  $('#searchInput').addEventListener('input', filterStores);
  $('#cityFilter').addEventListener('change', filterStores);
  $('#categoryFilter') && $('#categoryFilter').addEventListener('change', filterStores);

  // Modal stores
  $('#closeModal').addEventListener('click', closeModal);
  $('#confirmReserve').addEventListener('click', confirmReserve);

  // Auth
  $('#btnLogin').addEventListener('click', () => {
    const user = localStorage.getItem('yt_user');
    if (user) {
      localStorage.removeItem('yt_user');
      location.reload();
    } else {
      showAuthModal();
    }
  });

  // Auth tabs
  $('#tabLogin').addEventListener('click', () => {
    $('#loginForm').classList.remove('hidden');
    $('#registerForm').classList.add('hidden');
    $('#tabLogin').classList.remove('text-slate-500');
    $('#tabRegister').classList.add('text-slate-500');
  });

  $('#tabRegister').addEventListener('click', () => {
    $('#registerForm').classList.remove('hidden');
    $('#loginForm').classList.add('hidden');
    $('#tabRegister').classList.remove('text-slate-500');
    $('#tabLogin').classList.add('text-slate-500');
  });

  // Forms
  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    localStorage.setItem('yt_user', email);
    closeAuthModal();
    updateUserUI();
    showNotification('Inicio de sesión correcto');
  });

  $('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#regEmail').value.trim();
    localStorage.setItem('yt_user', email);
    closeAuthModal();
    updateUserUI();
    showNotification('Cuenta creada correctamente');
  });

  // Click fuera
  $('#modal').addEventListener('click', (e) => {
    if (e.target === $('#modal')) closeModal();
  });

  $('#modalAuth').addEventListener('click', (e) => {
    if (e.target === $('#modalAuth')) closeAuthModal();
  });

  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeAuthModal();
    }
  });

  updateUserUI();
});
