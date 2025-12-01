import type { Donation } from "../donation";

export interface IDonationRepository {
    save(donation: Donation): AsyncResult<Donation>;
}

export type ContainerDonationRepository = {
    donationRepository: IDonationRepository;
};
