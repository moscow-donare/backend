import type { UserDB } from "$core/users/domain/types";
import type HonoService from "src/infraestructure/hono/service";
import { createTestHonoService } from "tests/shared/createTestHonoService";
import { beforeEach, describe, expect, it } from "vitest";
import { MockWeb3AuthRepository } from "./auth.test";
import { UserDrizzleRepository } from "src/infraestructure/repositories/drizzle/UserDrizzleRepository";
import { CampaignDrizzleRepository } from "src/infraestructure/repositories/drizzle/CampaignDrizzleRepository";
import { campaigns, state_changes, users } from "src/infraestructure/drizzle/schema";
import { db } from "src/infraestructure/drizzle/db";

describe('PATCH /backoffice/campaigns/approve - aprobar campaña', async () => {
    let honoService: HonoService;
    const mockAdminUser = {
        id: 1,
        name: "Admin User",
        email: "admin@donare.com",
        address: "0xabc123abc123abc123abc123abc123abc123abc1"
    };
    const mockRegularUser = {
        id: 2,
        name: "Regular User",
        email: "user@donare.com",
        address: "0xdef456def456def456def456def456def456def4"
    };
    let mockUsers: UserDB[] = [];

    await beforeEach(async () => {
        honoService = createTestHonoService({
            web3auth: new MockWeb3AuthRepository(mockAdminUser),
            user: new UserDrizzleRepository(),
            campaign: new CampaignDrizzleRepository(),
        });

        // Limpiar DB
        await db.delete(state_changes).execute();
        await db.delete(campaigns).execute();
        await db.delete(users).execute();

        mockUsers = await db.insert(users).values([
            { full_name: mockAdminUser.name, email: mockAdminUser.email, address: mockAdminUser.address },
            { full_name: mockRegularUser.name, email: mockRegularUser.email, address: mockRegularUser.address }
        ]).returning().execute();
    });

    it('devuelve 200 y aprueba campaña correctamente con admin', async () => {
        const campaignId = 1;
        const contractAddress = "0x1234567890abcdef1234567890abcdef12345678";

        await db.insert(campaigns).values({
            id: campaignId,
            name: "Campaña en revisión",
            description: "Descripción de la campaña en revisión",
            category: 1,
            goal: 5000,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photoCID",
            creator_id: mockUsers[1]!.id, // Usuario regular como creador
        });
        await db.insert(state_changes).values({
            campaign_id: campaignId,
            reason: "Creación de campaña",
            state: 0, // IN_REVIEW
            created_at: new Date(),
        });

        const response = await honoService.honoApp.request('/backoffice/campaigns/approve', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({
                id: campaignId,
                contractAddress: contractAddress
            })
        });

        expect(response.status).toBe(200);
        const responseBody: any = await response.json();
        expect(responseBody).toHaveProperty("success", true);
        expect(responseBody.data).toHaveProperty("id", campaignId);
        expect(responseBody.data).toHaveProperty("contractAddress", contractAddress);
        expect(responseBody.data).toHaveProperty("stateChanges");

        const latestStateChange = responseBody.data.stateChanges[responseBody.data.stateChanges.length - 1];
        expect(latestStateChange).toHaveProperty("state", 2); // ACTIVE
    });

    it('devuelve error CAMPAIGN_NOT_FOUND si la campaña no existe', async () => {
        const response = await honoService.honoApp.request('/backoffice/campaigns/approve', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({
                id: 999,
                contractAddress: "0x1234567890abcdef1234567890abcdef12345678"
            })
        });

        expect(response.status).toBe(400);
        const responseBody: any = await response.json();
        expect(responseBody).toHaveProperty("error");
        expect(responseBody.error).toHaveProperty("code", "CAMPAIGN_NOT_FOUND");
    });

    it('devuelve error CAMPAIGN_ALREADY_APPROVED si la campaña ya está aprobada', async () => {
        const campaignId = 2;

        await db.insert(campaigns).values({
            id: campaignId,
            name: "Campaña ya aprobada",
            description: "Descripción de campaña aprobada",
            category: 1,
            goal: 3000,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photoCID",
            creator_id: mockUsers[1]!.id,
            contract_address: "0x1111111111111111111111111111111111111111"
        });
        await db.insert(state_changes).values({
            campaign_id: campaignId,
            reason: "Campaign approved",
            state: 2, // ACTIVE
            created_at: new Date(),
        });

        const response = await honoService.honoApp.request('/backoffice/campaigns/approve', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({
                id: campaignId,
                contractAddress: "0x2222222222222222222222222222222222222222"
            })
        });

        expect(response.status).toBe(400);
        const responseBody: any = await response.json();
        expect(responseBody).toHaveProperty("error");
        expect(responseBody.error).toHaveProperty("code", "CAMPAIGN_ALREADY_APPROVED");
    });

    it('devuelve error INVALID_CAMPAIGN_STATUS si la campaña no está en revisión', async () => {
        const campaignId = 4;

        await db.insert(campaigns).values({
            id: campaignId,
            name: "Campaña cancelada",
            description: "Descripción",
            category: 1,
            goal: 1500,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photoCID",
            creator_id: mockUsers[1]!.id,
        });
        await db.insert(state_changes).values({
            campaign_id: campaignId,
            reason: "Campaign canceled",
            state: 3, // CANCELED
            created_at: new Date(),
        });

        const response = await honoService.honoApp.request('/backoffice/campaigns/approve', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({
                id: campaignId,
                contractAddress: "0x4444444444444444444444444444444444444444"
            })
        });

        expect(response.status).toBe(400);
        const responseBody: any = await response.json();
        expect(responseBody).toHaveProperty("error");
        expect(responseBody.error).toHaveProperty("code", "INVALID_CAMPAIGN_STATUS");
    });
});