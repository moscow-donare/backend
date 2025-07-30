import type { User } from "$core/users/domain/user";
import type { Campaign } from "../campaign";

export interface ICampaignRepository {
    save(campaign: Campaign): AsyncResult<Campaign>;
    findByUser(user: User): AsyncResult<Campaign[]>;
}

export type ContainerCampaignRepository = {
    campaignRepository: ICampaignRepository;
};