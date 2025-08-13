import { Campaign, CampaignCategory, CampaignStatus } from "../domain/campaign";
import type { User } from "../../users/domain/user";
import type { ContainerCampaignRepository } from "../domain/ports/ICampaignRepository";

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
    const userCampaignsResult = await repositories.campaignRepository.findByUser(input.creator);
    if (userCampaignsResult.IsOk) {
        const campaigns = userCampaignsResult.Unwrap();
        if (campaigns.some(c => c.status === CampaignStatus.IN_REVIEW)) {
            return Result.Err({
                code: "USER_CAMPAIGN_IN_REVIEW",
                message: "El usuario ya tiene una campaña en revisión",
            });
        }
        if (campaigns.some(c => c.status === CampaignStatus.ACTIVE)) {
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

    return Result.Ok({
        id: created.id,
        name: created.name,
        description: created.description,
        category: created.category,
        goal: created.goal,
        endDate: created.endDate,
        photo: created.photo,
        creator: created.creator,
        status: created.status,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
    });
}