import { TokenWeb3Auth } from "src/infraestructure/zod/commond";
import HonoRouter from "../../router";
import type { RouteHandler } from "../../types";
import { z } from "zod";
import makeValidationBroker from "../../brokers/validationDTO";
import verifyToken from "../../brokers/verifyToken";
import { createUser, type CreateUserInput } from "$core/users/application/createUser";

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
        });
    }

    const userInfo = user.Unwrap();
    if (!userInfo) {
        return c.json({
            success: false,
            error: {
                code: "USER_NOT_FOUND",
                message: "User not found in Web3Auth",
            },
        });
    }
    const existingUser = await userRepository.findByEmail(userInfo.email);

    if (existingUser.IsOk && existingUser.Unwrap()) {
        console.log("User already exists:", existingUser.Unwrap());
        return c.json({
            success: true,
            data: userInfo
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
        });
    }

    return c.json({
        success: true,
        data: {
            message: "User created successfully",
            user: createdUser.Unwrap(),
        },
    });
}

export default HonoRouter.resolve(handler, [verifyToken, makeValidationBroker(inputSchema)])