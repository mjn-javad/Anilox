import assert from "node:assert/strict";
import test from "node:test";

import {
  createProductMiniAppLaunchToken,
  getRequestedDestinations,
  getProductMiniAppLaunchUrl,
  parseProductMiniAppLaunchToken,
} from "./product-mini-app.js";

const originalEnvironment = {
  adminId: process.env.ADMIN_ID,
  botToken: process.env.BOT_TOKEN,
  miniAppPublicUrl: process.env.MINI_APP_PUBLIC_URL,
};

test.beforeEach(() => {
  process.env.ADMIN_ID = "42";
  process.env.BOT_TOKEN = "123456:test-token";
  process.env.MINI_APP_PUBLIC_URL = "https://example.com/product-upload/";
});

test.after(() => {
  process.env.ADMIN_ID = originalEnvironment.adminId;
  process.env.BOT_TOKEN = originalEnvironment.botToken;
  process.env.MINI_APP_PUBLIC_URL = originalEnvironment.miniAppPublicUrl;
});

test("creates an authenticated Mini App URL for the requesting admin", () => {
  const url = new URL(getProductMiniAppLaunchUrl(42) ?? "");
  const token = url.searchParams.get("launch");

  assert.equal(url.origin, "https://example.com");
  assert.equal(url.pathname, "/product-upload/");
  assert.ok(token);
  assert.equal(parseProductMiniAppLaunchToken(token), 42);
});

test("rejects tampered and expired Mini App launch tokens", () => {
  const token = createProductMiniAppLaunchToken(42, 1_000);
  const tampered = `${token.slice(0, -1)}${token.endsWith("0") ? "1" : "0"}`;

  assert.throws(() => parseProductMiniAppLaunchToken(tampered, 1_001));
  assert.throws(() => parseProductMiniAppLaunchToken(token, 87_400));
});

test("retries every failed publication destination without duplicating successes", () => {
  const form = new FormData();
  form.append("destinations", "anilox");
  form.append("destinations", "ebraha");
  form.append("targets", "telegram");
  form.append("targets", "instagram");

  assert.deepEqual(getRequestedDestinations(form), ["telegram", "instagram"]);
});
