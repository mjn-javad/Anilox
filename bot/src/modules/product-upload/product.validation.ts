import {
  PRODUCT_CATEGORIES,
  PRODUCT_GENDERS,
  PRODUCT_TYPES,
  type ProductCategory,
  type ProductGender,
  type ProductType,
} from "./product.constants.js";
import { ProductUploadError } from "./product-upload.error.js";
import type { ProductDraft, ProductPhotoInput } from "./product.types.js";

function normalizeDigits(value: string) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(/[۰-۹]/g, (digit) => {
      return String(persianDigits.indexOf(digit));
    })
    .replace(/[٠-٩]/g, (digit) => {
      return String(arabicDigits.indexOf(digit));
    });
}

function normalizeRequiredText(
  value: string,
  maximumLength: number,
  error: ProductUploadError,
) {
  const normalized = value.trim();

  if (normalized.length === 0 || normalized.length > maximumLength) {
    throw error;
  }

  return normalized;
}

function normalizeOptionalText(
  value: string | null,
  maximumLength: number,
  error: ProductUploadError,
) {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  if (normalized.length > maximumLength) {
    throw error;
  }

  return normalized;
}

export function validateModel(value: string) {
  return normalizeRequiredText(
    value,
    255,
    new ProductUploadError(
      "INVALID_MODEL",
      "The model must contain between 1 and 255 characters.",
    ),
  );
}

export function validateCategory(value: string): ProductCategory {
  if (!PRODUCT_CATEGORIES.includes(value as ProductCategory)) {
    throw new ProductUploadError(
      "INVALID_CATEGORY",
      "The selected shoe category is invalid.",
    );
  }

  return value as ProductCategory;
}

export function validateGender(value: string): ProductGender {
  if (!PRODUCT_GENDERS.includes(value as ProductGender)) {
    throw new ProductUploadError(
      "INVALID_GENDER",
      "The selected gender is invalid.",
    );
  }

  return value as ProductGender;
}

export function validateType(value: string): ProductType {
  if (!PRODUCT_TYPES.includes(value as ProductType)) {
    throw new ProductUploadError(
      "INVALID_TYPE",
      "The selected product type is invalid.",
    );
  }

  return value as ProductType;
}

export function validateMoney(value: string, field: "price" | "discountPrice") {
  const normalizedInput = normalizeDigits(value)
    .trim()
    .replace(/[٬,]/g, "")
    .replace("٫", ".");

  if (!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(normalizedInput)) {
    throw new ProductUploadError(
      field === "price" ? "INVALID_PRICE" : "INVALID_DISCOUNT_PRICE",
      field === "price"
        ? "Enter a valid price, for example 1250000 or 1250000.50."
        : "Enter a valid discount price.",
    );
  }

  const [wholePart, fractionalPart = ""] = normalizedInput.split(".");

  const normalized = `${wholePart}.${fractionalPart.padEnd(2, "0")}`;

  if (moneyToMinorUnits(normalized) <= 0n) {
    throw new ProductUploadError(
      field === "price" ? "INVALID_PRICE" : "INVALID_DISCOUNT_PRICE",
      "The price must be greater than zero.",
    );
  }

  return normalized;
}

function moneyToMinorUnits(value: string) {
  const [wholePart = "0", fractionalPart = "00"] = value.split(".");

  return (
    BigInt(wholePart) * 100n + BigInt(fractionalPart.padEnd(2, "0").slice(0, 2))
  );
}

export function validateDiscountPrice(value: string | null, price: string) {
  if (value == null) {
    return null;
  }

  const discountPrice = validateMoney(value, "discountPrice");

  if (moneyToMinorUnits(discountPrice) >= moneyToMinorUnits(price)) {
    throw new ProductUploadError(
      "INVALID_DISCOUNT_PRICE",
      "The discount price must be lower than the regular price.",
    );
  }

  return discountPrice;
}

export function validateDescription(value: string | null) {
  return normalizeOptionalText(
    value,
    2_000,
    new ProductUploadError(
      "INVALID_DESCRIPTION",
      "The description cannot exceed 2,000 characters.",
    ),
  );
}

export function validateCustomColor(value: string) {
  return normalizeRequiredText(
    value,
    50,
    new ProductUploadError(
      "INVALID_COLOR",
      "A custom color must contain between 1 and 50 characters.",
    ),
  );
}

export function validateSelectedColors(values: readonly string[]) {
  const uniqueColors: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const color = validateCustomColor(value);
    const key = color.toLocaleLowerCase("en-US");

    if (!seen.has(key)) {
      seen.add(key);
      uniqueColors.push(color);
    }
  }

  if (uniqueColors.length === 0) {
    return null;
  }

  if (uniqueColors.length > 20 || uniqueColors.join(", ").length > 500) {
    throw new ProductUploadError(
      "INVALID_COLORS",
      "Select at most 20 colors and keep the combined value under 500 characters.",
    );
  }

  return uniqueColors;
}

export function validatePhoto(photo: ProductPhotoInput): ProductPhotoInput {
  if (
    photo.fileId.length === 0 ||
    photo.fileUniqueId.length === 0 ||
    !Number.isInteger(photo.width) ||
    !Number.isInteger(photo.height) ||
    photo.width < 1 ||
    photo.height < 1
  ) {
    throw new ProductUploadError(
      "INVALID_PHOTO",
      "The photo information is invalid.",
    );
  }

  return photo;
}

export function validatePhotos(
  photos: readonly ProductPhotoInput[],
): ProductPhotoInput[] {
  if (photos.length < 1 || photos.length > 10) {
    throw new ProductUploadError(
      "INVALID_PHOTO",
      "Send between 1 and 10 product photos.",
    );
  }

  const uniquePhotos = new Map<string, ProductPhotoInput>();

  for (const photo of photos) {
    const validatedPhoto = validatePhoto(photo);
    uniquePhotos.set(validatedPhoto.fileUniqueId, validatedPhoto);
  }

  if (uniquePhotos.size !== photos.length) {
    throw new ProductUploadError(
      "INVALID_PHOTO",
      "The same product photo was sent more than once.",
    );
  }

  return [...uniquePhotos.values()];
}

export function normalizeProductDraft(draft: ProductDraft): ProductDraft {
  const type = validateType(draft.type);

  const price = validateMoney(draft.price, "price");

  const category =
    type === "shoe" ? validateCategory(draft.category ?? "other") : "other";

  return {
    type,
    brand: draft.brand,
    brandName: draft.brandName,
    model: validateModel(draft.model),
    category,
    gender: validateGender(draft.gender),
    price,
    discountPrice: validateDiscountPrice(draft.discountPrice, price),
    description: validateDescription(draft.description),
    colors: validateSelectedColors(draft.colors ?? []),
    photos: validatePhotos(draft.photos),
  };
}
