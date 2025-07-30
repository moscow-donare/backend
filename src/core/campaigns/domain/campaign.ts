import type { User } from "$core/users/domain/user";

export class Campaign {
    private constructor(
        public readonly id: number | null,
        public name: string,
        public description: string,
        public category: string,
        public goal: number,
        public endDate: Date,
        public url: string,
        public photos: string[],
        public creator: User,
        public status: CampaignStatus = CampaignStatus.IN_REVIEW,
        public readonly createdAt: Date | null
    ) { }

    static create(props: {
        id?: number | null;
        name: string;
        description: string;
        category: string;
        goal: number;
        endDate: Date;
        url: string;
        photos: string[];
        creator: User;
        status?: CampaignStatus;
        createdAt?: Date | null;
    }): Campaign {
        return new Campaign(
            props.id ?? null,
            props.name,
            props.description,
            props.category,
            props.goal,
            props.endDate,
            props.url,
            props.photos,
            props.creator,
            props.status ?? CampaignStatus.IN_REVIEW,
            props.createdAt ?? null
        );
    }

    static createWithId(props: {
        id: number;
        name: string;
        description: string;
        category: string;
        goal: number;
        endDate: Date;
        url: string;
        photos: string[];
        creator: User;
        status?: CampaignStatus;
        createdAt?: Date | null;
    }): Campaign {
        return new Campaign(
            props.id,
            props.name,
            props.description,
            props.category,
            props.goal,
            props.endDate,
            props.url,
            props.photos,
            props.creator,
            props.status ?? CampaignStatus.IN_REVIEW,
            props.createdAt ?? null
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