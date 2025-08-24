import type { CampaignStatus } from "./enums";

export class StateChanges {
    private constructor(
        private id: number | null,
        private state: CampaignStatus,
        private createdAt: Date,
        private reason: string
    ) { }

    static create(state: CampaignStatus, reason: string): StateChanges {
        return new StateChanges(
            null,
            state,
            new Date(),
            reason
        );
    }

    static createWithId(
        id: number,
        state: CampaignStatus,
        createdAt: Date,
        reason: string
    ): StateChanges {
        console.log("Creating StateChanges", { id, state, createdAt, reason });
        return new StateChanges(
            id,
            state,
            createdAt,
            reason
        );
    }

    getId(): number | null {
        return this.id;
    }

    getState(): CampaignStatus {
        return this.state;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getReason(): string {
        return this.reason;
    }
}