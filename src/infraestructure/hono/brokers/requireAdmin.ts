import type { BrokerHandler } from "../types";
import { isAdmin } from "$core/users/application/userIsAdmin";

const requireAdmin: BrokerHandler = async (c) => {
    const user = c.get("user:session");
    if (!user) {
        c.status(401);
        return Result.Err({
            code: "MISSING_USER_SESSION",
            message: "User session not found. verifyToken must run first.",
        });
    }

    if (isAdmin(user)) {
        return Result.Ok(c);
    } else {
        c.status(403);
        return Result.Err({
            code: "USER_NOT_ADMIN",
            message: "You don't have permission to access this resource.",
        });
    }
};

export default requireAdmin;
