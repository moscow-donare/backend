import { Campaign } from "../domain/campaign";
import type { ContainerCampaignRepository } from "../domain/ports/ICampaignRepository";

export type EditCampaignInput = {
    campaignId: number;
    creatorId: number;
    name?: string;
    description?: string;
    category?: number;
    goal?: number;
    endDate?: Date;
    photo?: string;
};

export async function editCampaign(
    input: EditCampaignInput,
    repositories: ContainerCampaignRepository
): AsyncResult<Campaign> {
    const campaignResult = await repositories.campaignRepository.findById(input.campaignId);
    if (campaignResult.IsErr || !campaignResult.Unwrap()) {
        return Result.Err({
            code: "CAMPAIGN_NOT_FOUND",
            message: "La campaña no fue encontrada",
        });
    }
    const campaign = campaignResult.Unwrap();

    if (campaign.creator.id !== input.creatorId) {
        return Result.Err({
            code: "USER_NOT_CAMPAIGN_CREATOR",
            message: "El usuario no es el creador de la campaña",
        });
    }

    const updates: Partial<Campaign> = {};
    Object.entries(input).forEach(([key, value]) => {
        if (
            ["name", "description", "category", "goal", "endDate", "photo"].includes(key) &&
            value !== undefined
        ) {
            (updates as any)[key] = value;
        }
    });

    const updatedResult = await repositories.campaignRepository.edit(input.campaignId, updates);
    if (updatedResult.IsErr || !updatedResult.Unwrap()) {
        return Result.Err({
            code: "CAMPAIGN_UPDATE_FAILED",
            message: "No se pudo actualizar la campaña",
        });
    }
    const updated = updatedResult.Unwrap();

    return Result.Ok(updated);
}