import listByCriteria from "$shared/core/application/listByCriteria";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import { Filter } from "$shared/core/domain/criteria/Filter";
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
    //creatorId: number,
    repositories: ContainerCampaignRepository
): AsyncResult<Campaign> {
    // TODO: Aca no se deberia validar que quien trata de editar la campaña sea el creador? también la campaña se puede editar en ciertos estados
    // Dejo el codigo comentado de como se haría con criteria para evitar hacer los findBy...
    //const criteria: Criteria = new Criteria();
    //const filterbyId: Filter = new Filter('id', input.campaignId);
    // aca podes agregar el filtro de creatorId que se pasa por parametro y en el handler lo recibis por la session
    //const filterByCreatorId: Filter = new Filter('creator_id', creatorId);
    // agregas los filtros al criteria
    //criteria.addFilter(filterbyId);
    //criteria.addFilter(filterByCreatorId);
    // usas el caso de uso del shared para buscar la campaña
    //const campaignResult = await listByCriteria(repositories.campaignRepository, criteria);
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