export interface IAuthRepository {
  verifyToken(token: string, verifier: string): Promise<AsyncResult<boolean>>;
}