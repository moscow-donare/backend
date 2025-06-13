import "./shared/global.ts";
import HonoService from "./infraestructure/hono/service";
import { Web3AuthRepository } from "./infraestructure/web3auth/repositories/Web3AuthRepository.ts";

const honoService = new HonoService({
  repositories: {
    web3auth: Web3AuthRepository.getInstance(),
  },
});

Bun.serve({
  fetch: honoService.fetch,
  port: 3000,
});
console.log("servidor corriendo puerto 3000");
