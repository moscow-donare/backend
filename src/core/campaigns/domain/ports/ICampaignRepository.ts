import type { User } from "$core/users/domain/user";
import type { ICriteriaRepository } from "$shared/infraestructure/ports/ICriteriaRepository";
import type { Campaign } from "../campaign";

export interface ICampaignRepository extends ICriteriaRepository<Campaign> {
    save(campaign: Campaign): AsyncResult<Campaign>;
    findByUser(user: User): AsyncResult<Campaign[]>;
    edit(campaign: Campaign): AsyncResult<Campaign>;
}

export type ContainerCampaignRepository = {
    campaignRepository: ICampaignRepository;
};