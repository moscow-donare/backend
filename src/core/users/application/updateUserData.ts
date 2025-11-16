import type { ContainerUserDataRepository } from "../domain/ports/IUserDataRepository";
import type { UserData } from "../domain/userData";
import { UserData as UserDataEntity } from "../domain/userData";

export type UpdateUserDataInput = {
    userId: number;
    birthday?: Date | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    gender?: string | null;
    photo?: string | null;
};

export async function updateUserData(
    input: UpdateUserDataInput,
    repositories: ContainerUserDataRepository
): AsyncResult<UserData> {
    // First, find the existing userData
    const existingUserDataResult = await repositories.userDataRepository.findByUserId(input.userId);

    if (existingUserDataResult.IsErr) {
        return Result.Err({
            code: existingUserDataResult.Error.code,
            message: existingUserDataResult.Error.message,
            details: existingUserDataResult.Error.details,
        });
    }

    const existingUserData = existingUserDataResult.Unwrap();
    if (!existingUserData) {
        return Result.Err({
            code: "USERDATA_NOT_FOUND",
            message: "No se encontraron datos del usuario para actualizar",
        });
    }

    // Update only the fields that are provided
    const updatedUserData = UserDataEntity.createWithId({
        id: existingUserData.id!,
        userId: existingUserData.userId,
        birthday: input.birthday !== undefined ? input.birthday : existingUserData.birthday,
        country: input.country !== undefined ? input.country : existingUserData.country,
        state: input.state !== undefined ? input.state : existingUserData.state,
        city: input.city !== undefined ? input.city : existingUserData.city,
        provider: existingUserData.provider,
        gender: input.gender !== undefined ? input.gender : existingUserData.gender,
        photo: input.photo !== undefined ? input.photo : existingUserData.photo,
        createdAt: existingUserData.createdAt,
        updatedAt: new Date(),
    });

    const saveResult = await repositories.userDataRepository.save(updatedUserData);

    if (saveResult.IsErr) {
        return Result.Err({
            code: saveResult.Error.code,
            message: saveResult.Error.message,
            details: saveResult.Error.details,
        });
    }

    return Result.Ok(saveResult.Unwrap());
}
