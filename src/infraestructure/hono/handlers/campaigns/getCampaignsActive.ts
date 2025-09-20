import listByCriteria from "$shared/core/application/listByCriteria";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import type { RouteHandler } from "../../types";
import { CampaignStatus } from "$core/campaigns/domain/enums";
import HonoRouter from "../../router";
import verifyToken from "../../brokers/verifyToken";
import type { Campaign } from "$core/campaigns/domain/campaign";
import { Filter } from "$shared/core/domain/criteria/Filter";
import { OperatorSQLValueObject } from "$shared/core/domain/OperatorSQLValueObject";

const handler: RouteHandler = async (c) => {
    const campaignRepository = c.get("repositories:campaign");

    const criteria: Criteria = new Criteria();
    const campaigns = await listByCriteria<Campaign>(campaignRepository, criteria);

    if (campaigns.IsErr) {
        c.status(400);
        return c.json({
            success: false,
            error: campaigns.Error,
        }, 400);
    }

    const campaignsActive = campaigns.Unwrap().filter(campaign => campaign.getCurrentStatus() == CampaignStatus.ACTIVE);

    return c.json({
        success: true,
        message: "Campaigns Active obtained successfully",
        data: campaignsActive,
    });
}

export default HonoRouter.resolve(handler, []);