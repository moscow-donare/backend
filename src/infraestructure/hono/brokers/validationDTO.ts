import { ZodObject, type ZodRawShape } from "zod";
import type { BrokerHandler } from "../types";
import ZodHelper from "../../zod/helper";

function makeValidationBroker<T extends ZodRawShape>(
	schema: ZodObject<T>
): BrokerHandler {
	return async (ctx) => {
		let reqBody: any = {};
		try {
			reqBody = await ctx.req.json();
			console.log("ValidationBroker::RequestBody", reqBody);
		} catch (e: any) {
			console.error("ValidationBroker::MalformedRequestBody", e);
			return Result.Err({
				code: "ValidationBroker::MalformedRequestBody"
			});
		}

		const validation = await schema.safeParseAsync(reqBody);
		if (!validation.success) {
			return ZodHelper.makeError(validation.error);
		}

		ctx.set("request:body", validation.data);
		return Result.Ok(ctx);
	};
}

export default makeValidationBroker;
