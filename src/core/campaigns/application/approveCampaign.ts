import type { ContainerCampaignRepository } from "../domain/ports/ICampaignRepository";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import { Filter } from "$shared/core/domain/criteria/Filter";
import listByCriteria from "$shared/core/application/listByCriteria";
import type { Campaign } from "../domain/campaign";
import type { InputType } from "src/infraestructure/hono/handlers/campaigns/approveCampaign";

export const approveCampaign = async (approveCampaignDTO: InputType, repositories: ContainerCampaignRepository) => {
    const criteria: Criteria = new Criteria();
    criteria.addFilter(new Filter("id", approveCampaignDTO.id));

    const campaign = await listByCriteria<Campaign>(repositories.campaignRepository, criteria);
    const campaignToApprove = campaign.Unwrap()[0] ?? null;

    if (campaign.IsErr || !campaignToApprove) {
        return Result.Err({
            code: "CAMPAIGN_NOT_FOUND",
            details: campaign.Error || "No campaign found with the given criteria",
        });
    }

    if (campaignToApprove.isApproved()) {
        return Result.Err({
            code: "CAMPAIGN_ALREADY_APPROVED",
            details: "The campaign is already approved",
        });
    }

    campaignToApprove.approve(approveCampaignDTO.contractAddress);

    const updatedCampaign = await repositories.campaignRepository.edit(campaignToApprove);

    if (updatedCampaign.IsErr) {
        return Result.Err({
            code: "CAMPAIGN_NOT_UPDATED",
            details: updatedCampaign.Error,
        });
    }

    return Result.Ok(updatedCampaign.Unwrap());
}