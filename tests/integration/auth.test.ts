import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { db } from 'src/infraestructure/drizzle/db'
import { users } from 'src/infraestructure/drizzle/schema'
import type { IAuthRepository } from 'src/infraestructure/repositories/web3auth/ports/IAuthRepository'
import HonoService from 'src/infraestructure/hono/service'
import { UserDrizzleRepository } from 'src/infraestructure/repositories/drizzle/UserDrizzleRepository'
import { createTestHonoService } from 'tests/shared/createTestHonoService'
import { clearDatabase } from 'tests/shared/clearDatabaseForTest'
import { CreateMockUser } from 'tests/shared/createMockUser'

export class MockWeb3AuthRepository implements IAuthRepository {
    constructor(private userData: any) { }

    async getUserInfo(token: string) {
        return Result.Ok(this.userData)
    }
}

describe('POST /auth/web3 - usuario no existe, se crea', async () => {
    let honoService: HonoService
    let mockUser: any;
    await beforeEach(async () => {
        mockUser = CreateMockUser.getInstance().create()
        honoService = createTestHonoService({
            web3auth: new MockWeb3AuthRepository(mockUser),
            user: new UserDrizzleRepository(),
        })
    })
    await afterEach(async () => {
        await clearDatabase();
    })
    it('crea el usuario y devuelve 200 con sus datos', async () => {
        const res = await honoService.honoApp.request('/auth/web3', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: 'mock-token' }), // no importa qué valor pongas acá
        })

        expect(res.status).toBe(200)
        const body = await res.json()

        expect(body).toMatchObject({
            success: true,
            message: 'User created successfully',
            data: {
                email: mockUser.email,
                fullName: mockUser.name,
                address: mockUser.address,
            }
        })
    })
})

describe('POST /auth/web3 - usuario ya existe', async () => {
    let honoService: HonoService
    let mockUser: any;

    await beforeEach(async () => {
        mockUser = CreateMockUser.getInstance().create()
        honoService = createTestHonoService({
            web3auth: new MockWeb3AuthRepository(mockUser),
            user: new UserDrizzleRepository(),
        })
        await db.insert(users).values({
            full_name: mockUser.name,
            email: mockUser.email,
            address: mockUser.address,
        })
    })

    await afterEach(async () => {
        await clearDatabase();
    })

    it('devuelve 200 y no crea un nuevo usuario', async () => {
        const res = await honoService.honoApp.request('/auth/web3', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: 'mock-token' }), // no importa qué valor pongas acá
        })

        expect(res.status).toBe(200)
        const body = await res.json()

        expect(body).toMatchObject({
            success: true,
            message: 'User already exists',
            data: {
                email: mockUser.email,
                fullName: mockUser.name,
                address: mockUser.address,
            }
        })
    })
})

describe('POST /auth/web3 - error al crear usuario token invalido para web3auth', async () => {
    let honoService: HonoService
    beforeEach(() => {
        honoService = createTestHonoService({
            web3auth: new MockWeb3AuthRepository({}),
            user: new UserDrizzleRepository(),
        })
        // respuesta de Web3AuthRepository.getUserInfo con un error
        vi.spyOn(MockWeb3AuthRepository.prototype, 'getUserInfo')
            .mockImplementationOnce(() => Promise.resolve(Result.Err({
                code: "InvalidToken",
                message: "The provided token is invalid.",
            }) as any));
    })

    it('devuelve 400 con error de token invalido', async () => {
        const res = await honoService.honoApp.request('/auth/web3', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: 'invalid-token' }), // no importa qué valor pongas acá
        })

        expect(res.status).toBe(400)
        const body = await res.json()

        expect(body).toMatchObject({
            success: false,
            error: {
                code: "InvalidToken",
                message: "The provided token is invalid.",
            }
        })
    })
})