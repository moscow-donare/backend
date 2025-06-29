import { TokenWeb3Auth } from "src/infraestructure/zod/commond";
import HonoRouter from "../../router";
import type { RouteHandler } from "../../types";
import { z } from "zod";
import makeValidationBroker from "../../brokers/validationDTO";
import { createUser, type CreateUserInput } from "src/core/users/application/createUser";

const inputSchema = z.object({
    idToken: TokenWeb3Auth
})

type InputType = z.infer<typeof inputSchema>;

const handler: RouteHandler = async (c) => {
    const body = c.get("request:body") as InputType;
    const web3auth = c.get("repositories:web3auth");
    const userRepository = c.get("repositories:user");

    const user = await web3auth.getUserInfo(body.idToken)

    if (user.IsErr) {
        return c.json({
            success: false,
            error: user.Error,
        }, 400);
    }

    const userInfo = user.Unwrap();
    if (!userInfo) {
        return c.json({
            success: false,
            error: {
                code: "USER_NOT_FOUND",
                message: "User not found in Web3Auth",
            },
        }, 404);
    }
    const existingUser = await userRepository.findByEmail(userInfo.email);
    const existingUserUnwrap = existingUser.Unwrap() ?? null;
    if (existingUser.IsOk && existingUserUnwrap) {
        return c.json({
            success: true,
            message: "User already exists",
            data: existingUserUnwrap
        });
    }
    const createUserInput: CreateUserInput = {
        fullName: userInfo.name,
        email: userInfo.email,
        address: userInfo.address,
    }
    const createdUser = await createUser(createUserInput, {
        userRepository: userRepository,
    });

    if (createdUser.IsErr) {
        return c.json({
            success: false,
            error: createdUser.Error,
        }, 400);
    }

    return c.json({
        success: true,
        message: "User created successfully",
        data: createdUser.Unwrap(),
    });
}

export default HonoRouter.resolve(handler, [makeValidationBroker(inputSchema)])