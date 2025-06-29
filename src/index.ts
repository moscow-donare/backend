import "./shared/global.ts";
import "./infraestructure/drizzle/db.ts";
import { honoService } from './bootstrap'

Bun.serve({
  fetch: honoService.fetch,
  port: 3001,
});
console.log("servidor corriendo puerto 3001");

