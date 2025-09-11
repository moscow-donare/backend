import HonoRouter from "../../router";
import type { RouteHandler } from "../../types";
import verifyToken from "../../brokers/verifyToken";
import { z } from "zod";
import makeValidationBroker from "../../brokers/validationDTO";
import { cancelCampaign } from "$core/campaigns/application/cancelCampaign";

const inputSchema = z.object({
    id: z.number().int().positive(),
    contractAddress: z.string().min(42).startsWith("0x"),
    reason: z.string().max(255).optional(),
})

export type InputType = z.infer<typeof inputSchema>;

const handler: RouteHandler = async (c) => {
    const campaignRepository = c.get("repositories:campaign");
    const body = c.get("request:body") as InputType;
    const user = c.get("user:session");

    const result = await cancelCampaign(body, user, {
        campaignRepository,
    });

    if (result.IsErr) {
        c.status(400);
        return c.json({
            success: false,
            error: result.Error,
        }, 400);
    }

    return c.json({
        success: true,
        message: "Campaign canceled successfully",
        data: result.Unwrap(),
    });
};

export default HonoRouter.resolve(handler, [verifyToken, makeValidationBroker(inputSchema)]);