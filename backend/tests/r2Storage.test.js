const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeEndpoint,
  productImageKey,
  productImageVariantNames,
} = require("../services/r2Storage");

test("normalizes an R2 endpoint copied with a bucket path", () => {
  assert.equal(
    normalizeEndpoint(
      "https://account-id.r2.cloudflarestorage.com/aniloxhub-products",
    ),
    "https://account-id.r2.cloudflarestorage.com",
  );
});

test("uses a stable products prefix and strips unsafe path segments", () => {
  assert.equal(productImageKey("../photo-960.webp"), "products/photo-960.webp");
});

test("finds all generated variants from the stored 960 image name", () => {
  assert.deepEqual(productImageVariantNames("photo-960.webp"), [
    "photo-960.webp",
    "photo-320.webp",
    "photo-640.webp",
  ]);
});
