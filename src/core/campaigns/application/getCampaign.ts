import { Campaign } from "../domain/campaign";
import type { User } from "../../users/domain/user";
import type { ContainerCampaignRepository } from "../domain/ports/ICampaignRepository";

export type GetCampaignInput = {
    campaignId: number;
    user: User;
};

export async function getCampaign(
    input: GetCampaignInput,
    repositories: ContainerCampaignRepository
): AsyncResult<Campaign> {
    const campaignResult = await repositories.campaignRepository.findById(input.campaignId);
    let campaign: Campaign | undefined;

    if (campaignResult.IsOk) {
        campaign = campaignResult.Unwrap();
        if (campaign.creator.id !== input.user.id) {
            return Result.Err({
                code: "USER_NOT_CAMPAIGN_CREATOR",
                message: "El usuario no es el creador de la campaña",
            });
        }
    } else {
        return Result.Err({
            code: "CAMPAIGN_NOT_FOUND",
            message: "La campaña no fue encontrada",
        });
    }

    return Result.Ok(campaign);
}