# YourTime — Prototipo

Proyecto prototipo de la plataforma YourTime (reservas en comercios locales).

Instrucciones rápidas:

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar servidor (sirve `public/` y los endpoints):

```bash
npm start
```

3. Abrir en el navegador:

http://localhost:3000/

Notas:
- El frontend usa Leaflet (CDN) y Tailwind a través del CDN para prototipado rápido.
- He incluido `tailwind.config.js` por si deseas construir los estilos con Tailwind CLI.
- Endpoints disponibles:
  - `GET /api/locales` -> lista de locales de ejemplo
  - `POST /api/reservas` -> recibir una reserva (JSON)
