import { z } from "zod";

export const TokenWeb3Auth = z.string().nonempty().min(1, {
    message: "Token is required",
});