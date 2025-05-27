import type Result from "./Result";

declare global {
  // eslint-disable-next-line no-var
  var ResultType: {
    SuccessResponse: <T = unknown>(data: T) => GC.SuccessResponse<T>;
    ErrorResponse: (error: ErrorResult["error"]) => GC.ErrorResponse;
    Response: <T = unknown>(data: T) => GC.Response<T>;
  };
  var Result: typeof ResultType;
  type SyncResult<T = unknown> = Result<T> | ErrorResult;
  type AsyncResult<T = unknown> = Promise<Result<T> | ErrorResult>;
  type ErrorResult = Result<null>;

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace GC {
    interface SuccessResponse<T = unknown> {
      success: true;
      data: T;
    }
    interface ErrorResponse {
      success: false;
      error: ErrorResult["error"];
    }
    type Response<T> = SuccessResponse<T> | ErrorResponse;
  }
}

globalThis.Result = ResultType;
