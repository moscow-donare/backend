import { z } from "zod";

export const TokenWeb3Auth = z.string().nonempty().min(1, {
    message: "Token is required",
});
export const NameCampaign = z.string().min(1).max(100);
export const DescriptionCampaign = z.string().min(1).max(500);