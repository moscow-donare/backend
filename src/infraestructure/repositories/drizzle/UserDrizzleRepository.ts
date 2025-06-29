import type { IUserRepository } from "src/core/users/domain/ports/IUserRepository";
import type { UserDB } from "src/core/users/domain/types";
import { User } from "src/core/users/domain/user";
import { db } from "src/infraestructure/drizzle/db";
import { users } from "src/infraestructure/drizzle/schema";
import { eq } from "drizzle-orm";

const CODE_DB_USER_CREATION_FAILED = "DB_ERROR::USER_CREATION_FAILED";
const CODE_DB_USER_NOT_FOUND = "DB_ERROR::USER_NOT_FOUND";
const CODE_DB_USER_FIND_FAILED = "DB_ERROR::USER_FIND_FAILED";

export class UserDrizzleRepository implements IUserRepository {
    constructor() { }

    async save(user: User): AsyncResult<User> {
        try {

            const result = await db.insert(users).values({
                full_name: user.fullName,
                email: user.email,
                address: user.address,
            }).returning();
            const created = result?.[0];

            if (!created) {
                return Result.Err({
                    code: CODE_DB_USER_CREATION_FAILED,
                    message: "No se pudo crear el usuario",
                });
            }

            return Result.Ok(this.mapToDomain(created));
        } catch (error) {
            console.error("Error saving user:", error);
            return Result.Err({
                code: CODE_DB_USER_CREATION_FAILED,
                message: "Error al guardar el usuario",
                details: error,
            });

        }
    }

    async findByEmail(email: string): AsyncResult<User> {
        try {
            const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
            const found = result?.[0] ?? null;

            if (!found) {
                return Result.Err({
                    code: CODE_DB_USER_NOT_FOUND,
                    message: "Usuario no encontrado",
                });
            }

            return Result.Ok(this.mapToDomain(found));
        } catch (error) {
            console.error("Error finding user by email:", error);
            return Result.Err({
                code: CODE_DB_USER_FIND_FAILED,
                message: "Error al buscar el usuario por email",
                details: error,
            });
        }
    }

    private mapToDomain(user: UserDB
    ): User {
        return User.createWithId({
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            address: user.address,
            createdAt: user.created_at,
        });
    }
}
