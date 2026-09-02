export type ProductUploadErrorCode =
  | "INVALID_BRAND"
  | "INVALID_MODEL"
  | "INVALID_CATEGORY"
  | "INVALID_GENDER"
  | "INVALID_TYPE"
  | "INVALID_PRICE"
  | "INVALID_DISCOUNT_PRICE"
  | "INVALID_DESCRIPTION"
  | "INVALID_COLOR"
  | "INVALID_COLORS"
  | "INVALID_PHOTO";

export class ProductUploadError extends Error {
  constructor(
    public readonly code: ProductUploadErrorCode,
    public readonly publicMessage: string,
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = "ProductUploadError";
  }
}
