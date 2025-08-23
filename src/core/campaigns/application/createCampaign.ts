import { Campaign } from "../domain/campaign";
import type { User } from "../../users/domain/user";
import type { ContainerCampaignRepository } from "../domain/ports/ICampaignRepository";
import { CampaignStatus } from "../domain/enums";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import { Filter } from "$shared/core/domain/criteria/Filter";

export type CreateCampaignInput = {
    name: string;
    description: string;
    category: number;
    goal: number;
    endDate: Date;
    photo: string;
    creator: User;
};

export async function createCampaign(
    input: CreateCampaignInput,
    repositories: ContainerCampaignRepository
): AsyncResult<Campaign> {
    const criteria: Criteria = new Criteria();
    const filterbyId: Filter = new Filter('creator_id', input.creator.id);
    criteria.addFilter(filterbyId);
    const userCampaignsResult = await repositories.campaignRepository.matching(criteria);
    console.log(userCampaignsResult)
    if (userCampaignsResult.IsOk) {
        const campaigns = userCampaignsResult.Unwrap();
        console.log(campaigns)
        if (campaigns.some(c => c.statusChange[0]?.getState() === CampaignStatus.IN_REVIEW)) {
            return Result.Err({
                code: "USER_CAMPAIGN_IN_REVIEW",
                message: "El usuario ya tiene una campaña en revisión",
            });
        }
        if (campaigns.some(c => c.statusChange[0]?.getState() === CampaignStatus.ACTIVE)) {
            return Result.Err({
                code: "USER_ACTIVE_CAMPAIGN_EXISTS",
                message: "El usuario ya tiene una campaña activa",
            });
        }
    }

    const campaign = Campaign.create(
        input
    );

    const createdResult = await repositories.campaignRepository.save(campaign);
    if (createdResult.IsErr) {
        return Result.Err({
            code: createdResult.Error.code,
            message: createdResult.Error.message,
            details: createdResult.Error.details,
        });
    }
    const created = createdResult.Unwrap();
    if (!created) {
        return Result.Err({
            code: "CAMPAIGN_CREATION_FAILED",
            message: "No se pudo crear la campaña",
        });
    }

    return Result.Ok(created);
}