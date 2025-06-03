type VerifierIssuerMap = {
  [key: string]: string
}
const issuerMap: VerifierIssuerMap = {
  google: 'https://accounts.google.com',
  github: 'https://github.com/login/oauth',
  discord: 'https://discord.com',
}
export class Web3AuthRepository {

  private static instance: Web3AuthRepository;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public async verifyToken(token: string, verifier: string): AsyncResult<boolean> {
    let issuer = issuerMap[verifier];
    if (!issuer) {
        return Result.Err({
            code: 'InvalidVerifier',
            message: `The verifier ${verifier} is not supported.`,
        })
    }
    return Result.Ok(true);
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