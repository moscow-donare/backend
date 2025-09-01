import type { RouteHandler } from "../../types";
import HonoRouter from "../../router";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import { Filter } from "$shared/core/domain/criteria/Filter";
import listByCriteria from "$shared/core/application/listByCriteria";

const handler: RouteHandler = async (c) => {
    const campaignRepository = c.get("repositories:campaign");
    const campaignId = Number(c.req.param("id"));

    const criteria: Criteria = new Criteria();
    const filterById: Filter = new Filter("id", campaignId);
    criteria.addFilter(filterById);

    const campaign = await listByCriteria(campaignRepository, criteria);

    if (campaign.IsErr) {
        c.status(400);
        return c.json({
            success: false,
            error: campaign.Error,
        }, 400);
    }

    const campaignUnwrap = campaign.Unwrap()[0] ?? null;
    if (!campaignUnwrap || campaignUnwrap.stateChanges[0]?.getState() != CampaignStatus.ACTIVE) {
        c.status(404);
        return c.json({
            success: false,
            error: "Campaign not found or not accessible",
        }, 404);
    }

    return c.json({
        success: true,
        message: "Campaign obtained successfully",
        data: campaignUnwrap,
    });
};

export default HonoRouter.resolve(handler, []);