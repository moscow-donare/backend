import type { IUserDataRepository } from "src/core/users/domain/ports/IUserDataRepository";
import type { UserDataDB } from "src/core/users/domain/types";
import { UserData } from "src/core/users/domain/userData";
import { db } from "src/infraestructure/drizzle/db";
import { userData } from "src/infraestructure/drizzle/schema";
import { eq } from "drizzle-orm";

const CODE_DB_USERDATA_SAVE_FAILED = "DB_ERROR::USERDATA_SAVE_FAILED";
const CODE_DB_USERDATA_NOT_FOUND = "DB_ERROR::USERDATA_NOT_FOUND";
const CODE_DB_USERDATA_FIND_FAILED = "DB_ERROR::USERDATA_FIND_FAILED";

export class UserDataDrizzleRepository implements IUserDataRepository {
    constructor() { }

    async save(userDataEntity: UserData): AsyncResult<UserData> {
        try {
            // Si tiene ID, es un update
            if (userDataEntity.id) {
                const result = await db.update(userData)
                    .set({
                        birthday: userDataEntity.birthday,
                        country: userDataEntity.country,
                        state: userDataEntity.state,
                        city: userDataEntity.city,
                        gender: userDataEntity.gender,
                        provider: userDataEntity.provider,
                        updated_at: new Date(),
                    })
                    .where(eq(userData.id, userDataEntity.id))
                    .returning();

                const updated = result?.[0];

                if (!updated) {
                    return Result.Err({
                        code: CODE_DB_USERDATA_SAVE_FAILED,
                        message: "No se pudo actualizar los datos del usuario",
                    });
                }

                return Result.Ok(this.mapToDomain(updated));
            }

            // Si no tiene ID, es un create
            const result = await db.insert(userData).values({
                user_id: userDataEntity.userId,
                birthday: userDataEntity.birthday,
                country: userDataEntity.country,
                state: userDataEntity.state,
                city: userDataEntity.city,
                gender: userDataEntity.gender,
                provider: userDataEntity.provider,
            }).returning();
            const created = result?.[0];

            if (!created) {
                return Result.Err({
                    code: CODE_DB_USERDATA_SAVE_FAILED,
                    message: "No se pudo crear los datos del usuario",
                });
            }

            return Result.Ok(this.mapToDomain(created));
        } catch (error) {
            console.error("Error saving user data:", error);
            return Result.Err({
                code: CODE_DB_USERDATA_SAVE_FAILED,
                message: "Error al guardar los datos del usuario",
                details: error,
            });
        }
    }

    async findByUserId(userId: number): AsyncResult<UserData> {
        try {
            const result = await db.select().from(userData).where(eq(userData.user_id, userId)).limit(1);
            const found = result?.[0] ?? null;

            if (!found) {
                return Result.Err({
                    code: CODE_DB_USERDATA_NOT_FOUND,
                    message: "Datos del usuario no encontrados",
                });
            }

            return Result.Ok(this.mapToDomain(found));
        } catch (error) {
            console.error("Error finding user data by userId:", error);
            return Result.Err({
                code: CODE_DB_USERDATA_FIND_FAILED,
                message: "Error al buscar los datos del usuario",
                details: error,
            });
        }
    }

    private mapToDomain(userDataDB: UserDataDB): UserData {
        return UserData.createWithId({
            id: userDataDB.id,
            userId: userDataDB.user_id,
            birthday: userDataDB.birthday,
            country: userDataDB.country,
            state: userDataDB.state,
            city: userDataDB.city,
            gender: userDataDB.gender,
            provider: userDataDB.provider,
            createdAt: userDataDB.created_at ?? new Date(),
            updatedAt: userDataDB.updated_at ?? new Date(),
        });
    }
}
