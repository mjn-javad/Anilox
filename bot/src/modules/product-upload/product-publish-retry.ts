import { randomBytes } from "node:crypto";

import { InlineKeyboard } from "grammy";

import type { AppContext } from "../../types/context.js";
import {
  PRODUCT_SITE_LABELS,
  getProductBackendPublicMessage,
  productBackendApi,
} from "./product-backend.api.js";
import { isProductAdmin } from "./product-upload.auth.js";
import type {
  ProductDraft,
  ProductSiteId,
  ProductSitePublishResult,
} from "./product.types.js";

const RETRY_CALLBACK_PREFIX = "product-retry";
const RETRY_TTL_MS = 24 * 60 * 60 * 1_000;

interface PendingPublication {
  draft: ProductDraft;
  expiresAt: number;
  ownerId: number;
  pendingSites: Set<ProductSiteId>;
}

const pendingPublications = new Map<string, PendingPublication>();

function removeExpiredPublications() {
  const now = Date.now();

  for (const [token, publication] of pendingPublications) {
    if (publication.expiresAt <= now) {
      pendingPublications.delete(token);
    }
  }
}

function createRetryKeyboard(token: string, sites: Iterable<ProductSiteId>) {
  const keyboard = new InlineKeyboard();

  for (const site of sites) {
    keyboard
      .text(
        `🔄 انتشار در ${PRODUCT_SITE_LABELS[site]}`,
        `${RETRY_CALLBACK_PREFIX}:${token}:${site}`,
      )
      .row();
  }

  return keyboard;
}

export function queueProductPublicationRetry(
  ownerId: number,
  draft: ProductDraft,
  results: readonly ProductSitePublishResult[],
) {
  removeExpiredPublications();

  const pendingSites = results
    .filter((result) => result.status === "brand_missing")
    .map((result) => result.site);

  if (pendingSites.length === 0) {
    return null;
  }

  const token = randomBytes(12).toString("hex");

  pendingPublications.set(token, {
    draft,
    expiresAt: Date.now() + RETRY_TTL_MS,
    ownerId,
    pendingSites: new Set(pendingSites),
  });

  return createRetryKeyboard(token, pendingSites);
}

export function getMissingBrandInstruction(
  draft: ProductDraft,
  result: ProductSitePublishResult,
) {
  return `⚠️ برند «${draft.brandName}» در سایت ${PRODUCT_SITE_LABELS[result.site]} وجود ندارد.
لطفاً ابتدا این برند را در سایت ${PRODUCT_SITE_LABELS[result.site]} اضافه کنید و سپس دکمهٔ تلاش مجدد را بزنید.`;
}

export async function handleProductPublicationRetry(ctx: AppContext) {
  const callbackData = ctx.callbackQuery?.data;
  const match = callbackData?.match(
    /^product-retry:([a-f0-9]{24}):(anilox|ebraha)$/,
  );

  if (!match) {
    return;
  }

  await ctx.answerCallbackQuery();
  removeExpiredPublications();

  const [, token, rawSite] = match;
  const site = rawSite as ProductSiteId;
  const publication = token ? pendingPublications.get(token) : undefined;

  if (!publication || publication.expiresAt <= Date.now()) {
    await ctx.reply("⌛ این درخواست منقضی شده است. لطفاً محصول را دوباره ثبت کنید.");
    return;
  }

  if (
    !ctx.from ||
    publication.ownerId !== ctx.from.id ||
    !isProductAdmin(ctx.from.id)
  ) {
    await ctx.reply("⛔ شما اجازهٔ تلاش مجدد برای این محصول را ندارید.");
    return;
  }

  if (!publication.pendingSites.has(site)) {
    await ctx.reply(`✅ این محصول قبلاً در ${PRODUCT_SITE_LABELS[site]} منتشر شده است.`);
    return;
  }

  await ctx.reply(`⏳ بررسی برند و انتشار دوباره در ${PRODUCT_SITE_LABELS[site]}...`);

  try {
    const [result] = await productBackendApi.createProduct(publication.draft, [
      site,
    ]);

    if (!result) {
      await ctx.reply("❌ نتیجه‌ای از سرویس انتشار دریافت نشد.");
      return;
    }

    if (result.status === "created") {
      publication.pendingSites.delete(site);

      if (publication.pendingSites.size === 0) {
        pendingPublications.delete(token!);
      }

      await ctx.reply(
        `✅ محصول در ${PRODUCT_SITE_LABELS[site]} منتشر شد.\nشناسه: ${result.id ?? "برگردانده نشد"}`,
      );

      if (publication.pendingSites.size === 0) {
        await ctx.editMessageReplyMarkup().catch(() => {});
      } else {
        await ctx
          .editMessageReplyMarkup({
            reply_markup: createRetryKeyboard(token!, publication.pendingSites),
          })
          .catch(() => {});
      }

      return;
    }

    if (result.status === "brand_missing") {
      await ctx.reply(getMissingBrandInstruction(publication.draft, result));
      return;
    }

    await ctx.reply(
      `❌ انتشار در ${PRODUCT_SITE_LABELS[site]} ناموفق بود.\n${result.message ?? "خطای نامشخص"}`,
    );
  } catch (error) {
    await ctx.reply(`❌ ${getProductBackendPublicMessage(error)}`);
  }
}
