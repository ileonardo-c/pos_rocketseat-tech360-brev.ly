export type CreateLinkErrorCode = "INVALID_URL" | "INVALID_SLUG" | "DUPLICATE_SLUG";
export type ResolveLinkErrorCode = "NOT_FOUND";
export type IncrementAccessErrorCode = "NOT_FOUND";

export interface UseCaseError<TCode extends string> {
  code: TCode;
  message: string;
  field?: string;
}
