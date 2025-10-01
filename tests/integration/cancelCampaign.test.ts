import { createTestHonoService } from "tests/shared/createTestHonoService";
import { beforeEach, describe, expect, it } from "vitest";
import { MockWeb3AuthRepository } from "./auth.test";
import type HonoService from "src/infraestructure/hono/service";
import { UserDrizzleRepository } from "src/infraestructure/repositories/drizzle/UserDrizzleRepository";
import { CampaignDrizzleRepository } from "src/infraestructure/repositories/drizzle/CampaignDrizzleRepository";
import { campaigns, state_changes, users } from "src/infraestructure/drizzle/schema";
import { db } from "src/infraestructure/drizzle/db";
import type { UserDB } from "$core/users/domain/types";

describe('PATCH /campaigns/cancel - cancelar campaña', async () => {
    let honoService: HonoService;
    const mockUser = {
        id: 1,
        name: "Mock User",
        email: "testuser@donare.com",
        address: "0xabc123abc123abc123abc123abc123abc123abc1"
    };
    const otherUser = {
        id: 2,
        name: "Other User",
        email: "otheruser@donare.com",
        address: "0xdef456def456def456def456def456def456def4"
    };
    let mockUsers: UserDB[] = [];
    await beforeEach(async () => {
        honoService = createTestHonoService({
            web3auth: new MockWeb3AuthRepository(mockUser),
            user: new UserDrizzleRepository(),
            campaign: new CampaignDrizzleRepository(),
        });

        // Limpiar DB
        await db.delete(state_changes).execute();
        await db.delete(campaigns).execute();
        await db.delete(users).execute();
        console.log("DB cleaned----------------___>");
        mockUsers = await db.insert(users).values([
            { full_name: mockUser.name, email: mockUser.email, address: mockUser.address },
            { full_name: otherUser.name, email: otherUser.email, address: otherUser.address }
        ]).returning().execute();
    });

    it('devuelve 200 y cancela campaña correctamente desde el admin o creador', async () => {
        const campaignId = 1;
        await db.insert(campaigns).values({
            id: campaignId,
            name: "Campaña a cancelar",
            description: "Descripción de la campaña a cancelar",
            category: 1,
            goal: 5000,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photoCID",
            creator_id: mockUsers[0]!.id,
        });
        await db.insert(state_changes).values({
            campaign_id: campaignId,
            reason: "Creación de campaña",
            state: 0,
            created_at: new Date(),
        });

        const res = await honoService.honoApp.request('/campaigns/cancel', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({ id: campaignId, reason: "Razón de cancelación" })
        });

        expect(res.status).toBe(200);
    });

    it('devuelve error CAMPAIGN_NOT_FOUND si la campaña no existe', async () => {
        const res = await honoService.honoApp.request('/campaigns/cancel', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({ id: 999, reason: "Razón de cancelación" })
        });
        expect(res.status).toBe(400);
    });

    it('devuelve error UNAUTHORIZED si un usuario no creador ni admin intenta cancelar', async () => {
        const campaignId = 2;
        await db.insert(campaigns).values({
            id: campaignId,
            name: "Campaña de otro",
            description: "Descripción",
            category: 1,
            goal: 1000,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photoCID",
            creator_id: mockUsers[1]!.id,
        });

        const res = await honoService.honoApp.request('/campaigns/cancel', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({ id: campaignId, reason: "Razón de cancelación" })
        });

        expect(res.status).toBe(400);
    });

    it('devuelve error CAMPAIGN_ALREADY_CANCELED si la campaña ya fue cancelada', async () => {
        const campaignId = 3;
        await db.insert(campaigns).values({
            id: campaignId,
            name: "Campaña cancelada",
            description: "Descripción",
            category: 1,
            goal: 2000,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photoCID",
            creator_id: mockUsers[0]!.id
        });
        await db.insert(state_changes).values({
            campaign_id: campaignId,
            reason: "Creación de campaña",
            state: 3,
            created_at: new Date(),
        })

        const res = await honoService.honoApp.request('/campaigns/cancel', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({ id: campaignId, reason: "Razón de cancelación" })
        });

        expect(res.status).toBe(400);
    });

    it('devuelve error INVALID_CAMPAIGN_STATUS si la campaña no está en revisión o activa', async () => {
        const campaignId = 4;
        await db.insert(campaigns).values({
            id: campaignId,
            name: "Campaña inválida",
            description: "Descripción",
            category: 1,
            goal: 3000,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photoCID",
            creator_id: mockUsers[0]!.id,
        });
        await db.insert(state_changes).values({
            campaign_id: campaignId,
            reason: "Creación de campaña",
            state: 4,
            created_at: new Date(),
        });

        const res = await honoService.honoApp.request('/campaigns/cancel', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify({ id: campaignId, reason: "Razón de cancelación" })
        });

        expect(res.status).toBe(400);
    });

});
