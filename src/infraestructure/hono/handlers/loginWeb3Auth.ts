import { TokenWeb3Auth } from "src/infraestructure/zod/commond";
import HonoRouter from "../router";
import type { RouteHandler } from "../types";
import { z } from "zod";
import makeValidationBroker from "../brokers/validationDTO";

const inputSchema = z.object({
    idToken: TokenWeb3Auth
})

type InputType = z.infer<typeof inputSchema>;

const handler: RouteHandler = async (c) => {
    const body = c.get("request:body") as InputType;
    const web3auth = c.get("repositories:web3auth");

    const tokenVerify = await web3auth.verifyToken(body.idToken, 'loginWeb3Auth');

    if (tokenVerify.IsErr) {
        console.error("Login Web3Auth Handler Error", tokenVerify.Error);
        return c.json({
            success: false,
            error: {
                code: tokenVerify.Error?.code || "LoginWeb3Auth::TokenVerificationError",
                message: tokenVerify.Error?.message || "Failed to verify token",
                details: tokenVerify.Error?.details || {},
            },
        }, 400);
    }

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