import { randomBytes } from "node:crypto";
import { createServer, type Server } from "node:http";

import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  TYPE_LABELS,
} from "./product.constants.js";
import { downloadTelegramProductImage } from "./product-backend.api.js";
import type { ProductDraft } from "./product.types.js";

const INSTAGRAM_REQUEST_TIMEOUT_MS = 30_000;
const INSTAGRAM_CAPTION_LIMIT = 2_200;
const INSTAGRAM_MEDIA_TTL_MS = 10 * 60 * 1_000;
const INSTAGRAM_STATUS_ATTEMPTS = 12;
const INSTAGRAM_STATUS_DELAY_MS = 1_500;
const INSTAGRAM_MEDIA_PATH_PREFIX = "/instagram-media/";

type ProductInstagramErrorCode =
  | "INVALID_CONFIGURATION"
  | "IMAGE_DOWNLOAD_FAILED"
  | "UNSUPPORTED_IMAGE"
  | "MEDIA_SERVER_FAILED"
  | "CONTAINER_REQUEST_FAILED"
  | "CONTAINER_PROCESSING_FAILED"
  | "PUBLISH_REQUEST_FAILED"
  | "INVALID_META_RESPONSE";

interface ProductInstagramConfiguration {
  accessToken: string;
  accountId: string;
  apiBaseUrl: string;
  apiVersion: string;
  mediaPort: number;
  mediaPublicBaseUrl: string;
}

interface StagedInstagramImage {
  buffer: Uint8Array;
  expiresAt: number;
}

export interface ProductInstagramPublishResult {
  mediaId: string;
}

export class ProductInstagramError extends Error {
  constructor(
    public readonly code: ProductInstagramErrorCode,
    public readonly publicMessage: string,
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = "ProductInstagramError";
  }
}

const stagedImages = new Map<string, StagedInstagramImage>();
let mediaServer: Server | null = null;
let mediaServerStartPromise: Promise<void> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRequiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new ProductInstagramError(
      "INVALID_CONFIGURATION",
      `${name} is missing from .env.`,
    );
  }

  return value;
}

function getInstagramApiBaseUrl() {
  const rawValue =
    process.env.INSTAGRAM_GRAPH_API_BASE_URL?.trim() ||
    "https://graph.instagram.com";

  let url: URL;

  try {
    url = new URL(rawValue);
  } catch (error) {
    throw new ProductInstagramError(
      "INVALID_CONFIGURATION",
      "INSTAGRAM_GRAPH_API_BASE_URL must be a valid HTTPS URL.",
      { cause: error },
    );
  }

  const allowedOrigins = new Set([
    "https://graph.instagram.com",
    "https://graph.facebook.com",
  ]);

  if (!allowedOrigins.has(url.origin) || url.pathname !== "/") {
    throw new ProductInstagramError(
      "INVALID_CONFIGURATION",
      "INSTAGRAM_GRAPH_API_BASE_URL must be https://graph.instagram.com or https://graph.facebook.com.",
    );
  }

  return url.origin;
}

function getInstagramMediaPublicBaseUrl() {
  const rawValue = getRequiredEnvironmentValue(
    "INSTAGRAM_MEDIA_PUBLIC_BASE_URL",
  );

  let url: URL;

  try {
    url = new URL(rawValue);
  } catch (error) {
    throw new ProductInstagramError(
      "INVALID_CONFIGURATION",
      "INSTAGRAM_MEDIA_PUBLIC_BASE_URL must be a valid public HTTPS URL.",
      { cause: error },
    );
  }

  if (url.protocol !== "https:") {
    throw new ProductInstagramError(
      "INVALID_CONFIGURATION",
      "INSTAGRAM_MEDIA_PUBLIC_BASE_URL must use HTTPS.",
    );
  }

  if (url.pathname !== "/") {
    throw new ProductInstagramError(
      "INVALID_CONFIGURATION",
      "INSTAGRAM_MEDIA_PUBLIC_BASE_URL must contain only the public HTTPS origin, without a path.",
    );
  }

  url.hash = "";
  url.search = "";
  url.pathname = INSTAGRAM_MEDIA_PATH_PREFIX;

  return url.toString();
}

function getInstagramMediaPort() {
  const rawValue = process.env.INSTAGRAM_MEDIA_PORT?.trim() || "8081";
  const port = Number(rawValue);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new ProductInstagramError(
      "INVALID_CONFIGURATION",
      "INSTAGRAM_MEDIA_PORT must be an integer between 1 and 65535.",
    );
  }

  return port;
}

function getProductInstagramConfiguration(): ProductInstagramConfiguration {
  const accountId = getRequiredEnvironmentValue("INSTAGRAM_ACCOUNT_ID");

  if (!/^\d+$/.test(accountId)) {
    throw new ProductInstagramError(
      "INVALID_CONFIGURATION",
      "INSTAGRAM_ACCOUNT_ID must be the numeric Instagram professional account ID.",
    );
  }

  const apiVersion =
    process.env.INSTAGRAM_GRAPH_API_VERSION?.trim() || "v25.0";

  if (!/^v\d+\.\d+$/.test(apiVersion)) {
    throw new ProductInstagramError(
      "INVALID_CONFIGURATION",
      "INSTAGRAM_GRAPH_API_VERSION must look like v25.0.",
    );
  }

  return {
    accessToken: getRequiredEnvironmentValue("INSTAGRAM_ACCESS_TOKEN"),
    accountId,
    apiBaseUrl: getInstagramApiBaseUrl(),
    apiVersion,
    mediaPort: getInstagramMediaPort(),
    mediaPublicBaseUrl: getInstagramMediaPublicBaseUrl(),
  };
}

export function isProductInstagramPublishingEnabled() {
  return process.env.INSTAGRAM_ENABLED?.trim().toLowerCase() === "true";
}

export function validateProductInstagramConfiguration() {
  if (isProductInstagramPublishingEnabled()) {
    getProductInstagramConfiguration();
  }
}

function getMetaErrorMessage(payload: unknown) {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return null;
  }

  for (const key of ["error_user_msg", "message", "error_user_title"]) {
    const value = payload.error[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

async function requestInstagramJson(
  configuration: ProductInstagramConfiguration,
  path: string,
  init: RequestInit,
  errorCode:
    | "CONTAINER_REQUEST_FAILED"
    | "CONTAINER_PROCESSING_FAILED"
    | "PUBLISH_REQUEST_FAILED",
  publicMessage: string,
) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    INSTAGRAM_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(
      `${configuration.apiBaseUrl}/${configuration.apiVersion}/${path}`,
      {
        ...init,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${configuration.accessToken}`,
          ...init.headers,
        },
        signal: controller.signal,
      },
    );

    const text = await response.text();
    let payload: unknown = null;

    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      const metaMessage = getMetaErrorMessage(payload);

      throw new ProductInstagramError(
        errorCode,
        metaMessage
          ? `${publicMessage} Meta: ${metaMessage}`
          : `${publicMessage} HTTP ${response.status}.`,
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ProductInstagramError) {
      throw error;
    }

    const timedOut = error instanceof Error && error.name === "AbortError";

    throw new ProductInstagramError(
      errorCode,
      timedOut
        ? `${publicMessage} The request timed out.`
        : `${publicMessage} Check the server network connection.`,
      { cause: error },
    );
  } finally {
    clearTimeout(timeout);
  }
}

function removeExpiredImages() {
  const now = Date.now();

  for (const [token, image] of stagedImages) {
    if (image.expiresAt <= now) {
      stagedImages.delete(token);
    }
  }
}

function createInstagramMediaServer(port: number) {
  return createServer((request, response) => {
    removeExpiredImages();

    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const token = requestUrl.pathname.startsWith(INSTAGRAM_MEDIA_PATH_PREFIX)
      ? requestUrl.pathname.slice(INSTAGRAM_MEDIA_PATH_PREFIX.length)
      : "";
    const image = stagedImages.get(token);

    if ((request.method !== "GET" && request.method !== "HEAD") || !image) {
      response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "public, max-age=600",
      "Content-Length": String(image.buffer.byteLength),
      "Content-Type": "image/jpeg",
      "X-Content-Type-Options": "nosniff",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    response.end(image.buffer);
  }).listen(port, "0.0.0.0");
}

async function ensureInstagramMediaServer(port: number) {
  if (mediaServer?.listening) {
    return;
  }

  if (mediaServerStartPromise) {
    await mediaServerStartPromise;
    return;
  }

  mediaServerStartPromise = new Promise<void>((resolve, reject) => {
    const server = createInstagramMediaServer(port);

    server.once("listening", () => {
      mediaServer = server;
      resolve();
    });

    server.once("error", (error) => {
      server.close();
      reject(
        new ProductInstagramError(
          "MEDIA_SERVER_FAILED",
          `Could not start the Instagram media server on port ${port}.`,
          { cause: error },
        ),
      );
    });
  }).finally(() => {
    mediaServerStartPromise = null;
  });

  await mediaServerStartPromise;
}

async function stageInstagramImage(
  configuration: ProductInstagramConfiguration,
  draft: ProductDraft,
) {
  await ensureInstagramMediaServer(configuration.mediaPort);

  let image;

  try {
    image = await downloadTelegramProductImage(draft.photo);
  } catch (error) {
    throw new ProductInstagramError(
      "IMAGE_DOWNLOAD_FAILED",
      "Could not download the product image for Instagram.",
      { cause: error },
    );
  }

  if (image.blob.type !== "image/jpeg") {
    throw new ProductInstagramError(
      "UNSUPPORTED_IMAGE",
      "Instagram requires a JPEG image. Send the product image as a Telegram Photo, not as a file.",
    );
  }

  removeExpiredImages();

  const token = `${randomBytes(24).toString("hex")}.jpg`;
  const buffer = new Uint8Array(await image.blob.arrayBuffer());

  stagedImages.set(token, {
    buffer,
    expiresAt: Date.now() + INSTAGRAM_MEDIA_TTL_MS,
  });

  return {
    imageUrl: new URL(token, configuration.mediaPublicBaseUrl).toString(),
    token,
  };
}

function formatMoney(value: string | null) {
  if (!value) {
    return "None";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function truncateCaption(value: string) {
  const characters = Array.from(value);

  if (characters.length <= INSTAGRAM_CAPTION_LIMIT) {
    return value;
  }

  return `${characters.slice(0, INSTAGRAM_CAPTION_LIMIT - 1).join("")}…`;
}

export function formatProductInstagramCaption(draft: ProductDraft) {
  const priceUnit = process.env.PRODUCT_PRICE_UNIT?.trim() || "Toman";
  const categoryLine =
    draft.type === "shoe"
      ? `\n👟 Category: ${CATEGORY_LABELS[draft.category]}`
      : "";

  return truncateCaption(`📦 ${draft.brandName} — ${draft.model}

🏷 Type: ${TYPE_LABELS[draft.type]}
🏭 Brand: ${draft.brandName}
🧩 Model: ${draft.model}${categoryLine}
👤 Gender: ${GENDER_LABELS[draft.gender]}
💰 Price: ${formatMoney(draft.price)} ${priceUnit}
🔥 Discount price: ${
    draft.discountPrice
      ? `${formatMoney(draft.discountPrice)} ${priceUnit}`
      : "None"
  }
🎨 Colors: ${draft.colors?.join(", ") || "None"}

📝 Description:
${draft.description?.trim() || "None"}`);
}

function getRequiredId(payload: unknown, publicMessage: string) {
  const id = isRecord(payload) ? payload.id : null;

  if (typeof id !== "string" || !id) {
    throw new ProductInstagramError(
      "INVALID_META_RESPONSE",
      publicMessage,
    );
  }

  return id;
}

async function createInstagramContainer(
  configuration: ProductInstagramConfiguration,
  imageUrl: string,
  caption: string,
) {
  const body = new URLSearchParams({
    caption,
    image_url: imageUrl,
  });

  const payload = await requestInstagramJson(
    configuration,
    `${configuration.accountId}/media`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
    "CONTAINER_REQUEST_FAILED",
    "Could not create the Instagram image container.",
  );

  return getRequiredId(
    payload,
    "Instagram did not return a media container ID.",
  );
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForInstagramContainer(
  configuration: ProductInstagramConfiguration,
  containerId: string,
) {
  for (let attempt = 0; attempt < INSTAGRAM_STATUS_ATTEMPTS; attempt += 1) {
    const payload = await requestInstagramJson(
      configuration,
      `${containerId}?fields=status_code,status`,
      {
        method: "GET",
      },
      "CONTAINER_PROCESSING_FAILED",
      "Could not check the Instagram image status.",
    );

    const status = isRecord(payload) ? payload.status_code : null;

    if (status === "FINISHED") {
      return;
    }

    if (status === "ERROR" || status === "EXPIRED") {
      const details = isRecord(payload) ? payload.status : null;

      throw new ProductInstagramError(
        "CONTAINER_PROCESSING_FAILED",
        typeof details === "string" && details
          ? `Instagram could not process the image. Meta: ${details}`
          : "Instagram could not process the image.",
      );
    }

    await wait(INSTAGRAM_STATUS_DELAY_MS);
  }

  throw new ProductInstagramError(
    "CONTAINER_PROCESSING_FAILED",
    "Instagram did not finish processing the image in time.",
  );
}

async function publishInstagramContainer(
  configuration: ProductInstagramConfiguration,
  containerId: string,
) {
  const body = new URLSearchParams({
    creation_id: containerId,
  });

  const payload = await requestInstagramJson(
    configuration,
    `${configuration.accountId}/media_publish`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
    "PUBLISH_REQUEST_FAILED",
    "Could not publish the Instagram post.",
  );

  return getRequiredId(payload, "Instagram did not return a published media ID.");
}

export function getProductInstagramPublicMessage(error: unknown) {
  if (error instanceof ProductInstagramError) {
    return error.publicMessage;
  }

  return "The Instagram post failed unexpectedly.";
}

export async function publishProductToInstagram(
  draft: ProductDraft,
): Promise<ProductInstagramPublishResult> {
  const configuration = getProductInstagramConfiguration();
  const stagedImage = await stageInstagramImage(configuration, draft);

  try {
    const containerId = await createInstagramContainer(
      configuration,
      stagedImage.imageUrl,
      formatProductInstagramCaption(draft),
    );

    await waitForInstagramContainer(configuration, containerId);

    return {
      mediaId: await publishInstagramContainer(configuration, containerId),
    };
  } finally {
    stagedImages.delete(stagedImage.token);
  }
}
