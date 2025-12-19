import { CampaignStatus } from "$core/campaigns/domain/enums";
import type { ContainerCampaignRepository } from "$core/campaigns/domain/ports/ICampaignRepository";
import { StateOf } from "$core/campaigns/domain/stateOf";
import { Donation } from "../domain/donation";
import type { ContainerDonationRepository } from "../domain/ports/IDonationRepository";
import { ValidOf } from "../domain/validOf";

export type CreateDonationInput = {
    userId: number;
    campaignId: number;
    amount: number;
    txHash: string;
    isAnonymous: boolean;
};

//TODO: Refactorizar esta bosta
export async function createDonation(input: CreateDonationInput, repositories: ContainerDonationRepository & ContainerCampaignRepository): AsyncResult<Donation> {
    // Buscamos la campaña
    const campaignResult = await repositories.campaignRepository.findById(input.campaignId);
    if (campaignResult.IsErr) {
        return Result.Err({
            code: campaignResult.Error.code,
            message: campaignResult.Error.message,
            details: campaignResult.Error.details,
        });
    }
    const campaign = campaignResult.Unwrap();

    if (campaign.getCurrentStatus() !== CampaignStatus.ACTIVE || !campaign.contractAddress) {
        return Result.Err({
            code: "VALIDATION_ERROR::CAMPAIGN_NOT_ACTIVE",
            message: "La campaña no puede recibir donaciones",
        });
    }

    // Validamos que el TX Hash sea válido
    if (!(await (new ValidOf(input.txHash, campaign.contractAddress)).value())) {
        return Result.Err({
            code: "VALIDATION_ERROR::INVALID_TX_HASH",
            message: "El TX Hash no es válido",
        });
    }

    // Vamos a buscar el estado de la campaña a la blockchain para saber si necesita ser modificado
    const stateOnChain = await new StateOf(campaign.contractAddress).value();


    // Validamos si es que la campaña alcanzo su meta que deberia tener el estado on chain en completed
    if (stateOnChain === CampaignStatus.COMPLETED) {
        campaign.markAsCompleted();
        await repositories.campaignRepository.edit(campaign);
    }

    const donation = Donation.create(input);

    const result = await repositories.donationRepository.save(donation);

    if (result.IsErr) {
        return Result.Err({
            code: result.Error.code,
            message: result.Error.message,
            details: result.Error.details,
        });
    }

    return Result.Ok(result.Unwrap());
}
