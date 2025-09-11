import type { ContainerCampaignRepository } from "../domain/ports/ICampaignRepository";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import { Filter } from "$shared/core/domain/criteria/Filter";
import listByCriteria from "$shared/core/application/listByCriteria";
import type { Campaign } from "../domain/campaign";
import type { InputType } from "src/infraestructure/hono/handlers/campaigns/cancelCampaign";
import type { User } from "$core/users/domain/user";
import { CampaignStatus } from "../domain/enums";

export const cancelCampaign = async (cancelCampaignDTO: InputType, user: User, repositories: ContainerCampaignRepository) => {
    const criteria: Criteria = new Criteria();
    criteria.addFilter(new Filter("id", cancelCampaignDTO.id));

    const campaign = await listByCriteria<Campaign>(repositories.campaignRepository, criteria);

    if (campaign.IsErr) {
        return Result.Err({
            code: "CAMPAIGN_NOT_FOUND",
            details: campaign.Error || "No campaign found with the given criteria",
        });
    }
    const campaignToCancel = campaign.Unwrap()[0] ?? null;
    if (!campaignToCancel) {
        return Result.Err({
            code: "CAMPAIGN_NOT_FOUND",
            details: "No campaign found with the given criteria",
        });
    }


    if (campaignToCancel.creator !== user && !user.isAdmin()) {
        return Result.Err({
            code: "UNAUTHORIZED",
            details: "You are not authorized to cancel this campaign",
        });
    }

    if (campaignToCancel.isCanceled()) {
        return Result.Err({
            code: "CAMPAIGN_ALREADY_CANCELED",
            details: "The campaign is already canceled",
        });
    }

    if (campaignToCancel.getCurrentStatus() !== CampaignStatus.IN_REVIEW && campaignToCancel.getCurrentStatus() !== CampaignStatus.ACTIVE) {
        return Result.Err({
            code: "INVALID_CAMPAIGN_STATUS",
            details: "Only campaigns in Pending Review or Active status can be canceled",
        });
    }

    campaignToCancel.cancel(cancelCampaignDTO.contractAddress, cancelCampaignDTO.reason || "Campaign canceled");

    const updatedCampaign = await repositories.campaignRepository.edit(campaignToCancel);

    if (updatedCampaign.IsErr) {
        return Result.Err({
            code: "CAMPAIGN_NOT_UPDATED",
            details: updatedCampaign.Error,
        });
    }

    return Result.Ok(updatedCampaign.Unwrap());
}