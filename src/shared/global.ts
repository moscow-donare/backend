import ResultType, {
  type SyncResult as SyncResultType,
  type AsyncResult as AsyncResultType,
  type ErrorResult as ErrorResultType
} from "./Result";

declare global {
  // eslint-disable-next-line no-var
  var Result: typeof ResultType;
  type SyncResult<T> = SyncResultType<T>;
  type AsyncResult<T> = AsyncResultType<T>;
  type ErrorResult = ErrorResultType;

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace GC {
    interface SuccessResponse<T = unknown> {
      success: true;
      data: T;
    }
    interface ErrorResponse {
      success: false;
      error: ErrorResult["Error"];
    }
    type Response<T> = SuccessResponse<T> | ErrorResponse;
    }
}

globalThis.Result = ResultType;

