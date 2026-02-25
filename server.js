// server.js - Servidor Express con API para locales, reservas y búsqueda
// Soporta login simulado, productos por tienda y filtrado por ciudad
// Uso: node server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Base de datos simulada: 15 locales robustos
// (4 en Guadalajara, 3 en Madrid, 3 en Barcelona, resto distribuido)
const locales = [
  // GUADALAJARA (4 locales solicitados)
  {
    id: 1,
    nombre: 'Panadería Alcarreña',
    ciudad: 'Guadalajara',
    category: 'Alimentación',
    descripcion: 'Panadería tradicional con recetas locales y horno diario',
    lat: 40.6335,
    lng: -3.1660,
    horario: 'L-D 07:00-14:00, 17:00-20:00',
    horarios_disponibles: ['08:00', '09:00', '10:00', '11:00', '17:00', '18:00'],
    telefono: '+34 949 200 001',
    imagen_portada: 'https://source.unsplash.com/800x600/?bakery&sig=301',
    estado: 'Abierto',
    productos: [
      { id: 'p1', nombre: 'Baguette', precio: 1.20, imagen: 'https://source.unsplash.com/400x300/?baguette&sig=401', stock: 60 }
    ]
  },
  {
    id: 2,
    nombre: 'Deportes Infantado',
    ciudad: 'Guadalajara',
    category: 'Deportes',
    descripcion: 'Material deportivo y ropa técnica para todas las edades',
    lat: 40.6340,
    lng: -3.1685,
    horario: 'L-V 09:30-20:00, S 10:00-14:00',
    horarios_disponibles: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    telefono: '+34 949 200 002',
    imagen_portada: 'https://source.unsplash.com/800x600/?sports-store&sig=302',
    estado: 'Abierto',
    productos: [
      { id: 'p2', nombre: 'Zapatillas Running', precio: 65.00, imagen: 'https://source.unsplash.com/400x300/?running-shoes&sig=402', stock: 30 }
    ]
  },
  {
    id: 3,
    nombre: 'Clínica Dental Sigüenza',
    ciudad: 'Guadalajara',
    category: 'Salud',
    descripcion: 'Clínica dental con servicios de urgencia y prevención',
    lat: 40.6315,
    lng: -3.1648,
    horario: 'L-V 09:00-19:00',
    horarios_disponibles: ['09:00', '10:00', '11:00', '15:00', '16:00'],
    telefono: '+34 949 200 003',
    imagen_portada: 'https://source.unsplash.com/800x600/?dentist-clinic&sig=303',
    estado: 'Abierto',
    productos: [
      { id: 'p3', nombre: 'Revisión Dental', precio: 35.00, imagen: 'https://source.unsplash.com/400x300/?dental-check&sig=403', stock: 100 }
    ]
  },
  {
    id: 4,
    nombre: 'Tecnología Guadalajara',
    ciudad: 'Guadalajara',
    category: 'Tecnología',
    descripcion: 'Electrónica, accesorios y reparación de dispositivos',
    lat: 40.6348,
    lng: -3.1692,
    horario: 'L-S 10:00-20:00',
    horarios_disponibles: ['10:30', '11:30', '12:30', '16:00', '17:00'],
    telefono: '+34 949 200 004',
    imagen_portada: 'https://source.unsplash.com/800x600/?electronics-store&sig=304',
    estado: 'Abierto',
    productos: [
      { id: 'p4', nombre: 'Reparación de Móvil', precio: 49.00, imagen: 'https://source.unsplash.com/400x300/?phone-repair&sig=404', stock: 20 }
    ]
  },

  // MADRID (3 locales)
  {
    id: 5,
    nombre: 'Cafetería Central Madrid',
    ciudad: 'Madrid',
    descripcion: 'Café especializado en bebidas artesanales',
    lat: 40.4168,
    lng: -3.7038,
    horario: 'L-V 08:00-21:00, S-D 09:00-20:00',
    horarios_disponibles: ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'],
    telefono: '+34 912 345 678',
    imagen_portada: 'https://source.unsplash.com/800x600/?coffee-shop-madrid&sig=105',
    estado: 'Abierto',
    productos: [
      { id: 'p15', nombre: 'Latte Artesanal', precio: 3.00, imagen: 'https://source.unsplash.com/400x300/?latte-art&sig=215', stock: 50 },
      { id: 'p16', nombre: 'Sándwich Gourmet', precio: 6.50, imagen: 'https://source.unsplash.com/400x300/?gourmet-sandwich&sig=216', stock: 30 },
      { id: 'p17', nombre: 'Brownie Artesanal', precio: 2.50, imagen: 'https://source.unsplash.com/400x300/?brownie-chocolate&sig=217', stock: 20 }
    ]
  },
  {
    id: 6,
    slug: 'libreria-metropolitana',
    nombre: 'Librería Metropolitana',
    ciudad: 'Madrid',
    categorias: ['Cultura','Librería'],
    descripcion: 'Librería con amplio catálogo de libros y revistas',
    lat: 40.4200,
    lng: -3.6900,
    horario: 'L-S 10:00-21:00',
    slots: ['10:30','11:00','11:30','14:00','15:00','16:00','17:00'],
    telefono: '+34 913 123 456',
    imagen_portada: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    imagen_tienda: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80',
    estado: 'Abierto',
    productos: [
      { id: 'p18', nombre: 'Novela Bestseller', precio: 16.95, descripcion: 'Narrativa contemporánea', image_url: 'https://source.unsplash.com/400x300/?novel', category_interna: 'Libros', stock:25 },
      { id: 'p19', nombre: 'Agenda 2026', precio: 9.95, descripcion: 'Agenda compacta anual', image_url: 'https://source.unsplash.com/400x300/?agenda', category_interna: 'Papelería', stock:40 },
      { id: 'p20', nombre: 'Libreta de Cuero', precio: 12.50, descripcion: 'Cuaderno tapa de cuero', image_url: 'https://source.unsplash.com/400x300/?notebook', category_interna: 'Papelería', stock:20 }
    ]
  },
  {
    id: 7,
    slug: 'restaurante-la-taberna',
    nombre: 'Restaurante La Taberna',
    ciudad: 'Madrid',
    categorias: ['Gastronomía','Restaurante'],
    descripcion: 'Cocina tradicional española',
    lat: 40.4150,
    lng: -3.7100,
    horario: 'L-D 13:00-16:00, 20:00-23:00',
    slots: ['13:00','13:30','14:00','20:00','20:30','21:00','21:30'],
    telefono: '+34 914 567 890',
    imagen_portada: 'https://images.unsplash.com/photo-1541544182797-8f48fa9b4f0f?auto=format&fit=crop&w=1200&q=80',
    imagen_tienda: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=80',
    estado: 'Abierto',
    productos: [
      { id: 'p21', nombre: 'Gazpacho y Tabla de Jamón', precio: 14.00, descripcion: 'Entrante tradicional', image_url: 'https://source.unsplash.com/400x300/?gazpacho', category_interna: 'Entrantes', stock:20 },
      { id: 'p22', nombre: 'Pulpo a la Gallega', precio: 16.50, descripcion: 'Pulpo con pimentón', image_url: 'https://source.unsplash.com/400x300/?octopus', category_interna: 'Plato Principal', stock:15 },
      { id: 'p23', nombre: 'Crema Catalana', precio: 6.50, descripcion: 'Postre tradicional', image_url: 'https://source.unsplash.com/400x300/?crema-catalana', category_interna: 'Postres', stock:30 }
    ]
  },

  // BARCELONA (3 locales)
  {
    id: 8,
    nombre: 'Panadería Delicias Barcelona',
    ciudad: 'Barcelona',
    descripcion: 'Panadería artesanal con tradición centenaria',
    lat: 41.3851,
    lng: 2.1734,
    horario: 'L-S 06:30-20:00, D 07:00-14:00',
    horarios_disponibles: ['08:00', '09:00', '10:00', '11:00', '15:00', '16:00'],
    telefono: '+34 931 234 567',
    imagen_portada: 'https://source.unsplash.com/800x600/?bakery-barcelona&sig=108',
    estado: 'Abierto',
    productos: [
      { id: 'p24', nombre: 'Pan Tostado Ibérico', precio: 2.00, imagen: 'https://source.unsplash.com/400x300/?bread-toasted&sig=224', stock: 70 },
      { id: 'p25', nombre: 'Bollo de Crema Tradicional', precio: 2.20, imagen: 'https://source.unsplash.com/400x300/?cream-bun&sig=225', stock: 50 },
      { id: 'p26', nombre: 'Tarta de Queso Casera', precio: 4.50, imagen: 'https://source.unsplash.com/400x300/?cheesecake&sig=226', stock: 15 }
    ]
  },
  {
    id: 9,
    nombre: 'Boutique Moda Barcelona',
    ciudad: 'Barcelona',
    descripcion: 'Ropa y accesorios de diseño independiente',
    lat: 41.3835,
    lng: 2.1700,
    horario: 'L-S 10:00-20:00, D 11:00-19:00',
    horarios_disponibles: ['10:30', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'],
    telefono: '+34 933 456 789',
    imagen_portada: 'https://source.unsplash.com/800x600/?fashion-boutique&sig=109',
    estado: 'Abierto',
    productos: [
      { id: 'p27', nombre: 'Camiseta Diseño Local', precio: 22.00, imagen: 'https://source.unsplash.com/400x300/?tshirt-design&sig=227', stock: 40 },
      { id: 'p28', nombre: 'Bolso Artesanal Piel', precio: 45.00, imagen: 'https://source.unsplash.com/400x300/?leather-bag&sig=228', stock: 10 },
      { id: 'p29', nombre: 'Bufanda de Lana', precio: 18.00, imagen: 'https://source.unsplash.com/400x300/?wool-scarf&sig=229', stock: 25 }
    ]
  },
  {
    id: 10,
    slug: 'studio-yoga-barcelona',
    nombre: 'Studio Yoga Barcelona',
    ciudad: 'Barcelona',
    categorias: ['Deporte','Bienestar'],
    descripcion: 'Clases de yoga y meditación',
    lat: 41.39,
    lng: 2.18,
    horario: 'L-D 07:00-21:00',
    slots: ['07:30','09:00','10:30','17:00','18:30','19:30'],
    telefono: '+34 934 123 567',
    imagen_portada: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    imagen_tienda: 'https://images.unsplash.com/photo-1526401485004-2d2f08c9b8e5?auto=format&fit=crop&w=1400&q=80',
    estado: 'Abierto',
    productos: [
      { id: 'p30', nombre: 'Clase Yoga 60 min', precio: 18.00, descripcion: 'Clase para todos los niveles', image_url: 'https://source.unsplash.com/400x300/?yoga', category_interna: 'Clases', stock:100 },
      { id: 'p31', nombre: 'Clase Pilates 60 min', precio: 20.00, descripcion: 'Pilates de fuerza y estabilidad', image_url: 'https://source.unsplash.com/400x300/?pilates', category_interna: 'Clases', stock:100 },
      { id: 'p32', nombre: 'Clase Meditación 30 min', precio: 10.00, descripcion: 'Técnicas de respiración', image_url: 'https://source.unsplash.com/400x300/?meditation', category_interna: 'Sesiones', stock:100 }
    ]
  },
  {
    id: 11,
    nombre: 'Floristería Sol Valencia',
    ciudad: 'Valencia',
    descripcion: 'Flores y plantas para cualquier ocasión',
    lat: 39.4699,
    lng: -0.3763,
    horario: 'M-D 09:00-20:00',
    horarios_disponibles: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'],
    telefono: '+34 963 123 456',
    imagen_portada: 'https://source.unsplash.com/800x600/?flower-shop&sig=111',
    estado: 'Abierto',
    productos: [
      { id: 'p33', nombre: 'Ramo Personalizado', precio: 30.00, imagen: 'https://source.unsplash.com/400x300/?flower-bouquet&sig=233', stock: 20 },
      { id: 'p34', nombre: 'Planta de Interior', precio: 15.00, imagen: 'https://source.unsplash.com/400x300/?indoor-plant&sig=234', stock: 25 },
      { id: 'p35', nombre: 'Arreglo Floral', precio: 45.00, imagen: 'https://source.unsplash.com/400x300/?flower-arrangement&sig=235', stock: 10 }
    ]
  },
  {
    id: 12,
    nombre: 'Taller Mecánico Luna Sevilla',
    ciudad: 'Sevilla',
    descripcion: 'Reparaciones y mantenimiento de vehículos',
    lat: 37.3891,
    lng: -5.9844,
    horario: 'L-V 09:00-18:00',
    horarios_disponibles: ['09:30', '10:00', '10:30', '11:00', '15:00', '15:30', '16:00'],
    telefono: '+34 954 123 456',
    imagen_portada: 'https://source.unsplash.com/800x600/?car-repair&sig=112',
    estado: 'Abierto',
    productos: [
      { id: 'p36', nombre: 'Revisión General', precio: 45.00, imagen: 'https://source.unsplash.com/400x300/?car-service&sig=236', stock: 50 },
      { id: 'p37', nombre: 'Cambio de Aceite', precio: 35.00, imagen: 'https://source.unsplash.com/400x300/?oil-change&sig=237', stock: 40 },
      { id: 'p38', nombre: 'Alineación de Ruedas', precio: 40.00, imagen: 'https://source.unsplash.com/400x300/?wheel-alignment&sig=238', stock: 30 }
    ]
  },
  {
    id: 13,
    nombre: 'Librería Norte Bilbao',
    ciudad: 'Bilbao',
    descripcion: 'Libros, revistas y material escolar',
    lat: 43.2630,
    lng: -2.9350,
    horario: 'L-S 10:00-19:00',
    horarios_disponibles: ['10:30', '11:00', '12:00', '15:00', '16:00', '17:00'],
    telefono: '+34 944 123 456',
    imagen_portada: 'https://source.unsplash.com/800x600/?library-bilbao&sig=113',
    estado: 'Abierto',
    productos: [
      { id: 'p39', nombre: 'Libro Clásico Español', precio: 14.99, imagen: 'https://source.unsplash.com/400x300/?classic-book&sig=239', stock: 30 },
      { id: 'p40', nombre: 'Diccionario Enciclopédico', precio: 24.99, imagen: 'https://source.unsplash.com/400x300/?dictionary&sig=240', stock: 15 },
      { id: 'p41', nombre: 'Bloc de Notas Premium', precio: 8.99, imagen: 'https://source.unsplash.com/400x300/?notepad&sig=241', stock: 50 }
    ]
  },
  {
    id: 14,
    nombre: 'Mercado Central Alicante',
    ciudad: 'Alicante',
    descripcion: 'Fruta, verdura y pescado fresco diario',
    lat: 38.3452,
    lng: -0.4810,
    horario: 'M-D 08:00-14:00',
    horarios_disponibles: ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
    telefono: '+34 965 000 009',
    imagen_portada: 'https://source.unsplash.com/800x600/?farmers-market&sig=114',
    estado: 'Abierto',
    productos: [
      { id: 'p42', nombre: 'Fruta de Temporada (kg)', precio: 3.50, imagen: 'https://source.unsplash.com/400x300/?fresh-fruit&sig=242', stock: 100 },
      { id: 'p43', nombre: 'Pescado Fresco', precio: 12.00, imagen: 'https://source.unsplash.com/400x300/?fresh-fish&sig=243', stock: 80 },
      { id: 'p44', nombre: 'Verduras Variadas (kg)', precio: 4.00, imagen: 'https://source.unsplash.com/400x300/?fresh-vegetables&sig=244', stock: 120 }
    ]
  },
  {
    id: 15,
    nombre: 'Boutique Urbana Granada',
    ciudad: 'Granada',
    descripcion: 'Moda emergente y accesorios sostenibles',
    lat: 37.1773,
    lng: -3.5986,
    horario: 'L-S 10:00-21:00, D 11:00-19:00',
    horarios_disponibles: ['10:30', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
    telefono: '+34 958 000 010',
    imagen_portada: 'https://source.unsplash.com/800x600/?fashion-store-urban&sig=115',
    estado: 'Abierto',
    productos: [
      { id: 'p45', nombre: 'Camiseta Sostenible', precio: 25.00, imagen: 'https://source.unsplash.com/400x300/?sustainable-shirt&sig=245', stock: 35 },
      { id: 'p46', nombre: 'Pantalón Denim Orgánico', precio: 60.00, imagen: 'https://source.unsplash.com/400x300/?organic-jeans&sig=246', stock: 20 },
      { id: 'p47', nombre: 'Bolso Reciclado', precio: 40.00, imagen: 'https://source.unsplash.com/400x300/?recycled-bag&sig=247', stock: 15 }
    ]
  }
];

// Endpoint para obtener locales
app.get('/api/locales', (req, res) => {
  res.json(locales);
});

// Endpoint para recibir reservas
app.post('/api/reservas', (req, res) => {
  const reserva = req.body;
  // En un backend real validaríamos y persistiríamos la reserva.
  console.log('Reserva recibida:', reserva);
  res.status(201).json({ ok: true, message: 'Reserva recibida', reserva });
});

// Simulated chat endpoint (ready for future AI integration)
app.post('/api/chat', (req, res) => {
  const { message } = req.body || {};
  const m = (message || '').toLowerCase();
  let reply = 'Soy tu asistente de YourTime, ¿en qué puedo ayudarte con tu reserva hoy?';
  if (m.includes('tienda') || m.includes('tiendas') || m.includes('locales') || m.includes('guadalajara')) {
    reply = 'En Guadalajara tenemos locales como "Miel Alcarria" y "Regalos Infantado". ¿Quieres ver más detalles?';
  } else if (m.includes('horario') || m.includes('horarios') || m.includes('franja')) {
    reply = 'Cada tienda tiene franjas horarias personalizadas. Puedes seleccionar una franja desde la ficha de la tienda y reservarla.';
  }
  // Simulate small latency
  setTimeout(() => res.json({ ok: true, response: reply }), 250 + Math.floor(Math.random() * 300));
});

// Nuevo endpoint: POST /api/partners - Recibe solicitudes de registro de comercios
app.post('/api/partners', (req, res) => {
  const { nombreNegocio, ciudad, tipoComercio, telefono, email } = req.body;

  // Validación de datos
  if (!nombreNegocio || !ciudad || !tipoComercio || !telefono || !email) {
    return res.status(400).json({ 
      ok: false, 
      message: 'Faltan datos requeridos' 
    });
  }

  // Validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      ok: false, 
      message: 'Email inválido' 
    });
  }

  // Validación de teléfono (al menos 9 dígitos)
  const telefonoLimpio = telefono.replace(/\D/g, '');
  if (telefonoLimpio.length < 9) {
    return res.status(400).json({ 
      ok: false, 
      message: 'Teléfono inválido' 
    });
  }

  // Simular guardado de solicitud (en un caso real, se guardaría en BD)
  const solicitud = {
    id: Date.now(),
    nombreNegocio,
    ciudad,
    tipoComercio,
    telefono,
    email,
    fechaSolicitud: new Date().toISOString(),
    estado: 'pendiente_validacion'
  };

  console.log('📧 Nueva solicitud de comercio recibida:', solicitud);

  // Responder con éxito
  res.status(201).json({ 
    ok: true, 
    message: 'Solicitud recibida. Un asesor se pondrá en contacto pronto.',
    solicitud
  });
});

app.listen(PORT, () => {
  console.log(`YourTime server escuchando en http://localhost:${PORT}`);
});
