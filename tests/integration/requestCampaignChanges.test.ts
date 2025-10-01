import type { UserDB } from "$core/users/domain/types";
import type HonoService from "src/infraestructure/hono/service";
import { createTestHonoService } from "tests/shared/createTestHonoService";
import { beforeEach, describe, expect, it } from "vitest";
import { MockWeb3AuthRepository } from "./auth.test";
import { UserDrizzleRepository } from "src/infraestructure/repositories/drizzle/UserDrizzleRepository";
import { CampaignDrizzleRepository } from "src/infraestructure/repositories/drizzle/CampaignDrizzleRepository";
import { campaigns, state_changes, users } from "src/infraestructure/drizzle/schema";
import { db } from "src/infraestructure/drizzle/db";

describe('PATCH /campaigns/request-changes - solicitar cambios en campaña', async () => {
    let honoService: HonoService;
    const mockUser = {
        id: 1,
        name: "Mock User",
        email: "testuser@donare.com",
        address: "0xabc123abc123abc123abc123abc123abc123abc1"
    };
    let mockUsers: UserDB[] = [];
    beforeEach(async () => {
        honoService = createTestHonoService({
            web3auth: new MockWeb3AuthRepository(mockUser),
            user: new UserDrizzleRepository(),
            campaign: new CampaignDrizzleRepository(),
        });

        // Limpiar DB
        await db.delete(state_changes).execute();
        await db.delete(campaigns).execute();
        await db.delete(users).execute();

        mockUsers = await db.insert(users).values([
            { full_name: mockUser.name, email: mockUser.email, address: mockUser.address },
        ]).returning().execute();
    });

    it('devuelve 200 y solicita cambios correctamente en campaña en revisión', async () => {
        const campaignId = 1;
        await db.insert(campaigns).values({
            id: campaignId,
            name: "Campaña en revisión",
            description: "Descripción de la campaña en revisión",
            category: 1,
            goal: 5000,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photoCID",
            creator_id: mockUsers[0]!.id,
        });
        await db.insert(state_changes).values({
            campaign_id: campaignId,
            reason: "Creación de campaña",
            state: 0, // IN_REVIEW
            created_at: new Date(),
        });
        const response = await honoService.honoApp.request(`/campaigns/request-changes`, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({
                id: campaignId,
                reason: "Por favor, actualiza la descripción y la foto."
            }),
        });

        expect(response.status).toBe(200);
        let responseBody: any = await response.json();
        responseBody = responseBody.data;
        expect(responseBody).toHaveProperty("id", campaignId);
        expect(responseBody).toHaveProperty("name", "Campaña en revisión");
        expect(responseBody).toHaveProperty("stateChanges");
        const latestStateChange = responseBody.stateChanges[responseBody.stateChanges.length - 1];
        expect(latestStateChange).toHaveProperty("state", 1);
    });

    it('devuelve 400 al intentar solicitar cambios en campaña que no está en revisión', async () => {
        const campaignId = 1;
        await db.insert(campaigns).values({
            id: campaignId,
            name: "Campaña Activa",
            description: "Descripción de la campaña activa",
            category: 1,
            goal: 5000,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photoCID",
            creator_id: mockUsers[0]!.id,
        });
        await db.insert(state_changes).values({
            campaign_id: campaignId,
            reason: "Creación de campaña",
            state: 2, // ACTIVE
            created_at: new Date(),
        });
        const response = await honoService.honoApp.request(`/campaigns/request-changes`, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({
                id: campaignId,
                reason: "Por favor, actualiza la descripción y la foto."
            }),
        });
        expect(response.status).toBe(400);
        const responseBody: any = await response.json();
        expect(responseBody).toHaveProperty("error");
        expect(responseBody.error).toHaveProperty("code", "INVALID_CAMPAIGN_STATUS");
        expect(responseBody.error).toHaveProperty("details", "Only campaigns in In Review status can have changes requested");
    });
});