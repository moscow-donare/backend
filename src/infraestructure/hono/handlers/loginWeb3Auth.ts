import HonoRouter from "../router";
import type { RouteHandler } from "../types";

const handler: RouteHandler = (c) => {
    const body = c.get("request:body");
    console.log("Login Web3Auth Handler", body);

    return c.json({
        success: true,
        data: {
            message: "Login successful",
            body: body,
        },
    });
}

export default HonoRouter.resolve(handler, [])