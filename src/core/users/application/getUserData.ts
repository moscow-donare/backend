import type { ContainerUserDataRepository } from "../domain/ports/IUserDataRepository";
import type { UserData } from "../domain/userData";

export type GetUserDataInput = {
    userId: number;
};

export async function getUserData(
    input: GetUserDataInput,
    repositories: ContainerUserDataRepository
): AsyncResult<UserData> {
    const userDataResult = await repositories.userDataRepository.findByUserId(input.userId);

    if (userDataResult.IsErr) {
        return Result.Err({
            code: userDataResult.Error.code,
            message: userDataResult.Error.message,
            details: userDataResult.Error.details,
        });
    }

    const userData = userDataResult.Unwrap();
    if (!userData) {
        return Result.Err({
            code: "USERDATA_NOT_FOUND",
            message: "No se encontraron datos del usuario",
        });
    }

    return Result.Ok(userData);
}
