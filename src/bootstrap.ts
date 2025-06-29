import { Web3AuthRepository } from "./infraestructure/repositories/web3auth/Web3AuthRepository.ts";
import { UserDrizzleRepository } from "./infraestructure/repositories/drizzle/UserDrizzleRepository.ts";
import HonoService from "./infraestructure/hono/service.ts";

export const honoService = new HonoService({
    repositories: {
        web3auth: Web3AuthRepository.getInstance(),
        user: new UserDrizzleRepository(),
    },
});
