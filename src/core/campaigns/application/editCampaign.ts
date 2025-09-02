import type { User } from "$core/users/domain/user";
import listByCriteria from "$shared/core/application/listByCriteria";
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
    blockchainId?: string | null;
};

type EditableFields = Omit<Campaign, "id" | "createdAt" | "updatedAt">;

const POSSIBLE_EDIT_STATES = [
    CampaignStatus.IN_REVIEW,
    CampaignStatus.ACTIVE,
    CampaignStatus.PENDING_CHANGES
];

export async function editCampaign(
    input: EditCampaignInput,
    repositories: ContainerCampaignRepository
): AsyncResult<Campaign> {
    const criteria: Criteria = new Criteria();
    const filterbyId: Filter = new Filter("id", input.campaignId);
    const creatorFilter: Filter = new Filter("creator_id", input.creator.id);
    criteria.addFilter(filterbyId);
    criteria.addFilter(creatorFilter);

    const campaignResult = await listByCriteria<Campaign>(repositories.campaignRepository, criteria);
    const campaign = campaignResult.Unwrap()[0] ?? null;

    if (campaignResult.IsErr || !campaign) {
        return Result.Err({
            code: "CAMPAIGN_NOT_FOUND",
            message: "La campaña no fue encontrada"
        });
    }
    const currentState = campaign.stateChanges[0]?.getState() ?? null;

    if (
        !currentState || (currentState && !POSSIBLE_EDIT_STATES.includes(currentState))
    ) {
        return Result.Err({
            code: "CAMPAIGN_CANNOT_BE_EDITED",
            message: "La campaña solo puede ser editada si está pendiente a cambios o aceptada"
        });
    }

    const editableKeys: (keyof EditableFields)[] = [
        "name",
        "description",
        "category",
        "goal",
        "endDate",
        "photo"
    ];
    Object.entries(input).forEach(([key, value]) => {
        if (editableKeys.includes(key as keyof EditableFields) && value !== undefined) {
            (campaign as EditableFields)[key as keyof EditableFields] = value as never;
        }
    });

    const updatedResult = await repositories.campaignRepository.edit(campaign);
    if (updatedResult.IsErr || !updatedResult.Unwrap()) {
        return Result.Err({
            code: "CAMPAIGN_UPDATE_FAILED",
            message: "No se pudo actualizar la campaña"
        });
    }
    const updated = updatedResult.Unwrap();

    return Result.Ok(updated);
}
