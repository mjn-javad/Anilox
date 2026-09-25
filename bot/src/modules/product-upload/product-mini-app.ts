import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import type { Api } from "grammy";

import {
  PRODUCT_SITE_IDS,
  getProductBackendPublicMessage,
  productBackendApi,
} from "./product-backend.api.js";
import {
  getProductChannelPublicMessage,
  publishUploadedProductToChannel,
} from "./product-channel.js";
import {
  getProductInstagramPublicMessage,
  publishUploadedProductToInstagram,
} from "./product-instagram.js";
import { isProductAdmin } from "./product-upload.auth.js";
import type {
  ProductData,
  ProductImageUpload,
  ProductPublishDestination,
  ProductSiteId,
} from "./product.types.js";
import {
  normalizeProductData,
  validateCategory,
  validateGender,
  validateType,
} from "./product.validation.js";
import { ProductUploadError } from "./product-upload.error.js";

const DEFAULT_MINI_APP_PATH = "/product-upload";
const MAX_REQUEST_BYTES = 105 * 1024 * 1024;
const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;
const PUBLISH_DESTINATIONS: readonly ProductPublishDestination[] = [
  "anilox",
  "ebraha",
  "telegram",
  "instagram",
];

interface MiniAppPublishResult {
  destination: ProductPublishDestination;
  status: "created" | "brand_missing" | "failed";
  id: string | null;
  message: string | null;
}

const assetFiles = {
  "": { file: "mini-app/index.html", contentType: "text/html; charset=utf-8" },
  "/": { file: "mini-app/index.html", contentType: "text/html; charset=utf-8" },
  "/app.js": {
    file: "mini-app/app.js",
    contentType: "text/javascript; charset=utf-8",
  },
  "/styles.css": {
    file: "mini-app/styles.css",
    contentType: "text/css; charset=utf-8",
  },
} as const;

class MiniAppRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly publicMessage: string,
  ) {
    super(publicMessage);
    this.name = "MiniAppRequestError";
  }
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(payload));
}

function getBotToken() {
  const token = process.env.BOT_TOKEN?.trim();

  if (!token) {
    throw new MiniAppRequestError(500, "BOT_TOKEN is missing.");
  }

  return token;
}

function getMiniAppPort() {
  const rawPort = process.env.MINI_APP_PORT?.trim() || "8082";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("MINI_APP_PORT must be an integer between 1 and 65535.");
  }

  return port;
}

export function getProductMiniAppUrl() {
  const rawUrl = process.env.MINI_APP_PUBLIC_URL?.trim();

  if (!rawUrl) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("MINI_APP_PUBLIC_URL must be a valid URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("MINI_APP_PUBLIC_URL must use HTTPS for Telegram.");
  }

  url.hash = "";
  url.search = "";
  return url.toString();
}

function getMiniAppPath() {
  const publicUrl = getProductMiniAppUrl();

  if (!publicUrl) {
    return DEFAULT_MINI_APP_PATH;
  }

  const pathname = new URL(publicUrl).pathname.replace(/\/+$/, "");
  return pathname || DEFAULT_MINI_APP_PATH;
}

function parseTelegramUser(initData: string) {
  const parameters = new URLSearchParams(initData);
  const providedHash = parameters.get("hash");

  if (!providedHash || !/^[a-f0-9]{64}$/i.test(providedHash)) {
    throw new MiniAppRequestError(401, "Telegram Mini App authentication is missing.");
  }

  parameters.delete("hash");
  const dataCheckString = [...parameters.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData")
    .update(getBotToken())
    .digest();
  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest();
  const providedHashBuffer = Buffer.from(providedHash, "hex");

  if (
    providedHashBuffer.length !== expectedHash.length ||
    !timingSafeEqual(providedHashBuffer, expectedHash)
  ) {
    throw new MiniAppRequestError(401, "Telegram Mini App authentication is invalid.");
  }

  const authDate = Number(parameters.get("auth_date"));
  const nowSeconds = Math.floor(Date.now() / 1_000);

  if (
    !Number.isInteger(authDate) ||
    authDate > nowSeconds + 300 ||
    nowSeconds - authDate > MAX_INIT_DATA_AGE_SECONDS
  ) {
    throw new MiniAppRequestError(401, "Telegram Mini App authentication has expired.");
  }

  const rawUser = parameters.get("user");

  if (!rawUser) {
    throw new MiniAppRequestError(401, "Telegram user information is missing.");
  }

  let user: unknown;

  try {
    user = JSON.parse(rawUser) as unknown;
  } catch {
    throw new MiniAppRequestError(401, "Telegram user information is invalid.");
  }

  if (
    typeof user !== "object" ||
    user === null ||
    !("id" in user) ||
    typeof user.id !== "number"
  ) {
    throw new MiniAppRequestError(401, "Telegram user ID is invalid.");
  }

  if (!isProductAdmin(user.id)) {
    throw new MiniAppRequestError(403, "You are not allowed to upload products.");
  }

  return user.id;
}

function authenticateRequest(request: IncomingMessage) {
  const initData = request.headers["x-telegram-init-data"];

  if (typeof initData !== "string") {
    throw new MiniAppRequestError(401, "Open this page from the Telegram bot.");
  }

  return parseTelegramUser(initData);
}

async function readRequestBody(request: IncomingMessage) {
  const declaredLength = Number(request.headers["content-length"]);

  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    throw new MiniAppRequestError(413, "The uploaded photos are too large.");
  }

  const chunks: Buffer[] = [];
  let length = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += buffer.length;

    if (length > MAX_REQUEST_BYTES) {
      throw new MiniAppRequestError(413, "The uploaded photos are too large.");
    }

    chunks.push(buffer);
  }

  return new Uint8Array(Buffer.concat(chunks));
}

async function parseMultipartForm(request: IncomingMessage) {
  const contentType = request.headers["content-type"];

  if (!contentType?.toLowerCase().startsWith("multipart/form-data")) {
    throw new MiniAppRequestError(415, "Expected a multipart form upload.");
  }

  const body = await readRequestBody(request);
  const parserRequest = new Request("http://localhost/upload", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });

  try {
    return await parserRequest.formData();
  } catch {
    throw new MiniAppRequestError(400, "The upload form could not be read.");
  }
}

function getRequiredText(form: FormData, field: string) {
  const value = form.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new MiniAppRequestError(400, `${field} is required.`);
  }

  return value.trim();
}

function getOptionalText(form: FormData, field: string) {
  const value = form.get(field);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getRequestedDestinations(form: FormData) {
  const retryTargets = form
    .getAll("targets")
    .filter((value): value is string => typeof value === "string")
    .filter((value): value is ProductSiteId =>
      PRODUCT_SITE_IDS.includes(value as ProductSiteId),
    );

  if (retryTargets.length > 0) {
    return [...new Set(retryTargets)];
  }

  const requested = form
    .getAll("destinations")
    .filter((value): value is string => typeof value === "string")
    .filter((value): value is ProductPublishDestination =>
      PUBLISH_DESTINATIONS.includes(value as ProductPublishDestination),
    );

  if (requested.length === 0) {
    throw new MiniAppRequestError(
      400,
      "At least one publication destination must be selected.",
    );
  }

  return [...new Set(requested)];
}

async function createProductFromMiniApp(form: FormData, telegramApi: Api) {
  const catalog = await productBackendApi.getBrands();
  const brandName = getRequiredText(form, "brandName");
  const brand = catalog.brands.find(
    (option) =>
      option.name.trim().toLocaleLowerCase("en-US") ===
      brandName.toLocaleLowerCase("en-US"),
  );

  if (!brand) {
    throw new MiniAppRequestError(
      400,
      "The selected brand is no longer available in either website.",
    );
  }

  const primarySlug = brand.siteSlugs.anilox ?? brand.siteSlugs.ebraha;

  if (!primarySlug) {
    throw new MiniAppRequestError(400, "The selected brand has no valid slug.");
  }

  const type = validateType(getRequiredText(form, "type"));
  const category =
    type === "shoe"
      ? validateCategory(getRequiredText(form, "category"))
      : "other";
  const colors = (getOptionalText(form, "colors") ?? "")
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean);
  const product: ProductData = normalizeProductData({
    type,
    brand: primarySlug,
    brandName: brand.name,
    brandSlugs: brand.siteSlugs,
    model: getRequiredText(form, "model"),
    category,
    gender: validateGender(getRequiredText(form, "gender")),
    price: getRequiredText(form, "price"),
    discountPrice: getOptionalText(form, "discountPrice"),
    description: getOptionalText(form, "description"),
    colors,
  });
  const images: ProductImageUpload[] = form
    .getAll("images")
    .filter((value): value is File => typeof value !== "string")
    .map((file) => ({
      blob: file,
      filename: file.name || "product-image",
    }));
  const destinations = getRequestedDestinations(form);
  const websiteTargets = destinations.filter(
    (destination): destination is ProductSiteId =>
      destination === "anilox" || destination === "ebraha",
  );
  const results: MiniAppPublishResult[] = [];

  if (images.length < 1 || images.length > 10) {
    throw new MiniAppRequestError(400, "Select between 1 and 10 product photos.");
  }

  for (const image of images) {
    if (image.blob.size < 1 || image.blob.size > 10 * 1024 * 1024) {
      throw new MiniAppRequestError(
        400,
        "Each product photo must be between 1 byte and 10 MB.",
      );
    }

    if (!/^image\/(?:jpeg|png|webp|heic|heif)$/.test(image.blob.type)) {
      throw new MiniAppRequestError(400, "One of the selected files is not a supported image.");
    }
  }

  if (websiteTargets.length > 0) {
    try {
      const websiteResults = await productBackendApi.createProductFromImages(
        product,
        images,
        websiteTargets,
      );

      results.push(
        ...websiteResults.map((result) => ({
          destination: result.site,
          status: result.status,
          id: result.id,
          message: result.message,
        })),
      );
    } catch (error) {
      results.push(
        ...websiteTargets.map((destination) => ({
          destination,
          status: "failed" as const,
          id: null,
          message: getProductBackendPublicMessage(error),
        })),
      );
    }
  }

  if (destinations.includes("telegram")) {
    try {
      const published = await publishUploadedProductToChannel(
        telegramApi,
        product,
        images,
      );

      results.push({
        destination: "telegram",
        status: "created",
        id: String(published.messageId),
        message: published.messageLink,
      });
    } catch (error) {
      results.push({
        destination: "telegram",
        status: "failed",
        id: null,
        message: getProductChannelPublicMessage(error),
      });
    }
  }

  if (destinations.includes("instagram")) {
    try {
      const published = await publishUploadedProductToInstagram(product, images);

      results.push({
        destination: "instagram",
        status: "created",
        id: published.mediaId,
        message: null,
      });
    } catch (error) {
      results.push({
        destination: "instagram",
        status: "failed",
        id: null,
        message: getProductInstagramPublicMessage(error),
      });
    }
  }

  return {
    results,
    retryTargets: results
      .filter(
        (result): result is MiniAppPublishResult & { destination: ProductSiteId } =>
          result.status === "brand_missing" &&
          (result.destination === "anilox" || result.destination === "ebraha"),
      )
      .map((result) => result.destination),
  };
}

async function serveAsset(
  response: ServerResponse,
  asset: (typeof assetFiles)[keyof typeof assetFiles],
) {
  const content = await readFile(new URL(asset.file, import.meta.url));

  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' https://telegram.org",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data:",
      "connect-src 'self'",
      "frame-ancestors https://web.telegram.org https://*.telegram.org",
    ].join("; "),
    "Content-Type": asset.contentType,
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(content);
}

async function handleMiniAppRequest(
  request: IncomingMessage,
  response: ServerResponse,
  telegramApi: Api,
) {
  const miniAppPath = getMiniAppPath();
  const requestUrl = new URL(request.url ?? "/", "http://localhost");

  if (!requestUrl.pathname.startsWith(miniAppPath)) {
    response.writeHead(404).end();
    return;
  }

  const relativePath = requestUrl.pathname.slice(miniAppPath.length);

  if (request.method === "GET" && relativePath === "") {
    response.writeHead(302, { Location: `${miniAppPath}/` });
    response.end();
    return;
  }

  const asset = assetFiles[relativePath as keyof typeof assetFiles];

  if ((request.method === "GET" || request.method === "HEAD") && asset) {
    await serveAsset(response, asset);
    return;
  }

  if (request.method === "GET" && relativePath === "/api/brands") {
    authenticateRequest(request);
    const catalog = await productBackendApi.getBrands();
    sendJson(response, 200, {
      brands: catalog.brands.map((brand) => ({
        name: brand.name,
        sites: PRODUCT_SITE_IDS.filter((site) => Boolean(brand.siteSlugs[site])),
      })),
      warnings: catalog.warnings,
    });
    return;
  }

  if (request.method === "POST" && relativePath === "/api/products") {
    authenticateRequest(request);
    const result = await createProductFromMiniApp(
      await parseMultipartForm(request),
      telegramApi,
    );
    const allCreated =
      result.results.length > 0 &&
      result.results.every((item) => item.status === "created");
    sendJson(response, allCreated ? 201 : 200, result);
    return;
  }

  response.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end("Not found");
}

export function startProductMiniAppServer(telegramApi: Api) {
  const publicUrl = getProductMiniAppUrl();

  if (!publicUrl) {
    console.warn(
      "Product Mini App is disabled because MINI_APP_PUBLIC_URL is not configured.",
    );
    return null;
  }

  const port = getMiniAppPort();
  const server = createServer((request, response) => {
    handleMiniAppRequest(request, response, telegramApi).catch((error: unknown) => {
      console.error("Product Mini App request failed:", error);

      if (error instanceof MiniAppRequestError) {
        sendJson(response, error.status, { error: error.publicMessage });
        return;
      }

      if (error instanceof ProductUploadError) {
        sendJson(response, 400, { error: error.publicMessage });
        return;
      }

      sendJson(response, 500, {
        error: getProductBackendPublicMessage(error),
      });
    });
  });

  server.on("error", (error) => {
    console.error(`Could not start Product Mini App server on port ${port}:`, error);
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`Product Mini App is listening on port ${port}: ${publicUrl}`);
  });

  return server;
}
