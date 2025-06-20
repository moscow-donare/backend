import verifyToken from "../brokers/verifyToken";
import HonoRouter from "../router";
import type { RouteHandler } from "../types";

const handler: RouteHandler = (c) => {
  console.log("Hello, world handler called");
  const userSession = c.get("user:session");
  console.log("User session:", userSession);

  return c.json({
    success: true,
    data: {
      message: "Hello, world!",
    },
  });
};

export default HonoRouter.resolve(handler, [
  // Add any broker handlers here if needed
  verifyToken,
]);
