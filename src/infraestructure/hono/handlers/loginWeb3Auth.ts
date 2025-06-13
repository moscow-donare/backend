import { TokenWeb3Auth } from "src/infraestructure/zod/commond";
import HonoRouter from "../router";
import type { RouteHandler } from "../types";
import { z } from "zod";
import makeValidationBroker from "../brokers/validationDTO";

const inputSchema = z.object({
    idToken: TokenWeb3Auth
})

type InputType = z.infer<typeof inputSchema>;

const handler: RouteHandler = (c) => {
    const body = c.get("request:body") as InputType;
    console.log("Login Web3Auth Handler", body);

    return c.json({
        success: true,
        data: {
            message: "Login successful",
            body: body,
        },
    });
}

export default HonoRouter.resolve(handler, [makeValidationBroker(inputSchema)])