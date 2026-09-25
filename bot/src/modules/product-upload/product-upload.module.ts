import { Composer, InlineKeyboard } from "grammy";

import type { AppContext } from "../../types/context.js";
import { isProductAdmin } from "./product-upload.auth.js";
import { getProductMiniAppUrl } from "./product-mini-app.js";
import { handleProductPublicationRetry } from "./product-publish-retry.js";

export const productUploadModule = new Composer<AppContext>();

productUploadModule.command("addproduct", async (ctx) => {
  if (!isProductAdmin(ctx.from?.id)) {
    await ctx.reply("⛔ دسترسی به این بخش مجاز نیست.");
    return;
  }

  if (ctx.chat.type !== "private") {
    await ctx.reply("آپلود محصول را در گفت‌وگوی خصوصی ربات انجام دهید.");
    return;
  }

  const miniAppUrl = getProductMiniAppUrl();

  if (!miniAppUrl) {
    await ctx.conversation.enter("productUploadConversation");
    return;
  }

  const keyboard = new InlineKeyboard()
    .text("🧭 آپلود مرحله‌ای در بات", "product-upload:start")
    .row()
    .webApp("⚡ مینی‌اپ آپلود سریع", miniAppUrl);

  await ctx.reply("روش ثبت محصول را انتخاب کنید:", {
    reply_markup: keyboard,
  });
});

productUploadModule.callbackQuery("product-upload:start", async (ctx) => {
  await ctx.answerCallbackQuery();

  if (!isProductAdmin(ctx.from?.id) || ctx.chat?.type !== "private") {
    await ctx.reply("⛔ دسترسی به این بخش مجاز نیست.");
    return;
  }

  await ctx.conversation.enter("productUploadConversation");
});

productUploadModule.callbackQuery(/^product-retry:/, handleProductPublicationRetry);
