import type { User } from "../user";

export interface IUserRepository {
    save(user: User): AsyncResult<User>
    findByEmail(email: string): AsyncResult<User>
}

export type ContainerUserRepository = {
    userRepository: IUserRepository;
};