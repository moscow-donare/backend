import { Hono } from 'hono';

const app = new Hono();
app.get('/', (c) => c.text('¡Donare Backend!'));

// Lanza el servidor manualmente
Bun.serve({
  fetch: app.fetch,
  port: 3000,
});
console.log("servidor corriendo puerto 3000");

