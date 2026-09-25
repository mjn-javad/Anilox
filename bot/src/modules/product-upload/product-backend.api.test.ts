import assert from "node:assert/strict";
import test from "node:test";

import { productBackendApi } from "./product-backend.api.js";
import type { ProductData } from "./product.types.js";

const originalFetch = globalThis.fetch;

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function configureTestEnvironment() {
  process.env.ANILOX_BRAND_API_URL = "https://anilox.test/brands";
  process.env.ANILOX_PRODUCT_API_URL = "https://anilox.test/products";
  process.env.EBRAHA_BRAND_API_URL = "https://ebraha.test/brands";
  process.env.EBRAHA_PRODUCT_API_URL = "https://ebraha.test/products";
  process.env.TELEGRAM_BOT_SERVICE_KEY = "a".repeat(32);
}

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("merges brand catalogs and preserves the slug for each website", async () => {
  configureTestEnvironment();
  globalThis.fetch = async (input) => {
    const url = String(input);

    if (url.includes("anilox.test")) {
      return jsonResponse({
        success: true,
        data: [
          { name: "Gucci", slug: "gucci-anilox" },
          { name: "Prada", slug: "prada" },
        ],
      });
    }

    return jsonResponse({
      success: true,
      data: [
        { name: "GUCCI", slug: "gucci-ebraha" },
        { name: "Dior", slug: "dior" },
      ],
    });
  };

  const catalog = await productBackendApi.getBrands();

  assert.deepEqual(
    catalog.brands.map((brand) => brand.name),
    ["Dior", "Gucci", "Prada"],
  );

  const gucci = catalog.brands.find(
    (brand) => brand.name.toLowerCase() === "gucci",
  );

  assert.deepEqual(gucci?.siteSlugs, {
    anilox: "gucci-anilox",
    ebraha: "gucci-ebraha",
  });
});

test("publishes one multipart product to both websites with the shared key", async () => {
  configureTestEnvironment();
  const received: Array<{ brand: FormDataEntryValue | null; key: string | null }> = [];

  globalThis.fetch = async (input, init) => {
    const body = init?.body;
    assert.ok(body instanceof FormData);
    received.push({
      brand: body.get("brand"),
      key: new Headers(init?.headers).get("X-Telegram-Bot-Key"),
    });

    return jsonResponse({
      success: true,
      data: { productId: String(input).includes("anilox") ? 10 : 20 },
    }, 201);
  };

  const product: ProductData = {
    type: "shoe",
    brand: "gucci-anilox",
    brandName: "Gucci",
    brandSlugs: {
      anilox: "gucci-anilox",
      ebraha: "gucci-ebraha",
    },
    model: "G1",
    category: "sneaker",
    gender: "genderless",
    price: "100.00",
    discountPrice: null,
    description: null,
    colors: ["Black"],
  };
  const results = await productBackendApi.createProductFromImages(product, [
    {
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" }),
      filename: "product.jpg",
    },
  ]);

  assert.deepEqual(
    results.map((result) => [result.site, result.status, result.id]),
    [
      ["anilox", "created", "10"],
      ["ebraha", "created", "20"],
    ],
  );
  assert.deepEqual(
    received.map((request) => request.brand),
    ["gucci-anilox", "gucci-ebraha"],
  );
  assert.ok(received.every((request) => request.key === "a".repeat(32)));
});

test("reports a missing brand without duplicating the successful website", async () => {
  configureTestEnvironment();
  let productPostCount = 0;

  globalThis.fetch = async (input, init) => {
    const url = String(input);

    if (init?.method === "POST") {
      productPostCount += 1;
      return jsonResponse({ success: true, data: { productId: 10 } }, 201);
    }

    assert.equal(url, "https://ebraha.test/brands");
    return jsonResponse({
      success: true,
      data: [{ name: "Dior", slug: "dior" }],
    });
  };

  const product: ProductData = {
    type: "bag",
    brand: "gucci",
    brandName: "Gucci",
    brandSlugs: { anilox: "gucci" },
    model: "B1",
    category: "other",
    gender: "female",
    price: "100.00",
    discountPrice: null,
    description: null,
    colors: ["Red"],
  };
  const results = await productBackendApi.createProductFromImages(product, [
    {
      blob: new Blob([new Uint8Array([1])], { type: "image/jpeg" }),
      filename: "bag.jpg",
    },
  ]);

  assert.equal(productPostCount, 1);
  assert.deepEqual(
    results.map((result) => [result.site, result.status]),
    [
      ["anilox", "created"],
      ["ebraha", "brand_missing"],
    ],
  );
});

test("publishes only to the website selected by the user", async () => {
  configureTestEnvironment();
  const requestedUrls: string[] = [];

  globalThis.fetch = async (input) => {
    requestedUrls.push(String(input));
    return jsonResponse({ success: true, data: { productId: 42 } }, 201);
  };

  const product: ProductData = {
    type: "watch",
    brand: "omega-anilox",
    brandName: "Omega",
    brandSlugs: {
      anilox: "omega-anilox",
      ebraha: "omega-ebraha",
    },
    model: "O1",
    category: "other",
    gender: "genderless",
    price: "100.00",
    discountPrice: null,
    description: null,
    colors: ["Silver"],
  };
  const results = await productBackendApi.createProductFromImages(
    product,
    [
      {
        blob: new Blob([new Uint8Array([1])], { type: "image/jpeg" }),
        filename: "watch.jpg",
      },
    ],
    ["ebraha"],
  );

  assert.deepEqual(requestedUrls, ["https://ebraha.test/products"]);
  assert.deepEqual(
    results.map((result) => result.site),
    ["ebraha"],
  );
});
