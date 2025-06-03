export interface ResultError {
  code: string;
  message?: string;
  details?: unknown;
}

export type ErrorResult = Result<null>;
export type AsyncResult<T = unknown> = Promise<Result<T> | ErrorResult>;
export type SyncResult<T = unknown> = Result<T> | ErrorResult;

class Result<T> {
  private success: boolean;
  private data?: T;
  private error?: ResultError;

  constructor(success: boolean, data?: T, error?: ResultError) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  public get IsOk() {
    return this.success;
  }

  public get IsErr() {
    return !this.success;
  }

  public get AsErr() {
    return this as Result<null>;
  }
public get Error() {
    return this.error!;
  }

  public Unwrap(): NonNullable<T> {
    return this.data!;
  }

  public ClearData() {
    delete this.data;
  }

  public ClearError() {
    delete this.error;
  }

  public static Ok<D = unknown>(data: D): Result<D> {
    return new Result(true, data);
  }

  public static Err(err: ResultError): ErrorResult {
    return new Result(false, null, err);
  }
}

export default Result;
