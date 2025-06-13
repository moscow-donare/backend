import { jwtVerify, createRemoteJWKSet, importSPKI } from "jose";
import type { IAuthRepository } from "../ports/IAuthRepository";

const JWKS_URL = "https://api-auth.web3auth.io/.well-known/jwks.json";
const CLIENT_ID = process.env.WEB3AUTH_CLIENT_ID ?? ''; // el de tu proyecto
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));
export class Web3AuthRepository implements IAuthRepository {
  private static instance: Web3AuthRepository;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public async verifyToken(
    token: string,
    verifier: string
  ): AsyncResult<boolean> {
    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: "https://api-auth.web3auth.io",
        audience: CLIENT_ID,
      });

      console.log(payload);
      return Result.Ok(true);
    } catch (error) {
      console.error(error);
      return Result.Err({
        code: "InvalidToken",
        message: "The provided token is invalid.",
      });
    }
  }

  public static getInstance(): Web3AuthRepository {
    if (!Web3AuthRepository.instance) {
      Web3AuthRepository.instance = new Web3AuthRepository();
    }
    return Web3AuthRepository.instance;
  }

  public async getUserInfo(): Promise<any> {
    // Implement the logic to get user info
    return {};
  }

  public async login(): Promise<void> {
    // Implement the logic to log in
  }

  public async logout(): Promise<void> {
    // Implement the logic to log out
  }
}
