import type { User } from "$core/users/domain/user";
import type { CreateCampaignInput } from "../application/createCampaign";
import { CampaignCategory, CampaignStatus } from "./enums";
import { StateChanges } from "./stateChanges";

export class Campaign {
    private constructor(
        public id: number | null,
        public name: string,
        public description: string,
        public category: CampaignCategory,
        public goal: number,
        public endDate: Date,
        public photo: string,
        public creator: User,
        public stateChanges: StateChanges[],
        public contractAddress: string | null = null,
        public createdAt: Date,
        public updatedAt: Date
    ) { }
    static create(props: CreateCampaignInput): Campaign {
        return new Campaign(
            null,
            props.name,
            props.description,
            props.category,
            props.goal,
            props.endDate,
            props.photo,
            props.creator,
            [StateChanges.create(CampaignStatus.IN_REVIEW, "Campaign created")],
            props.blockchainId ?? null,
            new Date(),
            new Date()
        );
    }

    static createWithId(props: {
        id: number;
        name: string;
        description: string;
        category: CampaignCategory;
        goal: number;
        endDate: Date;
        photo: string;
        creator: User;
        stateChanges: StateChanges[];
        contractAddress: string | null;
        createdAt?: Date | null;
        updatedAt?: Date | null;
    }): Campaign {
        return new Campaign(
            props.id,
            props.name,
            props.description,
            props.category,
            props.goal,
            props.endDate,
            props.photo,
            props.creator,
            props.stateChanges,
            props.contractAddress,
            props.createdAt ?? new Date(),
            props.updatedAt ?? new Date()
        );
    }

    public isApproved(): boolean {
        return this.getCurrentStatus() === CampaignStatus.ACTIVE;
    }

    public getCurrentStatus(): CampaignStatus {
        return this.stateChanges?.[this.stateChanges.length - 1]?.getState() ?? CampaignStatus.IN_REVIEW;
    }

    public approve(contractAddress: string): void {
        this.contractAddress = contractAddress;
        this.stateChanges.push(StateChanges.create(CampaignStatus.ACTIVE, "Campaign approved"));
        this.updatedAt = new Date();
    }
}