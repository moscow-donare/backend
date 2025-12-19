import { JsonRpcProvider } from "ethers";
export class ValidOf {
    constructor(
        private readonly txHash: string,
        private readonly contractAddress: string
    ) { }


    async value(): Promise<boolean> {
        const provider = new JsonRpcProvider(process.env.RPC_URL);

        const receipt = await provider.getTransactionReceipt(this.txHash);
        return receipt != null && receipt.status === 1 && receipt.to?.toLowerCase() === this.contractAddress.toLowerCase();
    }
}