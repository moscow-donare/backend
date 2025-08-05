import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from 'src/infraestructure/drizzle/db'
import { users } from 'src/infraestructure/drizzle/schema'
import { eq } from 'drizzle-orm'
import type { IAuthRepository } from 'src/infraestructure/repositories/web3auth/ports/IAuthRepository'
import HonoService from 'src/infraestructure/hono/service'
import { UserDrizzleRepository } from 'src/infraestructure/repositories/drizzle/UserDrizzleRepository'
import { createTestHonoService } from 'tests/shared/createTestHonoService'

const mockUser = {
    userId: 'testuser@donare.com',
    email: 'testuser@donare.com',
    name: 'Test User',
    address: '0xabc123abc123abc123abc123abc123abc123abc1',
}

export class MockWeb3AuthRepository implements IAuthRepository {
    async getUserInfo(token: string) {
        console.log("✅ Mock ejecutado con token:", token)
        return Result.Ok(mockUser)
    }
}

let honoService: HonoService

beforeEach(() => {
    // 👇 creás la app con dependencias mockeadas
    honoService = createTestHonoService({
        web3auth: new MockWeb3AuthRepository(),
        user: new UserDrizzleRepository(),
    })
})


describe('POST /auth/web3 - usuario no existe, se crea', () => {
    beforeEach(async () => {
        // 🔄 Limpia usuarios
        await db.delete(users).where(eq(users.email, mockUser.email))
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

        // ✅ Verificamos que se haya persistido
        const createdUser = await db.query.users.findFirst({
            where: eq(users.email, mockUser.email)
        })
        expect(createdUser).toBeTruthy()
    })
})

describe('POST /auth/web3 - usuario ya existe', () => {
    beforeEach(async () => {
        // 🔄 Limpia usuarios
        await db.delete(users).where(eq(users.email, mockUser.email))

        // 👇 crea el usuario
        await db.insert(users).values({
            full_name: mockUser.name,
            email: mockUser.email,
            address: mockUser.address,
        })
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

        // ✅ Verificamos que no se haya creado un nuevo usuario
        const usersCount = (await db.query.users.findMany()).length
        console.log("Cantidad de usuarios:", usersCount)
        expect(usersCount).toBe(1)
    })
})

describe('POST /auth/web3 - error al crear usuario token invalido para web3auth', () => {
    beforeEach(async () => {
        // 🔄 Limpia usuarios
        await db.delete(users).where(eq(users.email, mockUser.email))
        // respuesta de Web3AuthRepository.getUserInfo con un error
        vi.spyOn(MockWeb3AuthRepository.prototype, 'getUserInfo').mockResolvedValue(Result.Err({
            code: "InvalidToken",
            message: "The provided token is invalid.",
        }) as any)

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