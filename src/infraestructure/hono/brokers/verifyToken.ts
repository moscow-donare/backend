import type { BrokerHandler } from "../types";
/**
 * Valida que el token sea valido, si es valido, valida que el usuario exista en la base de datos.
 * Si el usuario no existe en la base de datos, retorna 403 FORBIDEN. 
 * Si el usuario existe, suma el usuario al contexto.
 * @param c 
 * @returns 
 */
const verifyToken: BrokerHandler = async (c) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  const web3auth = c.get("repositories:web3auth");
  const userRepository = c.get("repositories:user");

  if (!token) {
    c.status(401);
    return Result.Err({
      code: "MissingToken",
      message: "Authorization token is required.",
    });
  }

  const userInfo = await web3auth.getUserInfo(token);
  if (userInfo.IsErr) {
    c.status(401);
    return Result.Err({
      code: "InvalidToken",
      message: "The provided token is invalid.",
    });
  }

  const userUnwrap = userInfo.Unwrap();
  const user = await userRepository.findByEmail(userUnwrap.email);

  if (user.IsErr) {
    c.status(403);
    return Result.Err({
      code: "UserNotFound",
      message: "User not found in the database.",
    });
  }
  const u = user.Unwrap();
  c.set("user:session", u);
  return Result.Ok(c);
};

export default verifyToken;
