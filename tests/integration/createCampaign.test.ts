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

const testCampaign = {
    name: "Campaña Test",
    description: "Descripción test",
    category: 2,
    goal: 1000,
    endDate: new Date(Date.now() + 86400000).toISOString(),
    photo: "ipfs://photoCID"
}

describe('POST /campaigns - creación de campaña válida', async () => {
    let honoService: HonoService;
    let mockUser;
    await beforeEach(async () => {
        await clearDatabase();
        mockUser = CreateMockUser.getInstance().create()
        honoService = createTestHonoService({
            web3auth: new MockWeb3AuthRepository(mockUser),
            user: new UserDrizzleRepository(),
            campaign: new CampaignDrizzleRepository(),
        });
        await db.insert(users).values({
            full_name: mockUser.name,
            email: mockUser.email,
            address: mockUser.address,
        })
    });

    await afterEach(async () => {
        await clearDatabase();
    });

    it('devuelve 200 y crea campaña correctamente', async () => {
        const res = await honoService.honoApp.request('/campaigns/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify(testCampaign)
        })

        expect(res.status).toBe(200)
        const body = await res.json()

        expect(body).toMatchObject({
            success: true,
            message: 'Campaign created successfully',
            data: {
                name: testCampaign.name,
                description: testCampaign.description,
                category: testCampaign.category,
                goal: testCampaign.goal,
                photo: testCampaign.photo,
                status: 0 // IN_REVIEW
            }
        })

        const created = await db.query.campaigns.findFirst({
            where: eq(campaigns.name, testCampaign.name)
        })

        expect(created).toBeTruthy()
    })
})

describe('POST /campaigns - campaña en revisión ya existente', async () => {
    let mockUser;
    let honoService: HonoService;
    await beforeEach(async () => {
        mockUser = CreateMockUser.getInstance().create()
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

        await db.insert(campaigns).values({
            name: "Campaña en revisión",
            description: "Test existente",
            category: 1,
            goal: 500,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photo",
            creator_id: userSaved!.id,
            status: 0
        })
    })

    await afterEach(async () => {
        await clearDatabase();
    })

    it('devuelve 400 con error USER_CAMPAIGN_IN_REVIEW', async () => {
        const res = await honoService.honoApp.request('/campaigns/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify(testCampaign)
        })

        expect(res.status).toBe(400)
        const body = await res.json()

        expect(body).toMatchObject({
            success: false,
            error: {
                code: "USER_CAMPAIGN_IN_REVIEW",
                message: "El usuario ya tiene una campaña en revisión"
            }
        })
    })
})

describe('POST /campaigns - campaña activa ya existente', async () => {
    let mockUser;
    let honoService: HonoService;
    await beforeEach(async () => {
        mockUser = CreateMockUser.getInstance().create()
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

        await db.insert(campaigns).values({
            name: "Campaña activa",
            description: "Test activo",
            category: 1,
            goal: 500,
            end_date: new Date(Date.now() + 86400000),
            photo: "ipfs://photo",
            creator_id: userSaved!.id,
            status: 2 // ACTIVE
        })
    })

    await afterEach(async () => {
        await clearDatabase();
    })

    it('devuelve 400 con error USER_ACTIVE_CAMPAIGN_EXISTS', async () => {
        const res = await honoService.honoApp.request('/campaigns/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
            body: JSON.stringify(testCampaign)
        })

        expect(res.status).toBe(400)
        const body = await res.json()

        expect(body).toMatchObject({
            success: false,
            error: {
                code: "USER_ACTIVE_CAMPAIGN_EXISTS",
                message: "El usuario ya tiene una campaña activa"
            }
        })
    })
})
