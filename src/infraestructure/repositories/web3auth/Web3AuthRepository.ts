import { jwtVerify, createRemoteJWKSet, importSPKI } from "jose";
import type { IAuthRepository } from "./ports/IAuthRepository";
import type { UserInputFromWeb3Auth } from "$core/users/domain/types";
import { ethers } from "ethers";
import { th } from "zod/v4/locales";


const JWKS_URL = process.env.JWKS_URL!; // URL del JWKS de Web3Auth
const CLIENT_ID = process.env.WEB3AUTH_CLIENT_ID ?? ''; // el de tu proyecto
const ISSUER_WEB3AUTH = "https://api-auth.web3auth.io"; // el issuer de Web3Auth
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
    throw new Error("Method not implemented.");
  }

  public static getInstance(): Web3AuthRepository {
    if (!Web3AuthRepository.instance) {
      Web3AuthRepository.instance = new Web3AuthRepository();
    }
    return Web3AuthRepository.instance;
  }

  public async getUserInfo(token: string): AsyncResult<UserInputFromWeb3Auth> {
    console.log("getUserInfo token", token);
    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: ISSUER_WEB3AUTH,
        audience: CLIENT_ID,
      });

      if (!this.isValidPayload(payload)) {
        return Result.Err({
          code: "InvalidPayload",
          message: "The token payload is invalid or missing required fields.",
        });
      }
      const userInfo = this.mapUserInfo(payload);
      console.log("addres armada", this.publicKeyToAddress(userInfo.address));
      return Result.Ok(this.mapUserInfo(payload));
    } catch (error) {
      console.error(error);
      return Result.Err({
        code: "InvalidToken",
        message: "The provided token is invalid.",
      });
    }
  }

  public publicKeyToAddress(publicKeyHex: string): string {
    // Asegurar que comience con '0x'
    if (!publicKeyHex.startsWith("0x")) {
      publicKeyHex = "0x" + publicKeyHex;
    }

    // Usamos ethers para convertir public key a dirección
    const address = ethers.computeAddress(publicKeyHex);
    return address;
  }


  private isValidPayload(payload: any): boolean {
    console.log("Payload:", payload);
    return payload &&
      payload.userId && typeof payload.userId === 'string' &&
      payload.email && typeof payload.email === 'string' &&
      payload.name && typeof payload.name === 'string' &&
      Array.isArray(payload.wallets) &&
      payload.wallets.some((wallet: any) =>
        wallet.type === "web3auth_threshold_key" &&
        typeof wallet.public_key === 'string'
      );
  }

  private mapUserInfo(payload: any): UserInputFromWeb3Auth {
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      address: payload.wallets.find((wallet: any) => wallet.type === "web3auth_threshold_key" && wallet.curve === "secp256k1").public_key,
    }
  }

  public async login(): Promise<void> {
    // Implement the logic to log in
  }

  public async logout(): Promise<void> {
    // Implement the logic to log out
  }
}
