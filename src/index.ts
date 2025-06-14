import "./shared/global.ts";
import HonoService from "./infraestructure/hono/service";
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
  port: 3000,
});
console.log("servidor corriendo puerto 3000");
