import type { BrokerHandler } from "../types";

const verifyToken: BrokerHandler = async (c) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    c.status(401);
    return Result.Err({
      code: "MissingToken",
      message: "Authorization token is required.",
    });
  }

  return Result.Ok(c);
};

export default verifyToken;
