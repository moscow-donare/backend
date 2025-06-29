import { ZodError } from "zod";

type IssueInfo = {
    reason: string;
    field: string;
};

class ZodHelper {
    public static makeError(err: ZodError): ErrorResult {
        const errors: IssueInfo[] = err.errors.map((e) => {
            return {
                reason: e.code,
                field: e.path.join(".")
            };
        });

        return Result.Err({
            code: "Zod::InvalidData",
            details: errors
        });
    }
}

export default ZodHelper;
