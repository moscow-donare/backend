import type HonoService from "src/infraestructure/hono/service";
import { createTestHonoService } from "tests/shared/createTestHonoService";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MockWeb3AuthRepository } from "./auth.test.ts";
import { UserDrizzleRepository } from "src/infraestructure/repositories/drizzle/UserDrizzleRepository";
import { CampaignDrizzleRepository } from "src/infraestructure/repositories/drizzle/CampaignDrizzleRepository";
import { db } from "src/infraestructure/drizzle/db";
import { campaigns, users } from "src/infraestructure/drizzle/schema";
import { eq } from "drizzle-orm";
import { clearDatabase } from "tests/shared/clearDatabaseForTest";
import { CreateMockUser } from "tests/shared/createMockUser";

const baseCampaign = {
    name: "Campaña Base",
    description: "Descripción base",
    category: 1,
    goal: 500,
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    photo: "ipfs://photoBase",
    blockchain_id: null,
};

// Nota: de acuerdo a tus tests previos, los estados parecen:
// 0 = IN_REVIEW, 2 = ACTIVE. Para “no editable” usamos 3 (p.ej. CLOSED/FINISHED/REJECTED).
const STATUS_IN_REVIEW = 0;
const STATUS_ACTIVE = 2;
const STATUS_NOT_EDITABLE = 3;

describe("PATCH /campaigns/edit/:id - edición de campaña", async () => {
    let honoService: HonoService;

    await afterEach(async () => {
        await clearDatabase();
    });

    describe("happy path - IN_REVIEW", async () => {
        let mockUser: any;
        let campaignId: number;

        await beforeEach(async () => {
            await clearDatabase();
            mockUser = CreateMockUser.getInstance().create();

            honoService = createTestHonoService({
                web3auth: new MockWeb3AuthRepository(mockUser),
                user: new UserDrizzleRepository(),
                campaign: new CampaignDrizzleRepository(),
            });

            const [userSaved] = await db
                .insert(users)
                .values({
                    full_name: mockUser.name,
                    email: mockUser.email,
                    address: mockUser.address,
                })
                .returning();

            const [created] = await db
                .insert(campaigns)
                .values({
                    ...baseCampaign,
                    creator_id: userSaved!.id,
                })
                .returning();

            campaignId = created!.id!;
        });

        it("devuelve 200 y actualiza los campos enviados", async () => {
            const payload = {
                name: "Campaña Editada",
                description: "Descripción editada",
                category: 2,
                goal: 1000,
                endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                photo: "ipfs://photoEdit",
            };

            const res = await honoService.honoApp.request(`/campaigns/edit/${campaignId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer mock-token",
                },
                body: JSON.stringify(payload),
            });

            expect(res.status).toBe(200);
            const body = await res.json();

            expect(body).toMatchObject({
                success: true,
                message: "Campaign edited successfully",
                data: {
                    id: campaignId,
                    name: payload.name,
                    description: payload.description,
                    category: payload.category,
                    goal: payload.goal,
                    photo: payload.photo,
                },
            });

            const updated = await db.query.campaigns.findFirst({
                where: eq(campaigns.id, campaignId),
            });

            expect(updated).toBeTruthy();
            expect(updated!.name).toBe(payload.name);
            expect(updated!.description).toBe(payload.description);
            expect(updated!.category).toBe(payload.category);
            expect(updated!.goal).toBe(payload.goal);
            expect(updated!.photo).toBe(payload.photo);
            // end_date quedó seteada por z.coerce.date()
            expect(new Date(updated!.end_date).getTime()).toBe(
                new Date(payload.endDate).getTime()
            );
        });

        it("edición parcial: solo cambia lo enviado y conserva el resto", async () => {
            const partial = {
                description: "Solo cambié la descripción",
            };

            const before = await db.query.campaigns.findFirst({
                where: eq(campaigns.id, campaignId),
            });
            expect(before).toBeTruthy();

            const res = await honoService.honoApp.request(`/campaigns/edit/${campaignId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer mock-token",
                },
                body: JSON.stringify(partial),
            });

            expect(res.status).toBe(200);
            const body = (await res.json()) as {
                success: boolean;
                data?: any;
                error?: { code: string; message: string };
            };
            expect(body.success).toBe(true);
            expect(body.data.description).toBe(partial.description);
            // Los no enviados deben mantenerse:
            expect(body.data.name).toBe(before!.name);
            expect(body.data.category).toBe(before!.category);
            expect(body.data.goal).toBe(before!.goal);
            expect(body.data.photo).toBe(before!.photo);

            const after = await db.query.campaigns.findFirst({
                where: eq(campaigns.id, campaignId),
            });
            expect(after!.description).toBe(partial.description);
            expect(after!.name).toBe(before!.name);
            expect(after!.category).toBe(before!.category);
            expect(after!.goal).toBe(before!.goal);
            expect(after!.photo).toBe(before!.photo);
        });
    });

    describe("happy path - ACTIVE", async () => {
        let mockUser: any;
        let campaignId: number;

        await beforeEach(async () => {
            await clearDatabase();
            mockUser = CreateMockUser.getInstance().create();

            honoService = createTestHonoService({
                web3auth: new MockWeb3AuthRepository(mockUser),
                user: new UserDrizzleRepository(),
                campaign: new CampaignDrizzleRepository(),
            });

            const [userSaved] = await db
                .insert(users)
                .values({
                    full_name: mockUser.name,
                    email: mockUser.email,
                    address: mockUser.address,
                })
                .returning();

            const [created] = await db
                .insert(campaigns)
                .values({
                    ...baseCampaign,
                    creator_id: userSaved!.id,
                })
                .returning();

            campaignId = created!.id!;
        });

        it("permite editar cuando la campaña está ACTIVE", async () => {
            const payload = {
                goal: 2000,
            };

            const res = await honoService.honoApp.request(`/campaigns/edit/${campaignId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer mock-token",
                },
                body: JSON.stringify(payload),
            });

            expect(res.status).toBe(200);
            const body = (await res.json()) as {
                success: boolean;
                data?: any;
                error?: { code: string; message: string };
            };
            expect(body.success).toBe(true);
            expect(body.data.goal).toBe(2000);

            const updated = await db.query.campaigns.findFirst({
                where: eq(campaigns.id, campaignId),
            });
            expect(updated!.goal).toBe(2000);
        });
    });

    describe("errores", async () => {
        it("CAMPAIGN_NOT_FOUND cuando la campaña no existe", async () => {
            const mockUser = CreateMockUser.getInstance().create();

            const honoService = createTestHonoService({
                web3auth: new MockWeb3AuthRepository(mockUser),
                user: new UserDrizzleRepository(),
                campaign: new CampaignDrizzleRepository(),
            });

            // No seed de campaña
            const res = await honoService.honoApp.request(`/campaigns/edit/999999`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer mock-token",
                },
                body: JSON.stringify({ name: "X" }),
            });

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toMatchObject({
                success: false,
                error: {
                    code: "CAMPAIGN_NOT_FOUND",
                    message: "La campaña no fue encontrada",
                },
            });
        });

        it("CAMPAIGN_CREATOR_MISMATCH cuando el usuario no es el creador", async () => {
            await clearDatabase();

            // usuario A (dueño real)
            const owner = CreateMockUser.getInstance().create();
            const serviceForOwner = createTestHonoService({
                web3auth: new MockWeb3AuthRepository(owner),
                user: new UserDrizzleRepository(),
                campaign: new CampaignDrizzleRepository(),
            });

            const [userSaved] = await db
                .insert(users)
                .values({
                    full_name: owner.name,
                    email: owner.email,
                    address: owner.address,
                })
                .returning();

            const [created] = await db
                .insert(campaigns)
                .values({
                    ...baseCampaign,
                    creator_id: userSaved!.id,
                })
                .returning();

            // usuario B (intentará editar)
            const other = CreateMockUser.getInstance().create();
            const serviceForOther = createTestHonoService({
                web3auth: new MockWeb3AuthRepository(other),
                user: new UserDrizzleRepository(),
                campaign: new CampaignDrizzleRepository(),
            });

            const res = await serviceForOther.honoApp.request(
                `/campaigns/edit/${created!.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer mock-token",
                    },
                    body: JSON.stringify({ name: "Nombre Ilegítimo" }),
                }
            );

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toMatchObject({
                success: false,
                error: {
                    code: "CAMPAIGN_CREATOR_MISMATCH",
                    message: "El usuario no es el creador de la campaña",
                },
            });

            // sigue intacta
            const unchanged = await db.query.campaigns.findFirst({
                where: eq(campaigns.id, created!.id!),
            });
            expect(unchanged!.name).toBe(baseCampaign.name);
        });

        it("CAMPAIGN_CANNOT_BE_EDITED cuando el estado no es IN_REVIEW ni ACTIVE", async () => {
            await clearDatabase();

            const mockUser = CreateMockUser.getInstance().create();
            const honoService = createTestHonoService({
                web3auth: new MockWeb3AuthRepository(mockUser),
                user: new UserDrizzleRepository(),
                campaign: new CampaignDrizzleRepository(),
            });

            const [userSaved] = await db
                .insert(users)
                .values({
                    full_name: mockUser.name,
                    email: mockUser.email,
                    address: mockUser.address,
                })
                .returning();

            const [created] = await db
                .insert(campaigns)
                .values({
                    ...baseCampaign,
                    creator_id: userSaved!.id,
                })
                .returning();

            const res = await honoService.honoApp.request(
                `/campaigns/edit/${created!.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer mock-token",
                    },
                    body: JSON.stringify({ name: "Intento inválido" }),
                }
            );

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body).toMatchObject({
                success: false,
                error: {
                    code: "CAMPAIGN_CANNOT_BE_EDITED",
                    message:
                        "La campaña solo puede ser editada si está pendiente a cambios o aceptada",
                },
            });

            const still = await db.query.campaigns.findFirst({
                where: eq(campaigns.id, created!.id!),
            });
            expect(still!.name).toBe(baseCampaign.name);
        });
    });
});
