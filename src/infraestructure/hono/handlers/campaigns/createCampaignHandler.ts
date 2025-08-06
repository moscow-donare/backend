import { z } from "zod";
import { createCampaign, type CreateCampaignInput } from "$core/campaigns/application/createCampaign";
import type { RouteHandler } from "../../types";
import verifyToken from "../../brokers/verifyToken";
import makeValidationBroker from "../../brokers/validationDTO";
import HonoRouter from "../../router";

const inputSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    goal: z.number().int().positive(),
    endDate: z.coerce.date(),
    url: z.string().url(),
    photo: z.string().min(1),
});

type InputType = z.infer<typeof inputSchema>;

const handler: RouteHandler = async (c) => {
    const body = c.get("request:body") as InputType;
    const campaignRepository = c.get("repositories:campaign");
    const user = c.get("user:session");

    const createCampaignInput: CreateCampaignInput = {
        ...body,
        creator: user,
    };

    const createdCampaign = await createCampaign(createCampaignInput, {
        campaignRepository: campaignRepository,
    });

    if (createdCampaign.IsErr) {
        return c.json({
            success: false,
            error: createdCampaign.Error,
        }, 400);
    }

    return c.json({
        success: true,
        message: "Campaign created successfully",
        data: createdCampaign.Unwrap(),
    });
};

export default HonoRouter.resolve(handler, [makeValidationBroker(inputSchema), verifyToken]);