import HonoRouter from "../../router";
import type { RouteHandler } from "../../types";
import verifyToken from "../../brokers/verifyToken";
import { z } from "zod";
import makeValidationBroker from "../../brokers/validationDTO";
import requireAdmin from "../../brokers/requireAdmin";
import { requestCampaignChanges } from "$core/campaigns/application/requestCampaignChanges";

const inputSchema = z.object({
    id: z.number().int().positive(),
    reason: z.string().max(255),
})

export type InputType = z.infer<typeof inputSchema>;

const handler: RouteHandler = async (c) => {
    const campaignRepository = c.get("repositories:campaign");
    const body = c.get("request:body") as InputType;
    const user = c.get("user:session");

    const result = await requestCampaignChanges(body, {
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
        message: "Campaign changes requested successfully",
        data: result.Unwrap(),
    });
};

export default HonoRouter.resolve(handler, [verifyToken, makeValidationBroker(inputSchema), requireAdmin]);