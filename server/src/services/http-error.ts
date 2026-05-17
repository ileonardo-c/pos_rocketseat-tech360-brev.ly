export class HttpError extends Error {
  readonly status: number;
  readonly field?: string;

  constructor(status: number, message: string, field?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.field = field;
  }
}
