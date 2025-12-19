import type { Context } from "hono";
import { createDonation } from "../../../../core/donations/application/createDonation";
import { z } from "zod";
import HonoRouter from "../../router";
import type { RouteHandler } from "../../types";
import verifyToken from "../../brokers/verifyToken";
import makeValidationBroker from "../../brokers/validationDTO";

const inputSchema = z.object({
    campaignId: z.number().int().positive(),
    amount: z.number().int().positive(),
    txHash: z.string().min(66).startsWith("0x"),
    isAnonymous: z.boolean().default(false),
})

export type InputType = z.infer<typeof inputSchema>;
const createDonationHandler: RouteHandler = async (c: Context) => {
    const body = c.get("request:body") as InputType;
    const user = c.get("user:session");
    const donationRepository = c.get("repositories:donation");
    const campaignRepository = c.get("repositories:campaign");

    const result = await createDonation({
        userId: user.id,
        campaignId: body.campaignId,
        amount: body.amount,
        txHash: body.txHash,
        isAnonymous: body.isAnonymous,
    }, {
        donationRepository: donationRepository,
        campaignRepository: campaignRepository
    });

    if (result.IsErr) {
        c.status(400);
        return c.json({ success: false, error: result.Error }, 400);
    }

    return c.json({ success: true, data: result.Unwrap(), message: "Donation created successfully" }, 201);
};

export default HonoRouter.resolve(createDonationHandler, [verifyToken, makeValidationBroker(inputSchema)]);
