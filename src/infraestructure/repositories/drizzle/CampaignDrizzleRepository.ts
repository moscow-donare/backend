import type { ICampaignRepository } from "$core/campaigns/domain/ports/ICampaignRepository";
import type { Campaign } from "src/core/campaigns/domain/campaign";
import type { User } from "src/core/users/domain/user";
import { Campaign as CampaignDomain } from "src/core/campaigns/domain/campaign";
import { db } from "src/infraestructure/drizzle/db";
import { campaigns, state_changes } from "src/infraestructure/drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleCriteriaRepository } from "$shared/infraestructure/adapters/DrizzleCriteriaRepository";
import { StateChange } from "$core/campaigns/domain/stateChange";

const CODE_DB_CAMPAIGN_CREATION_FAILED = "DB_ERROR::CAMPAIGN_CREATION_FAILED";
const CODE_DB_CAMPAIGN_FIND_FAILED = "DB_ERROR::CAMPAIGN_FIND_FAILED";
const CODE_DB_CAMPAIGN_EDIT_FAILED = "DB_ERROR::CAMPAIGN_EDIT_FAILED";

type EditableCampaignFields = Pick<
    Campaign,
    'name' | 'description' | 'category' | 'goal' | 'endDate' | 'photo'
>;

export class CampaignDrizzleRepository extends DrizzleCriteriaRepository<Campaign, 'campaigns'> implements ICampaignRepository {
    constructor() {
        super(campaigns);
    }

    async save(campaign: Campaign): AsyncResult<Campaign> {
        try {
            const result = await db.insert(campaigns).values({
                name: campaign.name,
                description: campaign.description,
                category: campaign.category,
                goal: campaign.goal,
                end_date: campaign.endDate,
                photo: campaign.photo,
                creator_id: campaign.creator.id as number
            }).returning();
            const created = result?.[0];

            if (!created) {
                return Result.Err({
                    code: CODE_DB_CAMPAIGN_CREATION_FAILED,
                    message: "No se pudo crear la campaña",
                });
            }

            const statusChanges = await Promise.all(campaign.statusChange.map(async (stateChange) => {
                return await db.insert(state_changes).values({
                    campaign_id: created.id,
                    status: stateChange.getState(),
                    reason: stateChange.getReason()
                }).returning();
            }));
            console.log('status changes', statusChanges)
            // campaign.statusChange.forEach(async (stateChange) => {
            //     const statusChange = await db.insert(state_changes).values({
            //         campaign_id: created.id,
            //         status: stateChange.getState(),
            //         reason: stateChange.getReason()
            //     }).returning();
            //     console.log('status change', statusChange)
            //     statusChanges.push(statusChange);
            // });
            // console.log('array de status change', statusChanges)
            return Result.Ok(this.mapToDomain(created, campaign.creator, statusChanges));
        } catch (error) {
            console.error("Error saving campaign:", error);
            return Result.Err({
                code: CODE_DB_CAMPAIGN_CREATION_FAILED,
                message: "Error al guardar la campaña",
                details: error,
            });
        }
    }

    async findByUser(user: User): AsyncResult<Campaign[]> {
        try {
            if (!user.id) {
                return Result.Ok([]);
            }
            const result = await db.select().from(campaigns).where(eq(campaigns.creator_id, user.id));
            return Result.Ok(result.map(row => this.mapToDomain(row, user)));
        } catch (error) {
            console.error("Error finding campaigns by user:", error);
            return Result.Err({
                code: CODE_DB_CAMPAIGN_FIND_FAILED,
                message: "Error al buscar campañas por usuario",
                details: error,
            });
        }
    }

    async findById(id: number): AsyncResult<Campaign | null> {
        try { //revisar codigo, no llegue a revisarlo (stefano)
            const result = await db.select().from(campaigns).where(eq(campaigns.id, id));
            const row = result?.[0];
            if (!row) {
                return Result.Err({
                    code: CODE_DB_CAMPAIGN_FIND_FAILED,
                    message: "No se encontró la campaña",
                });
            }
            // You may need to fetch the creator user if required, here assuming creator is not needed
            // If you have a way to get the User by id, you should fetch it here
            // For now, returning null for creator
            return Result.Ok(this.mapToDomain(row, { id: row.creator_id } as User));
        } catch (error) {
            console.error("Error finding campaign by id:", error);
            return Result.Err({
                code: CODE_DB_CAMPAIGN_FIND_FAILED,
                message: "Error al buscar campaña por id",
                details: error,
            });
        }
    }

    async edit(id: number, updates: Partial<EditableCampaignFields>): AsyncResult<Campaign> {
        try {
            const result = await db.update(campaigns).set(updates).where(eq(campaigns.id, id)).returning();

            const updated = result?.[0];
            if (!updated) {
                return Result.Err({
                    code: CODE_DB_CAMPAIGN_EDIT_FAILED,
                    message: "No se pudo actualizar la campaña",
                });
            }

            return Result.Ok(this.mapToDomain(updated, { id: updated.creator_id } as User));
        } catch (error) {
            return Result.Err({
                code: CODE_DB_CAMPAIGN_EDIT_FAILED,
                message: "Error al actualizar la campaña",
                details: error,
            });
        }
    }

    private mapToDomain(row: any, creator: User, statusChanges: any[] = []): Campaign {
        return CampaignDomain.createWithId({
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            goal: row.goal,
            endDate: row.end_date,
            photo: row.photo,
            creator,
            statesChange: statusChanges.map(statusChange => (StateChange.createWithId(
                statusChange.id,
                statusChange.status,
                new Date(statusChange.created_at),
                statusChange.reason
            ))),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }

    toEntity(drizzleEntity: any): Campaign {
        return this.mapToDomain(drizzleEntity, drizzleEntity.creator as User, drizzleEntity.state_changes || []);
    }

    getDefaultOrderBy(): string {
        return "id";
    }

    getRelations() {
        return {
            state_changes: true,
        };
    }
}