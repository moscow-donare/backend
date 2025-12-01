import { JsonRpcProvider } from "ethers";
import type { BlockchainTx } from "./blockchainTx.intrface";
import { Contract } from "ethers";
import { CAMPAIGN_ABI } from "$shared/infraestructure/ABI/abi";
import { CampaignStatus } from "$core/campaigns/domain/enums";

export class FetchCampaignStateTx implements BlockchainTx<CampaignStatus> {
    constructor(
        private readonly contractAddress: string,
        private readonly provider: JsonRpcProvider = new JsonRpcProvider()
    ) { }

    async value(): Promise<CampaignStatus> {
        const contract = new Contract(this.contractAddress, CAMPAIGN_ABI, this.provider);
        if (!contract || !contract.status) {
            throw new Error('Contract not found');
        }
        const status = await contract.status() as number;
        return this._mapStatus(status as 0 | 1 | 2 | 3 | 4);
    }

    private _mapStatus(statusNumber: 0 | 1 | 2 | 3 | 4): CampaignStatus {
        const status = {
            0: CampaignStatus.IN_REVIEW,
            1: CampaignStatus.PENDING_CHANGES,
            2: CampaignStatus.ACTIVE,
            3: CampaignStatus.CANCELED,
            4: CampaignStatus.COMPLETED,
        };
        return status[statusNumber];
    }
}