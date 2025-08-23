import type { User } from "$core/users/domain/user";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import { Filter } from "$shared/core/domain/criteria/Filter";
import { Campaign } from "../domain/campaign";
import { CampaignStatus } from "../domain/enums";
import type { ContainerCampaignRepository } from "../domain/ports/ICampaignRepository";

export type EditCampaignInput = {
    campaignId: number;
    creator: User;
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
    const criteria: Criteria = new Criteria();
    const filterbyId: Filter = new Filter('id', input.campaignId);
    criteria.addFilter(filterbyId);

    // const campaignResult = await listByCriteria(repositories.campaignRepository, criteria);
    // console.log('criteria encontrado', campaignResult);
    const campaignResult = await repositories.campaignRepository.findById(input.campaignId);

    if (campaignResult.IsErr || !campaignResult.Unwrap()) {
        return Result.Err({
            code: "CAMPAIGN_NOT_FOUND",
            message: "La campaña no fue encontrada",
        });
    }

    const campaign = campaignResult.Unwrap();

    if (campaign?.creator.id !== input.creator.id) {
        return Result.Err({
            code: "CAMPAIGN_CREATOR_MISMATCH",
            message: "El usuario no es el creador de la campaña",
        });
    }

    // if (campaign?.status !== CampaignStatus.IN_REVIEW && campaign?.status !== CampaignStatus.ACTIVE) {
    //     return Result.Err({
    //         code: "CAMPAIGN_CANNOT_BE_EDITED",
    //         message: "La campaña solo puede ser editada si está pendiente a cambios o aceptada",
    //     });
    // }

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