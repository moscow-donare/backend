export type ResultError = {
  code: string;
  message?: string;
  details?: Record<string, unknown>;
};

declare class Result<T> {
  private _success;
  private _data?;
  private _error?;
  /**
   * **AVOID CONSTRUCTING `Result` OBJECTS DIRECTLY**\
   * If you want to create a Result object, you should use `Result.ok` or `Result.err` instead.
   */
  constructor(success: boolean, data?: T, error?: ResultError);
  /**
   * @returns {boolean} is a happy `Result` object?
   */
  get isOk(): boolean;
  /**
   * @returns {boolean} is an error `Result` object?
   */
  get isErr(): boolean;
  /**
   * Returns the `Result` object with forced `ErrorResult` type.\
   * Use it for error bubbling/raising.
   *
   * _Important note_\
   * This getter calls the `clear` method internally.
   * It means, the `data` value will be deleted.
   * @returns {ErrorResult} `Result` object.
   */
  get asError(): ErrorResult;
  /**
   * Returns the internal `error` value.\
   * Use it after proper error checking.
   * @returns {ResultError} `error` value.
   */
  get error(): ResultError;
  /**
   * Returns the internal `data` value.\
   * Use it after proper error checking.
   * @returns {NonNullable<T>} `data` value.
   */
  get value(): NonNullable<T>;
  /**
   * Deletes the specified attribute in the object.\
   * Good for sanitize responses.
   * @param scope {ResultClearScope} must be `"data"`, `"error"` or `"all"`. The latter removes both attributes.
   */
  static ok<D = unknown>(data: D): Result<D>;
  /**
   * Creates a Result object, with error inside.\
   * This represents an unhappy result, with error and `null` data.
   * @param data {ResultError} Result error
   * @returns {Result} error Result object
   */
  static err(err: ResultError): ErrorResult;
}
export default Result;
