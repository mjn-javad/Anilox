import type {
  BrandOption,
  CreatedBackendProduct,
  CreateProductPayload,
  ProductDraft,
  ProductPhotoInput,
} from "./product.types.js";

const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;

type ProductBackendErrorCode =
  | "INVALID_BACKEND_URL"
  | "INVALID_BACKEND_CONFIGURATION"
  | "BRAND_REQUEST_FAILED"
  | "INVALID_BRAND_RESPONSE"
  | "TELEGRAM_FILE_REQUEST_FAILED"
  | "PRODUCT_IMAGE_TOO_LARGE"
  | "INVALID_PRODUCT_IMAGE"
  | "PRODUCT_REQUEST_FAILED"
  | "INVALID_PRODUCT_RESPONSE";

export interface DownloadedProductImage {
  blob: Blob;
  filename: string;
}

export class ProductBackendError extends Error {
  constructor(
    public readonly code: ProductBackendErrorCode,
    public readonly publicMessage: string,
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = "ProductBackendError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getHttpUrl(value: string, variableName: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }

    return url.toString();
  } catch (error) {
    throw new ProductBackendError(
      "INVALID_BACKEND_URL",
      `${variableName} is not a valid HTTP URL.`,
      { cause: error },
    );
  }
}

function getBrandApiUrl() {
  const value =
    process.env.BRAND_API_URL?.trim() ||
    "http://127.0.0.1:4000/v1/brandPopular";

  return getHttpUrl(value, "BRAND_API_URL");
}

function getProductApiUrl() {
  const value = process.env.PRODUCT_API_URL?.trim();

  if (!value) {
    throw new ProductBackendError(
      "INVALID_BACKEND_CONFIGURATION",
      "PRODUCT_API_URL is missing from .env.",
    );
  }

  return getHttpUrl(value, "PRODUCT_API_URL");
}

function getTelegramBotServiceKey() {
  const value = process.env.TELEGRAM_BOT_SERVICE_KEY?.trim();

  if (!value) {
    throw new ProductBackendError(
      "INVALID_BACKEND_CONFIGURATION",
      "TELEGRAM_BOT_SERVICE_KEY is missing from .env.",
    );
  }

  if (value.length < 32) {
    throw new ProductBackendError(
      "INVALID_BACKEND_CONFIGURATION",
      "TELEGRAM_BOT_SERVICE_KEY must contain at least 32 characters.",
    );
  }

  return value;
}

function getBotToken() {
  const value = process.env.BOT_TOKEN?.trim();

  if (!value) {
    throw new ProductBackendError(
      "INVALID_BACKEND_CONFIGURATION",
      "BOT_TOKEN is missing from .env.",
    );
  }

  return value;
}

function getProductImageField() {
  const value = process.env.PRODUCT_IMAGE_FIELD?.trim() || "images";

  if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(value)) {
    throw new ProductBackendError(
      "INVALID_BACKEND_CONFIGURATION",
      "PRODUCT_IMAGE_FIELD is invalid.",
    );
  }

  return value;
}

export function validateProductBackendConfiguration() {
  getBrandApiUrl();
  getProductApiUrl();
  getTelegramBotServiceKey();
  getBotToken();
  getProductImageField();
}

function getResponseErrorMessage(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  for (const key of ["message", "error", "description"]) {
    const value = payload[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

async function requestJson(
  url: string,
  init: RequestInit,
  errorCode: "BRAND_REQUEST_FAILED" | "PRODUCT_REQUEST_FAILED",
  publicMessage: string,
) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30_000);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    const text = await response.text();
    let payload: unknown = null;

    if (text.length > 0) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const backendMessage = getResponseErrorMessage(payload);

      throw new ProductBackendError(
        errorCode,
        backendMessage
          ? `${publicMessage} Backend: ${backendMessage}`
          : `${publicMessage} HTTP ${response.status}.`,
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ProductBackendError) {
      throw error;
    }

    const timedOut = error instanceof Error && error.name === "AbortError";

    throw new ProductBackendError(
      errorCode,
      timedOut
        ? `${publicMessage} The request timed out.`
        : `${publicMessage} Check that the backend is running.`,
      { cause: error },
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTelegram(url: string, init: RequestInit) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30_000);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    throw new ProductBackendError(
      "TELEGRAM_FILE_REQUEST_FAILED",
      error instanceof Error && error.name === "AbortError"
        ? "Downloading the Telegram image timed out."
        : "Could not download the product image from Telegram.",
      { cause: error },
    );
  } finally {
    clearTimeout(timeout);
  }
}

function getImageMimeType(response: Response, filePath: string) {
  const contentType = response.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();

  const supportedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ]);

  if (contentType && supportedTypes.has(contentType)) {
    return contentType;
  }

  const extension = filePath.split(".").at(-1)?.toLowerCase();

  const mimeTypeByExtension: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };

  const fallbackMimeType = extension
    ? mimeTypeByExtension[extension]
    : undefined;

  if (
    fallbackMimeType &&
    (!contentType || contentType === "application/octet-stream")
  ) {
    return fallbackMimeType;
  }

  throw new ProductBackendError(
    "INVALID_PRODUCT_IMAGE",
    "Telegram returned an unsupported product image type.",
  );
}

function getImageExtension(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/heic":
      return "heic";

    case "image/heif":
      return "heif";

    default:
      throw new ProductBackendError(
        "INVALID_PRODUCT_IMAGE",
        "The product image extension could not be determined.",
      );
  }
}

export async function downloadTelegramProductImage(
  photo: ProductPhotoInput,
): Promise<DownloadedProductImage> {
  const botToken = getBotToken();

  const fileInfoResponse = await fetchTelegram(
    `https://api.telegram.org/bot${botToken}/getFile`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_id: photo.fileId,
      }),
    },
  );

  const fileInfoPayload = (await fileInfoResponse
    .json()
    .catch(() => null)) as unknown;

  if (
    !fileInfoResponse.ok ||
    !isRecord(fileInfoPayload) ||
    fileInfoPayload.ok !== true ||
    !isRecord(fileInfoPayload.result)
  ) {
    throw new ProductBackendError(
      "TELEGRAM_FILE_REQUEST_FAILED",
      getResponseErrorMessage(fileInfoPayload) ??
        "Telegram did not return the product image information.",
    );
  }

  const filePath = fileInfoPayload.result.file_path;

  const reportedFileSize = fileInfoPayload.result.file_size;

  if (typeof filePath !== "string" || filePath.length === 0) {
    throw new ProductBackendError(
      "TELEGRAM_FILE_REQUEST_FAILED",
      "Telegram did not return a downloadable image path.",
    );
  }

  if (
    typeof reportedFileSize === "number" &&
    reportedFileSize > MAX_PRODUCT_IMAGE_BYTES
  ) {
    throw new ProductBackendError(
      "PRODUCT_IMAGE_TOO_LARGE",
      "The product image exceeds the 10 MB backend limit.",
    );
  }

  const imageResponse = await fetchTelegram(
    `https://api.telegram.org/file/bot${botToken}/${filePath}`,
    {
      method: "GET",
      headers: {
        Accept: "image/*",
      },
    },
  );

  if (!imageResponse.ok) {
    throw new ProductBackendError(
      "TELEGRAM_FILE_REQUEST_FAILED",
      `Telegram image download failed with HTTP ${imageResponse.status}.`,
    );
  }

  const contentLength = Number(imageResponse.headers.get("content-length"));

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_PRODUCT_IMAGE_BYTES
  ) {
    throw new ProductBackendError(
      "PRODUCT_IMAGE_TOO_LARGE",
      "The product image exceeds the 10 MB backend limit.",
    );
  }

  const mimeType = getImageMimeType(imageResponse, filePath);

  const imageBuffer = await imageResponse.arrayBuffer();

  if (imageBuffer.byteLength === 0) {
    throw new ProductBackendError(
      "INVALID_PRODUCT_IMAGE",
      "Telegram returned an empty product image.",
    );
  }

  if (imageBuffer.byteLength > MAX_PRODUCT_IMAGE_BYTES) {
    throw new ProductBackendError(
      "PRODUCT_IMAGE_TOO_LARGE",
      "The product image exceeds the 10 MB backend limit.",
    );
  }

  const safeUniqueId =
    photo.fileUniqueId.replace(/[^a-zA-Z0-9_-]/g, "") || "product";

  return {
    blob: new Blob([imageBuffer], {
      type: mimeType,
    }),

    filename: `telegram-${safeUniqueId}.${getImageExtension(mimeType)}`,
  };
}

function getStringProperty(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function normalizeModels(value: unknown) {
  const rawModels = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : [];

  const models: string[] = [];

  for (const rawModel of rawModels) {
    if (typeof rawModel === "string") {
      const model = rawModel.trim();

      if (model.length > 0) {
        models.push(model);
      }

      continue;
    }

    if (isRecord(rawModel)) {
      const model = getStringProperty(rawModel, ["name", "model", "title"]);

      if (model) {
        models.push(model);
      }
    }
  }

  return models;
}

function getBrandItems(payload: unknown) {
  if (!isRecord(payload)) {
    return Array.isArray(payload) ? payload : [];
  }

  const data = payload.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (isRecord(data)) {
    if (Array.isArray(data.brands)) {
      return data.brands;
    }

    if (Array.isArray(data.rows)) {
      return data.rows;
    }
  }

  return [];
}

function normalizeBrandCatalog(payload: unknown): BrandOption[] {
  const catalog = new Map<string, BrandOption>();

  for (const item of getBrandItems(payload)) {
    const name = item.name.trim();
    const slug = item.slug.trim();

    if (!name || name.length > 255 || !slug || slug.length > 255) {
      continue;
    }

    const key = name.toLocaleLowerCase("en-US");

    if (!catalog.has(key)) {
      catalog.set(key, {
        name,
        slug,
      });
    }
  }

  return [...catalog.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );
}

function toCreateProductPayload(draft: ProductDraft): CreateProductPayload {
  return {
    type: draft.type,
    brand: draft.brand,
    model: draft.model,

    category: draft.type === "shoe" ? draft.category : "other",

    gender: draft.gender,
    price: draft.price,

    discount_price: draft.discountPrice,

    description: draft.description,

    colors: draft.colors?.join(", ") ?? null,
  };
}

function appendOptionalFormField(
  formData: FormData,
  fieldName: string,
  value: string | null,
) {
  if (value !== null) {
    formData.append(fieldName, value);
  }
}

function createProductFormData(
  draft: ProductDraft,
  image: DownloadedProductImage,
) {
  const payload = toCreateProductPayload(draft);

  const formData = new FormData();

  formData.append("type", payload.type);

  formData.append("brand", payload.brand);

  formData.append("model", payload.model);

  appendOptionalFormField(formData, "category", payload.category);

  formData.append("gender", payload.gender);

  formData.append("price", payload.price);

  appendOptionalFormField(formData, "discount_price", payload.discount_price);

  appendOptionalFormField(formData, "description", payload.description);

  appendOptionalFormField(formData, "colors", payload.colors);

  formData.append(getProductImageField(), image.blob, image.filename);

  return formData;
}

function extractCreatedProductId(payload: unknown) {
  const root = isRecord(payload) ? payload : null;

  const data = root && isRecord(root.data) ? root.data : root;

  if (!data) {
    return null;
  }

  for (const key of ["id", "productId", "product_id", "insertId"]) {
    const value = data[key];

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return null;
}

export function getProductBackendPublicMessage(error: unknown) {
  if (error instanceof ProductBackendError) {
    return error.publicMessage;
  }

  return "The backend request failed unexpectedly.";
}

export const productBackendApi = {
  async getBrands() {
    const payload = await requestJson(
      getBrandApiUrl(),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
      "BRAND_REQUEST_FAILED",
      "Could not load brands.",
    );

    if (isRecord(payload) && payload.success === false) {
      throw new ProductBackendError(
        "BRAND_REQUEST_FAILED",

        getResponseErrorMessage(payload) ??
          "The brand backend rejected the request.",
      );
    }

    const brands = normalizeBrandCatalog(payload);

    if (brands.length === 0) {
      throw new ProductBackendError(
        "INVALID_BRAND_RESPONSE",
        "The brand API returned no usable brands.",
      );
    }

    return brands;
  },

  async createProduct(draft: ProductDraft): Promise<CreatedBackendProduct> {
    const image = await downloadTelegramProductImage(draft.photo);

    const formData = createProductFormData(draft, image);

    const payload = await requestJson(
      getProductApiUrl(),
      {
        method: "POST",

        headers: {
          Accept: "application/json",

          "X-Telegram-Bot-Key": getTelegramBotServiceKey(),
        },

        body: formData,
      },
      "PRODUCT_REQUEST_FAILED",
      "Could not create the product.",
    );

    if (isRecord(payload) && payload.success === false) {
      throw new ProductBackendError(
        "PRODUCT_REQUEST_FAILED",

        getResponseErrorMessage(payload) ??
          "The product backend rejected the request.",
      );
    }

    if (payload == null) {
      throw new ProductBackendError(
        "INVALID_PRODUCT_RESPONSE",
        "The product backend returned an empty response.",
      );
    }

    return {
      id: extractCreatedProductId(payload),
    };
  },
};
