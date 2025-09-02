import type { ICampaignRepository } from "$core/campaigns/domain/ports/ICampaignRepository";
import type { Campaign } from "src/core/campaigns/domain/campaign";
import { User } from "src/core/users/domain/user";
import { Campaign as CampaignDomain } from "src/core/campaigns/domain/campaign";
import { db } from "src/infraestructure/drizzle/db";
import { campaigns, state_changes, users } from "src/infraestructure/drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleCriteriaRepository } from "$shared/infraestructure/adapters/DrizzleCriteriaRepository";
import { StateChanges } from "$core/campaigns/domain/stateChanges";
import { CampaignStatus } from "$core/campaigns/domain/enums";
import type { UserDB } from "$core/users/domain/types";

const CODE_DB_CAMPAIGN_CREATION_FAILED = "DB_ERROR::CAMPAIGN_CREATION_FAILED";
const CODE_DB_CAMPAIGN_FIND_FAILED = "DB_ERROR::CAMPAIGN_FIND_FAILED";
const CODE_DB_CAMPAIGN_EDIT_FAILED = "DB_ERROR::CAMPAIGN_EDIT_FAILED";

export class CampaignDrizzleRepository extends DrizzleCriteriaRepository<Campaign, 'campaigns'> implements ICampaignRepository {
    constructor() {
        super(campaigns, 'campaigns');
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
                creator_id: campaign.creator.id as number,
                blockchain_id: campaign.blockchainId ?? undefined
            }).returning();
            const created = result?.[0];

            if (!created) {
                return Result.Err({
                    code: CODE_DB_CAMPAIGN_CREATION_FAILED,
                    message: "No se pudo crear la campaña",
                });
            }

            const statusChanges = await Promise.all(campaign.stateChanges.map(async (stateChange) => {
                const result = await db.insert(state_changes).values({
                    campaign_id: created.id,
                    status: stateChange.getState(),
                    reason: stateChange.getReason()
                }).returning();
                return result[0];
            }));

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

    async edit(campaign: Campaign): AsyncResult<Campaign> {
        try {
            if (!campaign.id) {
                return Result.Err({
                    code: CODE_DB_CAMPAIGN_EDIT_FAILED,
                    message: "El id de la campaña es requerido para editar",
                });
            }
            const result = await db.update(campaigns).set({
                name: campaign.name,
                description: campaign.description,
                category: campaign.category,
                goal: campaign.goal,
                end_date: campaign.endDate,
                photo: campaign.photo,
                blockchain_id: campaign.blockchainId ?? null,
                updated_at: new Date()
            }).where(eq(campaigns.id, campaign.id)).returning();

            const stateChanges = campaign.stateChanges;
            const lastStateChange = stateChanges[0]?.getState() ?? null;

            if (lastStateChange && (lastStateChange == CampaignStatus.PENDING_CHANGES || lastStateChange == CampaignStatus.ACTIVE)) {
                const inReviewChangeState = await db.insert(state_changes).values({
                    campaign_id: campaign.id!,
                    status: CampaignStatus.IN_REVIEW,
                    reason: "Edición de campaña"
                }).returning();
                stateChanges.unshift(StateChanges.createWithId(
                    inReviewChangeState[0]!.id,
                    inReviewChangeState[0]!.status,
                    inReviewChangeState[0]!.created_at ? new Date(inReviewChangeState[0]!.created_at) : new Date(),
                    inReviewChangeState[0]!.reason
                ));
            }

            const updated = result?.[0];
            if (!updated) {
                return Result.Err({
                    code: CODE_DB_CAMPAIGN_EDIT_FAILED,
                    message: "No se pudo actualizar la campaña",
                });
            }

            // Fetch the full creator user from the database
            const creatorRow = await db.select().from(users).where(eq(users.id, updated.creator_id)).limit(1);
            if (!creatorRow || creatorRow.length === 0) {
                return Result.Err({
                    code: CODE_DB_CAMPAIGN_EDIT_FAILED,
                    message: "No se pudo encontrar el usuario creador de la campaña",
                });
            }
            const creator = this.mapUserToDomain(creatorRow[0]! as UserDB);
            return Result.Ok(this.mapToDomain(updated, creator, stateChanges));
        } catch (error) {
            return Result.Err({
                code: CODE_DB_CAMPAIGN_EDIT_FAILED,
                message: "Error al actualizar la campaña",
                details: error,
            });
        }
    }

    private mapToDomain(row: any, creator: User, stateChanges: any[] = []): Campaign {
        const mappedStateChanges: StateChanges[] = stateChanges.map((stateChange) => {
            return StateChanges.createWithId(
                stateChange.id,
                stateChange.status,
                new Date(stateChange.created_at ?? stateChange.createdAt ?? new Date()),
                stateChange.reason
            )
        });
        return CampaignDomain.createWithId({
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            goal: row.goal,
            endDate: row.end_date,
            photo: row.photo,
            creator,
            stateChanges: mappedStateChanges,
            blockchainId: row.blockchain_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }

    private mapUserToDomain(user: UserDB
    ): User {
        return User.createWithId({
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            address: user.address,
            createdAt: user.created_at,
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
            state_changes: {
                orderBy: (sc: { created_at: any; }, { desc }: any) => [desc(sc.created_at)],
            },
            creator: {
                ref: "users",
                fk: "creator_id",
            }
        };
    }
}