import type { UserData } from "../userData";

export interface IUserDataRepository {
    save(userData: UserData): AsyncResult<UserData>
    findByUserId(userId: number): AsyncResult<UserData>
}

export type ContainerUserDataRepository = {
    userDataRepository: IUserDataRepository;
};