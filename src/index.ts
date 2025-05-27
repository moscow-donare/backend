import HonoService from "./infraestructure/hono/service";

const honoService = new HonoService({
  repositories: {},
});

Bun.serve({
  fetch: honoService.fetch,
  port: 3000,
});
console.log("servidor corriendo puerto 3000");
