import { FetchCampaignStateTx } from "$shared/core/domain/blockchainTxs/fetchCampaignStateTx";
import { CampaignStatus } from "./enums";

export class StateOf {
    constructor(
        private readonly contractAddress: string,
    ) { }

    async value(): Promise<CampaignStatus> {
        return await (new FetchCampaignStateTx(this.contractAddress)).value()
    }
}