import listByCriteria from "$shared/core/application/listByCriteria";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import type { RouteHandler } from "../../types";
import { CampaignStatus } from "$core/campaigns/domain/enums";
import HonoRouter from "../../router";
import verifyToken from "../../brokers/verifyToken";
import type { Campaign } from "$core/campaigns/domain/campaign";

const handler: RouteHandler = async (c) => {
    const campaignRepository = c.get("repositories:campaign");
    console.log("Handler 'getCampaignsInReview' invoked");

    const criteria: Criteria = new Criteria();

    console.log("desde el handlerrrr------------->", criteria.getFilters());
    const campaigns = await listByCriteria<Campaign>(campaignRepository, criteria);

    if (campaigns.IsErr) {
        c.status(400);
        return c.json({
            success: false,
            error: campaigns.Error,
        }, 400);
    }

    const campaignsInReview = campaigns.Unwrap().filter(campaign => campaign.getCurrentStatus() == CampaignStatus.IN_REVIEW);

    return c.json({
        success: true,
        message: "Campaigns in review obtained successfully",
        data: campaignsInReview,
    });
}

export default HonoRouter.resolve(handler, [verifyToken]);