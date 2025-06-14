import type { UserInputFromWeb3Auth } from "$core/users/domain/types";

export interface IAuthRepository {
  verifyToken(token: string, verifier: string): AsyncResult<boolean>;
  getUserInfo(token: string): AsyncResult<UserInputFromWeb3Auth>;
}