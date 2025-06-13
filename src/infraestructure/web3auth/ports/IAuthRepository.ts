export interface IAuthRepository {
  verifyToken(token: string, verifier: string): AsyncResult<boolean>;
}