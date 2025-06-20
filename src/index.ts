import "./shared/global.ts";
import HonoService from "./infraestructure/hono/service";
import "./infraestructure/drizzle/db.ts";
import { Web3AuthRepository } from "./infraestructure/repositories/web3auth/Web3AuthRepository.ts";
import { UserDrizzleRepository } from "./infraestructure/repositories/drizzle/UserDrizzleRepository.ts";

const honoService = new HonoService({
  repositories: {
    web3auth: Web3AuthRepository.getInstance(),
    user: new UserDrizzleRepository(),
  },
});

Bun.serve({
  fetch: honoService.fetch,
  port: 3001,
});
console.log("servidor corriendo puerto 3001");
