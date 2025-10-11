import { Web3AuthRepository } from "./infraestructure/repositories/web3auth/Web3AuthRepository.ts";
import { UserDrizzleRepository } from "./infraestructure/repositories/drizzle/UserDrizzleRepository.ts";
import { UserDataDrizzleRepository } from "./infraestructure/repositories/drizzle/UserDataDrizzleRepository.ts";
import HonoService from "./infraestructure/hono/service.ts";
import { CampaignDrizzleRepository } from "./infraestructure/repositories/drizzle/CampaignDrizzleRepository.ts";

export const honoService = new HonoService({
    repositories: {
        web3auth: Web3AuthRepository.getInstance(),
        user: new UserDrizzleRepository(),
        userData: new UserDataDrizzleRepository(),
        campaign: new CampaignDrizzleRepository()
    },
});
