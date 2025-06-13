import { User } from "../domain/user";
import { db } from "../../../infraestructure/drizzle/db";
import { users } from "../../../infraestructure/drizzle/schema";

type CreateUserInput = {
    fullName: string;
    email: string;
    address: string;
};

export async function createUser(input: CreateUserInput) {
    try {
        const user = User.create(input);

        const result = await db
            .insert(users)
            .values({
                full_name: user.fullName,
                email: user.email,
                address: user.address,
            })
            .returning();

        const created = result?.[0];

        if (!created) {
            return Result.Err({
                code: "USER_CREATION_FAILED",
                message: "No se pudo crear el usuario",
            });
        }

        return Result.Ok({
            id: created.id,
            fullName: created.full_name,
            email: created.email,
            address: created.address,
            createdAt: created.created_at,
        });
    } catch (error) {
        return Result.Err({
            code: "UNEXPECTED_ERROR",
            message: error instanceof Error ? error.message : "Error inesperado",
            details: error,
        });
    }
}