import { Donation } from "$core/donations/domain/donation";
import type { IDonationRepository } from "$core/donations/domain/ports/IDonationRepository";
import { db } from "../../drizzle/db";
import { donations } from "../../drizzle/schema";

export class DonationDrizzleRepository implements IDonationRepository {
    async save(donation: Donation): AsyncResult<Donation> {
        try {
            const [created] = await db.insert(donations).values({
                user_id: donation.userId,
                campaign_id: donation.campaignId,
                amount: donation.amount,
                tx_hash: donation.txHash,
                is_anonymous: donation.isAnonymous,
                created_at: donation.createdAt || new Date(),
            }).returning();

            if (!created) {
                return Result.Err({
                    code: "DONATION_CREATION_FAILED",
                    message: "No se pudo crear la donación",
                });
            }

            return Result.Ok(Donation.createWithId({
                id: created.id,
                userId: created.user_id,
                campaignId: created.campaign_id,
                amount: created.amount,
                txHash: created.tx_hash,
                isAnonymous: created.is_anonymous ?? false,
                createdAt: created.created_at,
            }));
        } catch (error) {
            return Result.Err({
                code: "DB_ERROR",
                message: "Error al guardar la donación",
                details: error instanceof Error ? error.message : String(error),
            });
        }
    }
}
