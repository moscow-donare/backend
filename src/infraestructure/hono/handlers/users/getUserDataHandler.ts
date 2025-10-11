import type { RouteHandler } from "../../types";
import HonoRouter from "../../router";
import { getUserData } from "src/core/users/application/getUserData";
import verifyToken from "../../brokers/verifyToken";

const handler: RouteHandler = async (c) => {
    const userDataRepository = c.get("repositories:userData");
    const user = c.get("user:session");

    const userDataResult = await getUserData(
        { userId: user.id! },
        { userDataRepository }
    );

    if (userDataResult.IsErr) {
        const statusCode = userDataResult.Error.code === "DB_ERROR::USERDATA_NOT_FOUND" ? 404 : 400;
        return c.json({
            success: false,
            error: userDataResult.Error,
        }, statusCode);
    }

    return c.json({
        success: true,
        message: "Datos del usuario obtenidos exitosamente",
        data: userDataResult.Unwrap(),
    });
};

export default HonoRouter.resolve(handler, [verifyToken]);
