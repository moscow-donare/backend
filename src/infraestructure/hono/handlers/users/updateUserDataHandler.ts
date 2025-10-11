import type { RouteHandler } from "../../types";
import HonoRouter from "../../router";
import { z } from "zod";
import makeValidationBroker from "../../brokers/validationDTO";
import verifyToken from "../../brokers/verifyToken";
import { updateUserData } from "src/core/users/application/updateUserData";

const inputSchema = z.object({
    birthday: z.string().datetime().optional().nullable(),
    country: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
});

type InputType = z.infer<typeof inputSchema>;

const handler: RouteHandler = async (c) => {
    const body = c.get("request:body") as InputType;
    const userDataRepository = c.get("repositories:userData");
    const user = c.get("user:session");

    const updateResult = await updateUserData(
        {
            userId: user.id!,
            birthday: body.birthday ? new Date(body.birthday) : undefined,
            country: body.country,
            state: body.state,
            city: body.city,
            gender: body.gender,
        },
        { userDataRepository }
    );

    if (updateResult.IsErr) {
        const statusCode = updateResult.Error.code === "DB_ERROR::USERDATA_NOT_FOUND" ? 404 : 400;
        return c.json({
            success: false,
            error: updateResult.Error,
        }, statusCode);
    }

    return c.json({
        success: true,
        message: "Datos del usuario actualizados exitosamente",
        data: updateResult.Unwrap(),
    });
};

export default HonoRouter.resolve(handler, [verifyToken, makeValidationBroker(inputSchema)]);
