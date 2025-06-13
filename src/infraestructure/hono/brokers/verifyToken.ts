import type { BrokerHandler } from "../types";

const verifyToken: BrokerHandler = async (c) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  const web3auth = c.get("repositories:web3auth");

  if (!token) {
    c.status(401);
    return Result.Err({
      code: "MissingToken",
      message: "Authorization token is required.",
    });
  }

  const isValidToken = await web3auth.verifyToken(token, "verifyToken");

  if (isValidToken.IsErr) {
    console.error("Verify Token Error", isValidToken.Error);
    c.status(401);
    return Result.Err({
      code: isValidToken.Error.code || "VerifyToken::InvalidToken",
      message: isValidToken.Error.message || "Failed to verify token",
      details: isValidToken.Error.details || {},
    });
  }

  return Result.Ok(c);
};

export default verifyToken;
