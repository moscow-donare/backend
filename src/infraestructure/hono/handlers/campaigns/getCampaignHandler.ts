import type { RouteHandler } from "../../types";
import verifyToken from "../../brokers/verifyToken";
import HonoRouter from "../../router";
import { getCampaign, type GetCampaignInput } from "$core/campaigns/application/getCampaign";

const handler: RouteHandler = async (c) => {
    const campaignRepository = c.get("repositories:campaign");
    const user = c.get("user:session");
    const campaignId = Number(c.req.param("id"));
    console.log("Campaign ID:", campaignId);

    const input: GetCampaignInput = {
        campaignId: campaignId,
        user,
    };

    const campaign = await getCampaign(input, {
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
        message: "Campaign obtained successfully",
        data: campaign.Unwrap(),
    });
};

export default HonoRouter.resolve(handler, [verifyToken]);