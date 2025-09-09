import type { BrokerHandler } from "../types";
import { validateAdminRole } from "$core/users/application/validateAdminRole";

const requireAdmin: BrokerHandler = async (c) => {
    const user = c.get("user:session");
    if (!user) {
        c.status(401);
        return Result.Err({
            code: "MissingUserSession",
            message: "User session not found. verifyToken must run first.",
        });
    }

    try {
        console.log("trying to validate admin role for user:", user.email);
        validateAdminRole(user);
        return Result.Ok(c);
    } catch (e: any) {
        c.status(403);
        return Result.Err({
            code: e?.code ?? "UserNotAdmin",
            message: "You don't have permission to access this resource.",
        });
    }
};

export default requireAdmin;
