import type { RouteHandler } from "../../types";
import verifyToken from "../../brokers/verifyToken";
import HonoRouter from "../../router";
import { buildFilters } from "src/infraestructure/hono/brokers/buildFilters";
import { Criteria } from "$shared/core/domain/criteria/Criteria";
import listByCriteria from "$shared/core/application/listByCriteria";
import { Filter } from "$shared/core/domain/criteria/Filter";

const handler: RouteHandler = async (c) => {
    const campaignRepository = c.get("repositories:campaign");
    const user = c.get("user:session");
    const filters = c.req.queries();
    const filtersCr = buildFilters(filters);
    console.log("Campaign filters:", filtersCr);
    const criteria: Criteria = new Criteria(filtersCr);
    const userFilter = new Filter("creator_id", user.id);
    criteria.addFilter(userFilter);

    const result = await listByCriteria(campaignRepository, criteria);

    if (result.IsErr) {
        c.status(400);
        return c.json({
            success: false,
            error: result.Error,
        }, 400);
    }

    return c.json({
        success: true,
        message: "Campaigns obtained successfully",
        data: result.Unwrap(),
    });
};

export default HonoRouter.resolve(handler, [verifyToken]);