import type { ICampaignRepository } from "$core/campaigns/domain/ports/ICampaignRepository"
import type { IUserRepository } from "$core/users/domain/ports/IUserRepository"
import HonoService from "src/infraestructure/hono/service"
import { CampaignDrizzleRepository } from "src/infraestructure/repositories/drizzle/CampaignDrizzleRepository"
import { UserDrizzleRepository } from "src/infraestructure/repositories/drizzle/UserDrizzleRepository"
import type { IAuthRepository } from "src/infraestructure/repositories/web3auth/ports/IAuthRepository"
import { MockWeb3AuthRepository } from "tests/integration/auth.test"


export function createTestHonoService(
    overrides: Partial<{
        web3auth: IAuthRepository
        user: IUserRepository
        campaign: ICampaignRepository
    }> = {}
): HonoService {
    return new HonoService({
        repositories: {
            web3auth: overrides.web3auth ?? new MockWeb3AuthRepository({}),
            user: overrides.user ?? new UserDrizzleRepository(),
            campaign: overrides.campaign ?? new CampaignDrizzleRepository(),
        }
    }
    )
}