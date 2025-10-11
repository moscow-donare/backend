import { User } from "../domain/user";
import type { ContainerUserRepository } from "../domain/ports/IUserRepository";
import type { IUserDataRepository } from "../domain/ports/IUserDataRepository";
import { UserData } from "../domain/userData";

export type CreateUserInput = {
    fullName: string;
    email: string;
    address: string;
    provider: string;
};

type CreateUserRepositories = ContainerUserRepository & {
    userDataRepository: IUserDataRepository;
};

export async function createUser(input: CreateUserInput, repositories: CreateUserRepositories): AsyncResult<User> {

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

    // Create UserData record with default values
    const userData = UserData.create({
        userId: created.id!,
        birthday: null,
        country: null,
        state: null,
        city: null,
        gender: null,
        provider: input.provider,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const userDataResult = await repositories.userDataRepository.save(userData);
    if (userDataResult.IsErr) {
        return Result.Err({
            code: userDataResult.Error.code,
            message: userDataResult.Error.message,
            details: userDataResult.Error.details,
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