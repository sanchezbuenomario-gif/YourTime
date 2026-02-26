// script.js - Lógica de interacción de la aplicación (mejorada)
// - Inicializa el mapa con Leaflet
// - Carga locales desde /api/locales
// - Muestra modal con banner y catálogo de productos
// - Notificaciones tipo toast con animación
// - Gestión de auth (simulada) y dropdown de perfil

// Helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// featured shops demo data (estructura ampliada tal como solicitaste)
const featuredShops = [
  {
    nombre: 'La Bizcochería',
    descripcion_corta: 'Pan de masa madre, bizcochos artesanos y dulces típicos alcarreños.',
    direccion: 'C. Alvarfáñez de Minaya, 4, 19001 Guadalajara.',
    rango_precio: '€',
    horario_hoy: '08:00 - 14:30 | 17:00 - 20:00',
    abierto: true,
    precioMedio: 'Desde 0,50€',
    imagen: './img/Captura de pantalla 2026-02-24 160829.png',
    categoria: 'Gastronomía',
    rating: 4.8,
    reviews: 125
  },
  {
    nombre: 'Calderon Sport',
    descripcion_corta: 'Material deportivo y asesoramiento experto en el corazón de Madrid.',
    direccion: 'Plaza Mayor, 12, 28012 Madrid.',
    rango_precio: '€€',
    horario_hoy: '10:00 - 14:00 | 16:00 - 20:00',
    abierto: false,
    precioMedio: 'Desde 15€',
    imagen: './img/calderon.png',
    categoria: 'Deportes',
    rating: 4.5,
    reviews: 98
  },
  {
    nombre: 'Clínica Dental Vitaldent',
    descripcion_corta: 'Atención dental moderna y cercana con servicio personalizados.',
    direccion: 'Av. de la Constitución, 8, 19005 Guadalajara.',
    rango_precio: '€€€',
    horario_hoy: '09:00 - 13:30 | 15:30 - 19:00',
    abierto: true,
    precioMedio: 'Desde 30€',
    imagen: './img/vitaldent.png',
    categoria: 'Salud',
    rating: 4.6,
    reviews: 76
  }
];

// render featured shops/cards dynamically - Clean & Professional Design
function renderFeaturedShops() {
  const container = document.getElementById('featuredShops');
  if (!container) return;
  container.innerHTML = '';
  featuredShops.forEach(shop => {
    const card = document.createElement('div');
    card.className = 'relative group overflow-hidden rounded-lg shadow-lg border-2 border-yellow-400 bg-white h-80';
    card.innerHTML = `
      <!-- Imagen -->
      <img src="${shop.imagen}" alt="${shop.nombre}" class="w-full h-3/4 object-cover transition-transform duration-300 group-hover:brightness-60" />
      
      <!-- Overlay informativo (aparece en hover) -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex flex-col justify-center items-center p-4 text-white text-center opacity-0 group-hover:opacity-100">
        <p class="text-xs italic text-yellow-300 mb-3">Your Time is Gold</p>
        <p class="text-sm leading-tight mb-3 max-h-12 overflow-hidden">${shop.descripcion_corta}</p>
        <div class="flex items-center gap-2 text-xs mb-2 justify-center">
          <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"w-4 h-4 flex-shrink-0\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M17.657 16.657L13.414 12.414a4 4 0 10-5.657-5.657l-4.243 4.243a8 8 0 1011.314 11.314z\"/>
          </svg>
          <span class=\"text-xs leading-tight\">${shop.direccion}</span>
        </div>
        <div class="flex items-center gap-2 text-xs mb-2 justify-center">
          <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"w-4 h-4 flex-shrink-0\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z\"/>
          </svg>
          <span class=\"text-xs\">${shop.horario_hoy}</span>
        </div>
        <p class=\"text-xs mb-1\">${shop.abierto ? '<span class=\"text-green-300\">● Abierto</span>' : '<span class=\"text-red-300\">● Cerrado</span>'}</p>
        <p class=\"text-xs font-semibold\">${shop.rango_precio}</p>
      </div>
      
      <!-- Sección inferior siempre visible -->
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/98 to-white/90 backdrop-blur-sm p-4 flex items-center justify-between z-10 h-1/4">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-primary truncate">${shop.nombre}</h3>
          <div class="flex items-center gap-1 mt-1">
            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"w-4 h-4 text-yellow-500\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
              <path d=\"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.153c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.176 0l-3.36 2.44c-.784.57-1.838-.197-1.539-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.98 9.382c-.783-.57-.38-1.81.588-1.81h4.152a1 1 0 00.951-.69l1.286-3.955z\"/>
            </svg>
            <span class=\"text-xs text-slate-600\">${shop.rating}</span>
          </div>
        </div>
        <a href=\"tiendas.html\" class=\"inline-flex items-center gap-1 bg-accent text-white px-3 py-2 rounded font-semibold text-sm hover:brightness-95 transition-all duration-200 group-hover:scale-105\">Ver</a>
      </div>
      
      <!-- Badge de precio -->
      <div class="absolute top-3 right-3 bg-accent text-white text-xs px-2.5 py-1 rounded-full shadow-lg font-semibold">${shop.precioMedio}</div>
    `;
    container.appendChild(card);
  });
}

// Mostrar notificación tipo toast (con animación Tailwind)
function showNotification(message) {
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast bg-primary text-white px-4 py-2 rounded-lg shadow-2xl transform transition-all';
  toast.innerText = message;
  container.appendChild(toast);
  // entrada
  requestAnimationFrame(() => {
    toast.classList.add('opacity-100', 'translate-y-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

// Map & locales
let map;
let currentLocal = null;
let activeShop = null;
let cart = [];
let selectedSlot = null;
let userLocationMarker = null;
let userLocationCircle = null;

// Generate sample products when a shop has none
function generateProductsForLocal(local) {
  const cat = (local.categorias && local.categorias[0]) || local.category || local.description || '';
  const name = (local.nombre || 'Tienda').toLowerCase();
  const samples = [];
  if (cat.toLowerCase().includes('pan') || name.includes('pan') || cat.toLowerCase().includes('gastronom')) {
    samples.push({ id: 'g1', nombre: 'Pan de Cruz', precio: 1.50, descripcion: 'Receta tradicional', image_url: 'https://source.unsplash.com/400x300/?bread', stock:50 });
    samples.push({ id: 'g2', nombre: 'Croissant', precio: 2.00, descripcion: 'Mantequilla artesano', image_url: 'https://source.unsplash.com/400x300/?croissant', stock:40 });
    samples.push({ id: 'g3', nombre: 'Bollo', precio: 1.20, descripcion: 'Bollo fresco', image_url: 'https://source.unsplash.com/400x300/?pastry', stock:30 });
  } else if (cat.toLowerCase().includes('tec') || name.includes('tec') || cat.toLowerCase().includes('electr')) {
    samples.push({ id: 't1', nombre: 'Cargador USB', precio: 9.99, descripcion: 'USB-C rápido', image_url: 'https://source.unsplash.com/400x300/?charger', stock:30 });
    samples.push({ id: 't2', nombre: 'Auriculares', precio: 29.99, descripcion: 'In-ear', image_url: 'https://source.unsplash.com/400x300/?headphones', stock:20 });
    samples.push({ id: 't3', nombre: 'Funda móvil', precio: 12.00, descripcion: 'Protege tu dispositivo', image_url: 'https://source.unsplash.com/400x300/?phone-case', stock:25 });
  } else if (cat.toLowerCase().includes('salud') || name.includes('clínica') || name.includes('dental')) {
    samples.push({ id: 's1', nombre: 'Revisión Básica', precio: 30.00, descripcion: 'Revisión y limpieza', image_url: 'https://source.unsplash.com/400x300/?dentist', stock:50 });
    samples.push({ id: 's2', nombre: 'Higiene Oral', precio: 20.00, descripcion: 'Limpieza profesional', image_url: 'https://source.unsplash.com/400x300/?dental-cleaning', stock:40 });
  } else {
    samples.push({ id: 'o1', nombre: 'Producto Destacado', precio: 9.99, descripcion: 'Artículo destacado', image_url: 'https://source.unsplash.com/400x300/?store', stock:50 });
    samples.push({ id: 'o2', nombre: 'Producto Popular', precio: 14.99, descripcion: 'Muy demandado', image_url: 'https://source.unsplash.com/400x300/?shopping', stock:30 });
  }
  return samples;
}

function initMap() {
  map = L.map('map', { zoomControl: true }).setView([40.4168, -3.7038], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
}

// Añade marcador pulso indicando la ubicación del usuario
function addUserLocationMarker(lat, lng) {
  // eliminar anteriores
  if (userLocationMarker) { try { map.removeLayer(userLocationMarker); } catch (e){} userLocationMarker = null; }
  if (userLocationCircle) { try { map.removeLayer(userLocationCircle); } catch (e){} userLocationCircle = null; }

  const html = `<div class="pulse-marker" aria-hidden="true"></div>`;
  const icon = L.divIcon({ html, className: '', iconSize: [24,24], iconAnchor: [12,12] });
  userLocationMarker = L.marker([lat, lng], { icon, zIndexOffset: 2000 }).addTo(map);
  // círculo de precisión aproximada
  userLocationCircle = L.circle([lat, lng], { radius: 40, color: '#002147', fillColor: '#002147', fillOpacity: 0.06, weight: 1 }).addTo(map);
}

function showLocStatus(text, visible = true) {
  const el = document.getElementById('locStatus');
  if (!el) return;
  el.innerText = text;
  el.classList.toggle('hidden', !visible);
}

function startGeolocation(focus = true) {
  if (!navigator || !navigator.geolocation) {
    showNotification('Tu navegador no soporta geolocalización');
    return;
  }
  showLocStatus('Localizándote...', true);
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    addUserLocationMarker(lat, lng);
    if (focus && map) map.setView([lat, lng], 15);
    showLocStatus('Tu ubicación actual', true);
    setTimeout(() => showLocStatus('', false), 2500);
  }, (err) => {
    if (err.code === err.PERMISSION_DENIED) {
      showLocStatus('No podemos localizarte automáticamente, pero puedes buscar "Guadalajara" o tu ciudad manualmente', true);
    } else {
      showLocStatus('Error al intentar localizarte', true);
    }
    setTimeout(() => showLocStatus('', false), 5000);
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}

// Abrir modal con datos y catálogo
function showLocalModal(local) {
  // backward-compat: open full shop view
  showShopView(local);
}

function showShopView(local) {
  activeShop = local;
  cart = [];
  selectedSlot = null;
  document.body.classList.add('overflow-hidden');

  const shopView = $('#shopView');
  const header = $('#shopHeader');
  const title = $('#shopTitle');
  const loading = $('#shopLoading');
  const productsGrid = $('#productsGrid');
  const sidebar = $('#reserveSidebar');

  title.innerText = local.nombre;
  header.style.backgroundImage = `url('${local.imagen_tienda || local.imagen_portada || local.imagen_portada}')`;

  // show view and loader
  shopView.classList.remove('hidden');
  productsGrid.classList.add('hidden');
  loading.classList.remove('hidden');
  sidebar.classList.add('hidden');

  // simulate loading / skeleton
  setTimeout(() => {
    // populate products
    productsGrid.innerHTML = '';
    if (!local.productos || (local.productos && local.productos.length === 0)) {
      local.productos = generateProductsForLocal(local);
    }
    (local.productos || []).forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card bg-white p-3';
      card.innerHTML = `
        <img src="${prod.image_url || prod.imagen || prod.imagen_portada}" class="w-full h-36 object-cover rounded" alt="${prod.nombre}" />
        <div class="mt-2">
          <div class="font-semibold text-primary">${prod.nombre}</div>
          <div class="text-sm text-slate-600">${prod.descripcion || ''}</div>
          <div class="mt-2 flex items-center justify-between">
            <div class="font-semibold">€${(prod.precio||0).toFixed(2)}</div>
            <button class="add-btn" data-id="${prod.id}">+</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });

    // wire add buttons
    productsGrid.querySelectorAll('.add-btn').forEach(b => b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const product = (local.productos || []).find(p => p.id == id);
      if (product) addToCart(product);
    }));

    loading.classList.add('hidden');
    productsGrid.classList.remove('hidden');
  }, 700);

  // back button
  $('#backToMap').onclick = () => closeShopView();

  // confirm button
  $('#confirmReserveShop').onclick = () => confirmReserveFromShop();
}

function closeShopView() {
  const shopView = $('#shopView');
  shopView.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
  // reset sidebar and cart
  cart = [];
  selectedSlot = null;
  activeShop = null;
  $('#productsGrid') && ($('#productsGrid').innerHTML = '');
}

function addToCart(product) {
  const existing = cart.find(c => c.id === product.id);
  if (existing) existing.qty += 1; else cart.push({ ...product, qty: 1 });
  updateCartUI();
}

function updateCartUI() {
  const sidebar = $('#reserveSidebar');
  const cartItems = $('#cartItems');
  const slotOptions = $('#slotOptions');
  if (!activeShop) return;

  // show sidebar
  sidebar.classList.remove('hidden');
  cartItems.innerHTML = '';
  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `<img src="${item.image_url || item.imagen}" /><div class="flex-1"><div class="font-medium">${item.nombre}</div><div class="text-sm text-slate-500">€${item.precio.toFixed(2)} x ${item.qty}</div></div>`;
    cartItems.appendChild(el);
  });

  // slots
  slotOptions.innerHTML = '';
  (activeShop.slots || []).forEach(slot => {
    const id = `slot-${slot.replace(/[: ]/g,'')}`;
    const wrapper = document.createElement('label');
    wrapper.className = 'inline-flex items-center gap-2';
    wrapper.innerHTML = `<input type="radio" name="slot" value="${slot}" ${selectedSlot===slot? 'checked':''} /> <span class="px-2 py-1 border rounded">${slot}</span>`;
    wrapper.querySelector('input').addEventListener('change', (e) => { selectedSlot = e.target.value; });
    slotOptions.appendChild(wrapper);
  });
}

function confirmReserveFromShop() {
  const user = localStorage.getItem('yt_user');
  if (!user) { showAuthModal(); return; }
  if (!activeShop) return;
  if (cart.length === 0) { showNotification('Añade al menos un producto a la reserva'); return; }
  if (!selectedSlot) { showNotification('Selecciona una franja horaria'); return; }

  const payload = {
    localId: activeShop.id,
    user,
    slot: selectedSlot,
    items: cart.map(c => ({ id: c.id, nombre: c.nombre, qty: c.qty }))
  };

  fetch('/api/reservas', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
    .then(r => r.json())
    .then(() => {
      // show detailed summary overlay
      const summary = document.getElementById('reserveSummary');
      const summaryText = document.getElementById('reserveSummaryText');
      const productNames = cart.map(c => `${c.nombre} x${c.qty}`).join(', ');
      summaryText.innerText = `Has reservado ${productNames} en ${activeShop.nombre} para las ${selectedSlot}`;
      summary.classList.remove('hidden');
      // wire close
      document.getElementById('closeReserveSummary').onclick = () => { summary.classList.add('hidden'); closeShopView(); };
      // auto close after 3s
      setTimeout(() => { if (summary) { summary.classList.add('hidden'); closeShopView(); } }, 3000);
    })
    .catch(() => showNotification('Error al confirmar la reserva'));
}

function onOutsideModalClick(e) {
  const content = $('#modalContent');
  if (!content.contains(e.target)) closeLocalModal();
}

function closeLocalModal() {
  $('#modal').classList.add('hidden');
  $('#modal').classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
  $('#modal').removeEventListener('click', onOutsideModalClick);
}

// Reservas
function openReserveFlow() {
  const user = localStorage.getItem('yt_user');
  if (!user) { showAuthModal(); return; }
  const slot = prompt('Introduce la franja horaria deseada (ej: 2026-03-01 10:00-11:00):');
  if (!slot) return;
  fetch('/api/reservas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ localId: currentLocal.id, user, slot }) })
    .then(r => r.json())
    .then(() => showNotification('Reserva enviada correctamente'))
    .catch(() => showNotification('Error al enviar la reserva'));
}

// Auth modal (pestañas)
function showAuthModal() {
  document.body.classList.add('overflow-hidden');
  const modal = $('#modalAuth');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  // add fullscreen marker so CSS full-screen styles apply
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
  const userStatus = $('#userStatus');
  const btnLogin = $('#btnLogin');
  if (user) {
    userStatus.innerText = `Conectado: ${user}`;
    userStatus.classList.remove('hidden');
    btnLogin.classList.add('hidden');
    // Crear dropdown en navbar
    if (!$('#profileMenu')) {
      const nav = document.createElement('div');
      nav.id = 'profileMenu';
      nav.className = 'relative';
      nav.innerHTML = `<button id="profileBtn" class="flex items-center gap-2 px-3 py-1 rounded hover:bg-primary/5 text-primary">${user}</button>
        <div id="profileDropdown" class="hidden absolute right-0 mt-2 bg-white border rounded shadow-lg w-40 z-[2100]"><a href="#" id="logoutBtn" class="block px-3 py-2 text-sm">Cerrar sesión</a></div>`;
      document.querySelector('header > div > div').appendChild(nav);
      $('#profileBtn').addEventListener('click', () => $('#profileDropdown').classList.toggle('hidden'));
      $('#logoutBtn').addEventListener('click', () => { localStorage.removeItem('yt_user'); location.reload(); });
    }
  } else {
    userStatus.innerText = 'No has iniciado sesión';
    userStatus.classList.add('hidden');
    btnLogin.classList.remove('hidden');
    $('#profileMenu') && $('#profileMenu').remove();
  }
}

// Gestión de tabs en auth
function setupAuthTabs() {
  $('#tabLogin').addEventListener('click', () => { $('#loginForm').classList.remove('hidden'); $('#registerForm').classList.add('hidden'); $('#tabLogin').classList.remove('text-slate-500'); $('#tabRegister').classList.add('text-slate-500'); });
  $('#tabRegister').addEventListener('click', () => { $('#registerForm').classList.remove('hidden'); $('#loginForm').classList.add('hidden'); $('#tabRegister').classList.remove('text-slate-500'); $('#tabLogin').classList.add('text-slate-500'); });
  // cerrar haciendo click fuera
  $('#modalAuth').addEventListener('click', (e) => { const box = $('#modalAuth > div'); if (!box.contains(e.target)) closeAuthModal(); });
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupAuthTabs();

  // handlers modales
  $('#closeModal').addEventListener('click', closeLocalModal);
  $('#openReserve').addEventListener('click', openReserveFlow);

  // Auth buttons
  $('#btnLogin').addEventListener('click', showAuthModal);
  // login form
  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    localStorage.setItem('yt_user', email);
    closeAuthModal();
    updateUserUI();
    showNotification('Inicio de sesión correcto');
    // Keep the user on the homepage (index) after login
  });
  // register form
  $('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#regName').value.trim();
    const email = $('#regEmail').value.trim();
    localStorage.setItem('yt_user', email);
    closeAuthModal();
    updateUserUI();
    showNotification('Cuenta creada correctamente');
    // Keep the user on the homepage (index) after registration
  });

  // cerrar auth con tecla ESC
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLocalModal(); closeAuthModal(); } });

  updateUserUI();

  // Botón y comportamiento de geolocalización
  const locateBtn = document.getElementById('locateBtn');
  if (locateBtn) {
    locateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      startGeolocation(true);
    });
  }

  // Intentar iniciar geolocalización automáticamente tras cargar (pide permiso)
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' }).then((p) => {
      if (p.state === 'granted') {
        startGeolocation(true);
      } else if (p.state === 'prompt') {
        setTimeout(() => startGeolocation(false), 1200);
      } else {
        // denied
        showLocStatus('No podemos localizarte automáticamente, pero puedes buscar "Guadalajara" o tu ciudad manualmente', true);
        setTimeout(() => showLocStatus('', false), 5000);
      }
    }).catch(() => { setTimeout(() => startGeolocation(false), 1400); });
  } else {
    setTimeout(() => startGeolocation(false), 1400);
  }
});

/* ------------------------- Chatbot assistant ------------------------- */
// Simple simulated AI brain
function getResponse(userMessage) {
  const msg = (userMessage || '').toLowerCase();

  // Saludo
  if (/\b(hola|buenas|buenos días|buenas tardes)\b/.test(msg)) {
    return 'Hola! Soy el Asistente de YourTime. Puedo ayudarte a encontrar tiendas, revisar horarios y reservar franjas. ¿Qué necesitas?';
  }

  // Ubicación: Guadalajara
  if (msg.includes('guadalajara')) {
    return 'En Guadalajara dispones de: Panadería Alcarreña, Deportes Infantado, Clínica Dental Sigüenza y Tecnología Guadalajara. ¿Te interesa ver sus horarios o localizaciones?';
  }

  // Tiendas en general
  if (msg.includes('tienda') || msg.includes('tiendas') || msg.includes('locales')) {
    return 'Tenemos múltiples locales en España. Puedes buscar por ciudad o categoría en la página de Tiendas. ¿Quieres que filtre por Guadalajara u otra ciudad?';
  }

  // Privacidad / datos
  if (msg.includes('datos') || msg.includes('privacidad') || msg.includes('rgpd') || msg.includes('seguridad')) {
    return 'Tu privacidad es importante. Tratamos los datos conforme al RGPD: recopilamos solo lo necesario y los procesamos con seguridad. Para más detalles consulta nuestra Política de Privacidad.';
  }

  // Proceso de reserva
  if (msg.includes('reserv') || msg.includes('proceso') || msg.includes('cómo reservar') || msg.includes('como reservar')) {
    return 'Proceso de reserva: 1) Busca la tienda y el producto. 2) Selecciona una franja horaria disponible. 3) Confirma la reserva y recibe la confirmación. ¿Quieres que te guíe en una tienda concreta?';
  }

  // Error / no entiende
  if (msg.trim().length === 0) {
    return 'No he recibido ningún mensaje. ¿En qué puedo ayudarte?';
  }

  // Fallback amable
  return 'Lo siento, no lo entendí completamente. Puedo transferirte a un agente humano si lo prefieres, o puedes reformular la pregunta.';
}

function appendMessage(role, text) {
  const container = document.getElementById('chatMessages');
  const row = document.createElement('div');
  row.className = `msg-row ${role === 'user' ? 'user' : 'bot'}`;

  const bubble = document.createElement('div');
  bubble.className = 'msg ' + (role === 'user' ? 'msg-user' : 'msg-bot');
  bubble.innerText = text;

  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chatMessages');
  const row = document.createElement('div');
  row.className = 'msg-row bot typing-row';
  const bubble = document.createElement('div');
  bubble.className = 'msg msg-bot typing';
  bubble.innerText = 'Escribiendo...';
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return row;
}

function removeTyping(node) {
  node && node.remove();
}

// Hook UI
document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('closeChat');
  const minimizeBtn = document.getElementById('minimizeChat');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');

  function openPanel() {
    panel.classList.remove('hidden');
    panel.classList.add('fade-in-up');
    input.focus();
  }
  function closePanel() {
    panel.classList.add('hidden');
  }

  fab.addEventListener('click', () => {
    if (panel.classList.contains('hidden')) openPanel(); else closePanel();
  });
  closeBtn.addEventListener('click', closePanel);
  minimizeBtn.addEventListener('click', () => { panel.classList.toggle('hidden'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';

    // Show typing indicator
    const typingNode = showTyping();
    const delay = 700 + Math.floor(Math.random() * 700);

    setTimeout(() => {
      // compute response (local simulated AI)
      const response = getResponse(text);
      removeTyping(typingNode);
      appendMessage('bot', response);

      // Optionally: send to backend for future integration (non-blocking)
      // fetch('/api/chat', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({message: text}) })
      //  .then(r=>r.json()).then(data=>{ /* use data.response if available */ });
    }, delay);
  });

  // support Enter to send (already covered by form submit) and Esc to close
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') panel.classList.add('hidden'); });

  // greet user when opening
  fab.addEventListener('click', () => {
    // If panel just opened, inject a welcome message once
    setTimeout(() => {
      const msgs = document.getElementById('chatMessages');
      if (!msgs.dataset.welcomed) {
        appendMessage('bot', 'Hola 👋 Soy el asistente de YourTime. Puedo ayudarte a encontrar tiendas en España, explicar horarios y reservas.');
        msgs.dataset.welcomed = '1';
      }
    }, 300);
  });
  
  // Carousel initialization with clean dot states
  (function initCarousel(){
    const slides = Array.from(document.querySelectorAll('#heroCarousel .carousel-slide'));
    const dots = Array.from(document.querySelectorAll('#heroCarousel .carousel-dot'));
    let current = 0;
    function show(i){
      slides.forEach((s,idx)=>{ if(idx===i){ s.classList.remove('hidden'); } else { s.classList.add('hidden'); } });
      dots.forEach((d,idx)=> {
        if(idx === i) {
          // Estado activo: naranja fuerte
          d.classList.add('bg-accent');
          d.classList.remove('bg-gray-400/40');
        } else {
          // Estado inactivo: gris suave
          d.classList.remove('bg-accent');
          d.classList.add('bg-gray-400/40');
        }
      });
      current = i;
    }
    dots.forEach(d=> d.addEventListener('click', (e)=> show(Number(e.currentTarget.dataset.index))));
    show(0);
    setInterval(()=> show((current+1)%slides.length), 5000);
  })();

  // ====== MANEJO DE FORMULARIO DE COMERCIOS ======
  const btnSoyComercio = $('#btnSoyComercio');
  const btnAbrirFormulario = $('#btnAbrirFormulario');
  const modalComercio = $('#modalComercio');
  const closeModalComercio = $('#closeModalComercio');
  const formularioComercio = $('#formularioComercio');
  const btnCancelarFormulario = $('#btnCancelarFormulario');
  const modalExitoComercio = $('#modalExitoComercio');
  const btnCerrarExito = $('#btnCerrarExito');
  const paraNegocios = $('#paraNegocios');

  // Abrir formulario desde botón "Soy un Comercio"
  btnSoyComercio.addEventListener('click', () => {
    modalComercio.classList.remove('hidden');
  });

  // Abrir formulario desde botón "Registra tu Negocio Ahora"
  btnAbrirFormulario.addEventListener('click', () => {
    modalComercio.classList.remove('hidden');
  });

  // Cerrar modal de formulario
  closeModalComercio.addEventListener('click', () => {
    modalComercio.classList.add('hidden');
    formularioComercio.reset();
  });

  btnCancelarFormulario.addEventListener('click', () => {
    modalComercio.classList.add('hidden');
    formularioComercio.reset();
  });

  // Cerrar modal de éxito
  btnCerrarExito.addEventListener('click', () => {
    modalExitoComercio.classList.add('hidden');
  });

  // Enviar formulario de comercios
  formularioComercio.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Recopilar datos del formulario
    const datosComercio = {
      nombreNegocio: $('#nombreNegocio').value.trim(),
      ciudad: $('#ciudadNegocio').value,
      tipoComercio: $('#tipoComercio').value,
      telefono: $('#telefonoComercio').value.trim(),
      email: $('#emailComercio').value.trim()
    };

    // Validación básica
    if (!datosComercio.nombreNegocio || !datosComercio.ciudad || !datosComercio.tipoComercio || !datosComercio.telefono || !datosComercio.email) {
      showNotification('Por favor completa todos los campos');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datosComercio.email)) {
      showNotification('Por favor introduce un email válido');
      return;
    }

    // Validación de teléfono (básica)
    if (datosComercio.telefono.length < 9) {
      showNotification('Por favor introduce un teléfono válido');
      return;
    }

    try {
      // Enviar datos al backend
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosComercio)
      });

      if (response.ok) {
        // Cerrar modal de formulario y mostrar éxito
        modalComercio.classList.add('hidden');
        formularioComercio.reset();
        modalExitoComercio.classList.remove('hidden');
      } else {
        showNotification('Error al enviar la solicitud. Intenta más tarde.');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error de conexión. Intenta más tarde.');
    }
  });

  // Scroll suave a la sección "Para Negocios" si se accede desde un enlace directo
  if (window.location.hash === '#paraNegocios') {
    setTimeout(() => {
      paraNegocios.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }
});


