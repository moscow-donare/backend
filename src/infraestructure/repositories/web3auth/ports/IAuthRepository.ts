import type { UserInputFromWeb3Auth } from "$core/users/domain/types";

export interface IAuthRepository {
  getUserInfo(token: string): AsyncResult<UserInputFromWeb3Auth>;
}