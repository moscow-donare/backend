export class Donation {
    private constructor(
        public readonly id: number | null,
        public readonly userId: number,
        public readonly campaignId: number,
        public readonly amount: number,
        public readonly txHash: string,
        public readonly isAnonymous: boolean,
        public readonly createdAt: Date | null
    ) { }

    static create(props: {
        userId: number;
        campaignId: number;
        amount: number;
        txHash: string;
        isAnonymous: boolean;
    }): Donation {
        return new Donation(null, props.userId, props.campaignId, props.amount, props.txHash, props.isAnonymous, null);
    }

    static createWithId(props: {
        id: number;
        userId: number;
        campaignId: number;
        amount: number;
        txHash: string;
        isAnonymous: boolean;
        createdAt: Date | null;
    }): Donation {
        return new Donation(props.id, props.userId, props.campaignId, props.amount, props.txHash, props.isAnonymous, props.createdAt);
    }
}
