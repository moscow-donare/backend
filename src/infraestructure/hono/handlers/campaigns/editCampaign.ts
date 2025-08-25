import type { RouteHandler } from "../../types";
import verifyToken from "../../brokers/verifyToken";
import HonoRouter from "../../router";
import { getCampaign, type GetCampaignInput } from "$core/campaigns/application/getCampaign";
import { z } from "zod";
import { editCampaign, type EditCampaignInput } from "$core/campaigns/application/editCampaign";
import makeValidationBroker from "../../brokers/validationDTO";

const inputSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.number().int().optional(),
    goal: z.number().int().positive().optional(),
    endDate: z.coerce.date().optional(),
    blockchainId: z.string().min(1).optional(),
    photo: z.string().min(1).optional()
});

type InputType = z.infer<typeof inputSchema>;

const handler: RouteHandler = async (c) => {
    const body = c.get("request:body") as InputType;
    const campaignRepository = c.get("repositories:campaign");
    const campaignId = Number(c.req.param("id"));
    const user = c.get("user:session");

    const input: EditCampaignInput = {
        campaignId: campaignId,
        creator: user,
        ...body,
    };

    const campaign = await editCampaign(input, {
        campaignRepository: campaignRepository,
    });

    if (campaign.IsErr) {
        c.status(400);
        return c.json({
            success: false,
            error: campaign.Error,
        }, 400);
    }

    return c.json({
        success: true,
        message: "Campaign edited successfully",
        data: campaign.Unwrap(),
    });
};

export default HonoRouter.resolve(handler, [makeValidationBroker(inputSchema), verifyToken]);