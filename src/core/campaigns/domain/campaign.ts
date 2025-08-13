import type { User } from "$core/users/domain/user";
import type { CreateCampaignInput } from "../application/createCampaign";

export class Campaign {
    private constructor(
        public readonly id: number | null,
        public name: string,
        public description: string,
        public category: CampaignCategory,
        public goal: number,
        public endDate: Date,
        public photo: string,
        public creator: User,
        public status: CampaignStatus = CampaignStatus.IN_REVIEW,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
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
            CampaignStatus.IN_REVIEW,
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
        status?: CampaignStatus;
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
            props.status ?? CampaignStatus.IN_REVIEW,
            props.createdAt ?? new Date(),
            props.updatedAt ?? new Date()
        );
    }
}

export enum CampaignStatus {
    IN_REVIEW = 0,
    PENDING_CHANGES = 1,
    ACTIVE = 2,
    CANCELLED = 3,
    COMPLETED = 4
}

export enum CampaignCategory {
    Health = 0,
    Education = 1,
    Emergency = 2,
    Raffle = 3,
    Project = 4,
}