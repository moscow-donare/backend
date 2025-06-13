export interface IAuthRepository {
  verifyToken(token: string, verifier: string): AsyncResult<boolean>;
  getUserInfo(token: string): AsyncResult<unknown>;
}