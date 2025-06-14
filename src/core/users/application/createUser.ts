import { User } from "../domain/user";
import type { ContainerUserRepository } from "../domain/ports/IUserRepository";

export type CreateUserInput = {
    fullName: string;
    email: string;
    address: string;
};

export async function createUser(input: CreateUserInput, repositories: ContainerUserRepository): AsyncResult<User> {

    const user = User.create(input);

    const existingUserResult = await repositories.userRepository.findByEmail(user.email);

    if (existingUserResult.IsOk && existingUserResult.Unwrap()) {
        return Result.Err({
            code: "USER_ALREADY_EXISTS",
            message: "El usuario ya existe con ese email",
        });
    }

    if (existingUserResult.IsErr && existingUserResult.Error.code !== "DB_ERROR::USER_NOT_FOUND") {
        return Result.Err({
            code: existingUserResult.Error.code,
            message: existingUserResult.Error.message,
            details: existingUserResult.Error.details,
        });
    }

    const createdResult = await repositories.userRepository.save(user);
    if (createdResult.IsErr) {
        return Result.Err({
            code: createdResult.Error.code,
            message: createdResult.Error.message,
            details: createdResult.Error.details,
        });
    }
    const created = createdResult.Unwrap();
    if (!created) {
        return Result.Err({
            code: "USER_CREATION_FAILED",
            message: "No se pudo crear el usuario",
        });
    }


    return Result.Ok({
        id: created.id,
        fullName: created.fullName,
        email: created.email,
        address: created.address,
        createdAt: created.createdAt,
    });
}