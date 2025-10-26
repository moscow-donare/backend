import type { ContainerCampaignRepository } from "../domain/ports/ICampaignRepository";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import { Filter } from "$shared/core/domain/criteria/Filter";
import listByCriteria from "$shared/core/application/listByCriteria";
import type { Campaign } from "../domain/campaign";
import type { InputType } from "src/infraestructure/hono/handlers/campaigns/requestCampaignChanges";

export const requestCampaignChanges = async (requestCampaignChangesDTO: InputType, repositories: ContainerCampaignRepository) => {
    const criteria: Criteria = new Criteria();
    criteria.addFilter(new Filter("id", requestCampaignChangesDTO.id));

    const campaign = await listByCriteria<Campaign>(repositories.campaignRepository, criteria);
    const campaignToRequestChanges = campaign.Unwrap()[0] ?? null;

    if (campaign.IsErr || !campaignToRequestChanges) {
        return Result.Err({
            code: "CAMPAIGN_NOT_FOUND",
            details: campaign.Error || "No campaign found with the given criteria",
        });
    }

    if (!campaignToRequestChanges.isPendingReview()) {
        return Result.Err({
            code: "INVALID_CAMPAIGN_STATUS",
            details: "Only campaigns in In Review status can have changes requested",
        });
    }

    campaignToRequestChanges.requestChanges(requestCampaignChangesDTO.reason);

    const updatedCampaign = await repositories.campaignRepository.edit(campaignToRequestChanges);

    if (updatedCampaign.IsErr) {
        return Result.Err({
            code: "CAMPAIGN_NOT_UPDATED",
            details: updatedCampaign.Error,
        });
    }

    return Result.Ok(updatedCampaign.Unwrap());
}