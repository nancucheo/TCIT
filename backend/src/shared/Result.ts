export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly data?: T,
    public readonly error?: { code: string; message: string; details?: unknown[] }
  ) {}

  static success<T>(data: T): Result<T> {
    return new Result<T>(true, data);
  }

  static failure<T>(code: string, message: string, details?: unknown[]): Result<T> {
    return new Result<T>(false, undefined, { code, message, details });
  }
}
