import type {
  BrandOption,
  CreateProductPayload,
  ProductData,
  ProductDraft,
  ProductImageUpload,
  ProductPhotoInput,
  ProductSiteId,
  ProductSitePublishResult,
} from "./product.types.js";

const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;

export const PRODUCT_SITE_IDS = ["anilox", "ebraha"] as const;

export const PRODUCT_SITE_LABELS: Record<ProductSiteId, string> = {
  anilox: "انیلوکس",
  ebraha: "ابراهااستایل",
};

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

interface ProductSiteConfiguration {
  brandApiUrl: string;
  id: ProductSiteId;
  label: string;
  productApiUrl: string;
}

export interface ProductBrandCatalog {
  brands: BrandOption[];
  warnings: Partial<Record<ProductSiteId, string>>;
}

export interface DownloadedProductImage extends ProductImageUpload {}

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

function getSiteConfiguration(site: ProductSiteId): ProductSiteConfiguration {
  if (site === "anilox") {
    return {
      id: site,
      label: PRODUCT_SITE_LABELS[site],
      brandApiUrl: getHttpUrl(
        process.env.ANILOX_BRAND_API_URL?.trim() ||
          process.env.BRAND_API_URL?.trim() ||
          "https://aniloxhub.com/api/v1/brandPopular",
        "ANILOX_BRAND_API_URL",
      ),
      productApiUrl: getHttpUrl(
        process.env.ANILOX_PRODUCT_API_URL?.trim() ||
          process.env.PRODUCT_API_URL?.trim() ||
          "https://aniloxhub.com/api/v1/products/telegram",
        "ANILOX_PRODUCT_API_URL",
      ),
    };
  }

  return {
    id: site,
    label: PRODUCT_SITE_LABELS[site],
    brandApiUrl: getHttpUrl(
      process.env.EBRAHA_BRAND_API_URL?.trim() ||
        "https://ebrahastyle.com/api/v1/brandPopular",
      "EBRAHA_BRAND_API_URL",
    ),
    productApiUrl: getHttpUrl(
      process.env.EBRAHA_PRODUCT_API_URL?.trim() ||
        "https://ebrahastyle.com/api/v1/products/telegram",
      "EBRAHA_PRODUCT_API_URL",
    ),
  };
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
  for (const site of PRODUCT_SITE_IDS) {
    getSiteConfiguration(site);
  }

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
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
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
        : `${publicMessage} Check that the backend is reachable.`,
      { cause: error },
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTelegram(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
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
  const fallbackMimeType = extension ? mimeTypeByExtension[extension] : undefined;

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
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  const extension = extensions[mimeType];

  if (!extension) {
    throw new ProductBackendError(
      "INVALID_PRODUCT_IMAGE",
      "The product image extension could not be determined.",
    );
  }

  return extension;
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
      body: JSON.stringify({ file_id: photo.fileId }),
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
    { method: "GET", headers: { Accept: "image/*" } },
  );

  if (!imageResponse.ok) {
    throw new ProductBackendError(
      "TELEGRAM_FILE_REQUEST_FAILED",
      `Telegram image download failed with HTTP ${imageResponse.status}.`,
    );
  }

  const contentLength = Number(imageResponse.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_PRODUCT_IMAGE_BYTES) {
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
    blob: new Blob([imageBuffer], { type: mimeType }),
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

function getBrandItems(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (isRecord(payload.data)) {
    if (Array.isArray(payload.data.brands)) {
      return payload.data.brands;
    }

    if (Array.isArray(payload.data.rows)) {
      return payload.data.rows;
    }
  }

  return [];
}

function normalizeBrandKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function normalizeSiteBrandCatalog(
  payload: unknown,
  site: ProductSiteId,
): BrandOption[] {
  const catalog = new Map<string, BrandOption>();

  for (const item of getBrandItems(payload)) {
    if (!isRecord(item)) {
      continue;
    }

    const name = getStringProperty(item, ["name", "title"]);
    const slug = getStringProperty(item, ["slug", "value"]);

    if (!name || name.length > 255 || !slug || slug.length > 255) {
      continue;
    }

    const key = normalizeBrandKey(name);

    if (!catalog.has(key)) {
      catalog.set(key, { name, siteSlugs: { [site]: slug } });
    }
  }

  return [...catalog.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );
}

async function getBrandsForSite(site: ProductSiteId) {
  const configuration = getSiteConfiguration(site);
  const payload = await requestJson(
    configuration.brandApiUrl,
    { method: "GET", headers: { Accept: "application/json" } },
    "BRAND_REQUEST_FAILED",
    `Could not load brands from ${configuration.label}.`,
  );

  if (isRecord(payload) && payload.success === false) {
    throw new ProductBackendError(
      "BRAND_REQUEST_FAILED",
      getResponseErrorMessage(payload) ??
        `The ${configuration.label} brand backend rejected the request.`,
    );
  }

  const brands = normalizeSiteBrandCatalog(payload, site);

  if (brands.length === 0) {
    throw new ProductBackendError(
      "INVALID_BRAND_RESPONSE",
      `The ${configuration.label} brand API returned no usable brands.`,
    );
  }

  return brands;
}

function mergeBrandCatalogs(
  catalogs: ReadonlyArray<readonly BrandOption[]>,
): BrandOption[] {
  const merged = new Map<string, BrandOption>();

  for (const catalog of catalogs) {
    for (const brand of catalog) {
      const key = normalizeBrandKey(brand.name);
      const existing = merged.get(key);

      if (existing) {
        existing.siteSlugs = { ...existing.siteSlugs, ...brand.siteSlugs };
      } else {
        merged.set(key, {
          name: brand.name,
          siteSlugs: { ...brand.siteSlugs },
        });
      }
    }
  }

  return [...merged.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );
}

function toCreateProductPayload(
  product: ProductData,
  brandSlug: string,
): CreateProductPayload {
  return {
    type: product.type,
    brand: brandSlug,
    model: product.model,
    category: product.type === "shoe" ? product.category : "other",
    gender: product.gender,
    price: product.price,
    discount_price: product.discountPrice,
    description: product.description,
    colors: product.colors?.join(", ") ?? null,
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
  product: ProductData,
  brandSlug: string,
  images: readonly ProductImageUpload[],
) {
  const payload = toCreateProductPayload(product, brandSlug);
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

  const imageField = getProductImageField();

  for (const image of images) {
    formData.append(imageField, image.blob, image.filename);
  }

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

function validateImages(images: readonly ProductImageUpload[]) {
  if (images.length < 1 || images.length > 10) {
    throw new ProductBackendError(
      "INVALID_PRODUCT_IMAGE",
      "Send between 1 and 10 product photos.",
    );
  }

  for (const image of images) {
    if (image.blob.size < 1 || image.blob.size > MAX_PRODUCT_IMAGE_BYTES) {
      throw new ProductBackendError(
        "PRODUCT_IMAGE_TOO_LARGE",
        "Each product image must be between 1 byte and 10 MB.",
      );
    }

    if (!/^image\/(?:jpeg|png|webp|heic|heif)$/.test(image.blob.type)) {
      throw new ProductBackendError(
        "INVALID_PRODUCT_IMAGE",
        "Only JPEG, PNG, WebP, HEIC, and HEIF product images are supported.",
      );
    }
  }
}

async function createProductOnSite(
  site: ProductSiteId,
  product: ProductData,
  brandSlug: string,
  images: readonly ProductImageUpload[],
) {
  const configuration = getSiteConfiguration(site);
  const payload = await requestJson(
    configuration.productApiUrl,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-Telegram-Bot-Key": getTelegramBotServiceKey(),
      },
      body: createProductFormData(product, brandSlug, images),
    },
    "PRODUCT_REQUEST_FAILED",
    `Could not create the product in ${configuration.label}.`,
  );

  if (isRecord(payload) && payload.success === false) {
    throw new ProductBackendError(
      "PRODUCT_REQUEST_FAILED",
      getResponseErrorMessage(payload) ??
        `The ${configuration.label} product backend rejected the request.`,
    );
  }

  if (payload == null) {
    throw new ProductBackendError(
      "INVALID_PRODUCT_RESPONSE",
      `The ${configuration.label} product backend returned an empty response.`,
    );
  }

  return { id: extractCreatedProductId(payload) };
}

async function resolveBrandSlug(product: ProductData, site: ProductSiteId) {
  const knownSlug = product.brandSlugs[site];

  if (knownSlug) {
    return knownSlug;
  }

  const siteBrands = await getBrandsForSite(site);
  const selectedBrand = siteBrands.find(
    (brand) => normalizeBrandKey(brand.name) === normalizeBrandKey(product.brandName),
  );

  return selectedBrand?.siteSlugs[site] ?? null;
}

async function publishProductToSite(
  site: ProductSiteId,
  product: ProductData,
  images: readonly ProductImageUpload[],
): Promise<ProductSitePublishResult> {
  try {
    const brandSlug = await resolveBrandSlug(product, site);

    if (!brandSlug) {
      return {
        site,
        status: "brand_missing",
        id: null,
        message: `برند «${product.brandName}» در ${PRODUCT_SITE_LABELS[site]} وجود ندارد.`,
      };
    }

    const created = await createProductOnSite(site, product, brandSlug, images);

    return { site, status: "created", id: created.id, message: null };
  } catch (error) {
    const message = getProductBackendPublicMessage(error);
    const backendReportsMissingBrand =
      /(?:cannot|can not) find this brand|brand (?:was )?not found/i.test(message);

    if (backendReportsMissingBrand) {
      return {
        site,
        status: "brand_missing",
        id: null,
        message: `برند «${product.brandName}» در ${PRODUCT_SITE_LABELS[site]} وجود ندارد.`,
      };
    }

    return {
      site,
      status: "failed",
      id: null,
      message,
    };
  }
}

export function getProductBackendPublicMessage(error: unknown) {
  if (error instanceof ProductBackendError) {
    return error.publicMessage;
  }

  return "The backend request failed unexpectedly.";
}

export const productBackendApi = {
  async getBrands(): Promise<ProductBrandCatalog> {
    const settled = await Promise.allSettled(
      PRODUCT_SITE_IDS.map(async (site) => ({
        site,
        brands: await getBrandsForSite(site),
      })),
    );
    const catalogs: BrandOption[][] = [];
    const warnings: Partial<Record<ProductSiteId, string>> = {};

    settled.forEach((result, index) => {
      const site = PRODUCT_SITE_IDS[index]!;

      if (result.status === "fulfilled") {
        catalogs.push(result.value.brands);
      } else {
        warnings[site] = getProductBackendPublicMessage(result.reason);
      }
    });

    if (catalogs.length === 0) {
      throw new ProductBackendError(
        "BRAND_REQUEST_FAILED",
        Object.values(warnings).filter(Boolean).join("\n") ||
          "Could not load brands from either website.",
      );
    }

    return { brands: mergeBrandCatalogs(catalogs), warnings };
  },

  async createProduct(
    draft: ProductDraft,
    targets: readonly ProductSiteId[] = PRODUCT_SITE_IDS,
  ) {
    const images = await Promise.all(
      draft.photos.map((photo) => downloadTelegramProductImage(photo)),
    );

    return this.createProductFromImages(draft, images, targets);
  },

  async createProductFromImages(
    product: ProductData,
    images: readonly ProductImageUpload[],
    targets: readonly ProductSiteId[] = PRODUCT_SITE_IDS,
  ): Promise<ProductSitePublishResult[]> {
    validateImages(images);

    const uniqueTargets = [...new Set(targets)].filter((site) =>
      PRODUCT_SITE_IDS.includes(site),
    );

    return Promise.all(
      uniqueTargets.map((site) => publishProductToSite(site, product, images)),
    );
  },
};
