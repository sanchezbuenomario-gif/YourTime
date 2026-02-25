// script.js - Lógica de interacción de la aplicación (mejorada)
// - Inicializa el mapa con Leaflet
// - Carga locales desde /api/locales
// - Muestra modal con banner y catálogo de productos
// - Notificaciones tipo toast con animación
// - Gestión de auth (simulada) y dropdown de perfil

// Helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

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

  fetch('/api/locales')
    .then(r => r.json())
    .then(locales => {
      const list = $('#listaLocales');
      locales.forEach(local => {
        const marker = L.marker([local.lat, local.lng]).addTo(map);
        marker.on('click', () => showShopView(local));

        // tarjeta en lista
        const card = document.createElement('article');
        card.className = 'border rounded p-4 bg-white flex flex-col gap-2';
        card.innerHTML = `
          <div class="flex items-center gap-3">
            <img src="${local.imagen_portada}" alt="${local.nombre}" class="w-14 h-14 object-cover rounded" />
            <div>
              <h4 class="font-semibold text-primary">${local.nombre}</h4>
              <p class="text-sm text-slate-600">${local.horario}</p>
            </div>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <button class="bg-accent text-white px-3 py-1 rounded view-map" data-id="${local.id}">Ver en mapa</button>
            <button class="text-sm text-slate-600" onclick="showShopView(${JSON.stringify(local).replace(/'/g, "\'")})">Ver Tienda</button>
          </div>`;
        list.appendChild(card);

        // handler ver en mapa
        card.querySelector('.view-map').addEventListener('click', () => {
          map.setView([local.lat, local.lng], 14);
          showShopView(local);
        });
      });
    })
    .catch(err => console.error('Error cargando locales', err));
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
  
  // Carousel initialization
  (function initCarousel(){
    const slides = Array.from(document.querySelectorAll('#heroCarousel .carousel-slide'));
    const dots = Array.from(document.querySelectorAll('#heroCarousel .carousel-dot'));
    let current = 0;
    function show(i){
      slides.forEach((s,idx)=>{ if(idx===i){ s.classList.remove('hidden'); } else { s.classList.add('hidden'); } });
      dots.forEach((d,idx)=> d.classList.toggle('bg-white/60', idx===i));
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


