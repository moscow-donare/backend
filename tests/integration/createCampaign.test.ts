import type HonoService from "src/infraestructure/hono/service";
import { createTestHonoService } from "tests/shared/createTestHonoService";
import { beforeEach, describe, expect, it } from "vitest";
import { MockWeb3AuthRepository } from "./auth.test";
import { UserDrizzleRepository } from "src/infraestructure/repositories/drizzle/UserDrizzleRepository";
import { CampaignDrizzleRepository } from "src/infraestructure/repositories/drizzle/CampaignDrizzleRepository";
import { db } from "src/infraestructure/drizzle/db";
import { campaigns, users } from "src/infraestructure/drizzle/schema";
import { eq } from "drizzle-orm";

let honoService: HonoService;

const testUser = {
    id: 999,
    full_name: "Tester",
    email: "test-campaign@donare.com",
    address: "0xmockaddress999"
}

const testCampaign = {
    name: "Campaña Test",
    description: "Descripción test",
    category: 0,
    goal: 1000,
    endDate: new Date(Date.now() + 86400000).toISOString(),
    url: "https://donare.test/campaign",
    photo: "ipfs://photoCID"
}

beforeEach(async () => {
    honoService = createTestHonoService({
        web3auth: new MockWeb3AuthRepository(),
        user: new UserDrizzleRepository(),
        campaign: new CampaignDrizzleRepository(),
    });

    await db.insert(users).values({
        id: testUser.id,
        full_name: testUser.full_name,
        email: testUser.email,
        address: testUser.address,
    })
});



describe('POST /campaigns - creación de campaña válida', () => {
    it('devuelve 200 y crea campaña correctamente', async () => {
        const res = await honoService.honoApp.request('/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
                url: testCampaign.url,
                photo: testCampaign.photo,
                status: 0 // IN_REVIEW
            }
        })

        const created = await db.query.campaigns.findFirst({
            where: eq(campaigns.name, testCampaign.name)
        })

        expect(created).toBeTruthy()
        expect(created?.creator_id).toBe(testUser.id)
    })
})

describe('POST /campaigns - campaña en revisión ya existente', () => {
    beforeEach(async () => {
        await db.insert(campaigns).values({
            name: "Campaña en revisión",
            description: "Test existente",
            category: 1,
            goal: 500,
            end_date: new Date(),
            url: "https://donare.test/existing",
            photo: "ipfs://photo",
            creator_id: testUser.id,
            status: 0 // IN_REVIEW
        })
    })

    it('devuelve 400 con error USER_CAMPAIGN_IN_REVIEW', async () => {
        const res = await honoService.honoApp.request('/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

describe('POST /campaigns - campaña activa ya existente', () => {
    beforeEach(async () => {
        await db.insert(campaigns).values({
            name: "Campaña activa",
            description: "Test activo",
            category: 1,
            goal: 500,
            end_date: new Date(),
            url: "https://donare.test/activa",
            photo: "ipfs://photo",
            creator_id: testUser.id,
            status: 2 // ACTIVE
        })
    })

    it('devuelve 400 con error USER_ACTIVE_CAMPAIGN_EXISTS', async () => {
        const res = await honoService.honoApp.request('/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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


