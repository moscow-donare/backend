import type { ICampaignRepository } from "$core/campaigns/domain/ports/ICampaignRepository";
import type { Campaign } from "$core/campaigns/domain/campaign";
import type { User } from "$core/users/domain/user";
import { Campaign as CampaignDomain, CampaignStatus } from "$core/campaigns/domain/campaign";
import { db } from "src/infraestructure/drizzle/db";
import { campaigns } from "src/infraestructure/drizzle/schema";
import { eq } from "drizzle-orm";

const CODE_DB_CAMPAIGN_CREATION_FAILED = "DB_ERROR::CAMPAIGN_CREATION_FAILED";
const CODE_DB_CAMPAIGN_NOT_FOUND = "DB_ERROR::CAMPAIGN_NOT_FOUND";
const CODE_DB_CAMPAIGN_FIND_FAILED = "DB_ERROR::CAMPAIGN_FIND_FAILED";

export class CampaignDrizzleRepository implements ICampaignRepository {
    constructor() { }

    async save(campaign: Campaign): AsyncResult<Campaign> {
        try {
            const result = await db.insert(campaigns).values({
                name: campaign.name,
                description: campaign.description,
                category: campaign.category,
                goal: campaign.goal,
                end_date: campaign.endDate,
                url: campaign.url,
                photo: campaign.photo,
                creator_id: campaign.creator.id as number, //TODO: Revisar este codigo
            }).returning();
            const created = result?.[0];

            if (!created) {
                return Result.Err({
                    code: CODE_DB_CAMPAIGN_CREATION_FAILED,
                    message: "No se pudo crear la campaña",
                });
            }

            return Result.Ok(this.mapToDomain(created, campaign.creator));
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
            //TODO: Revisar este codigo
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

    private mapToDomain(row: any, creator: User): Campaign {
        return CampaignDomain.createWithId({
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            goal: row.goal,
            endDate: row.end_date,
            url: row.url,
            photo: row.photo,
            creator,
            status: row.status ?? CampaignStatus.IN_REVIEW,
            createdAt: row.created_at,
        });
    }
}