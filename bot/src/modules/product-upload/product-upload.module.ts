import { Composer, InlineKeyboard } from "grammy";

import type { AppContext } from "../../types/context.js";
import { isProductAdmin } from "./product-upload.auth.js";
import { getProductMiniAppLaunchUrl } from "./product-mini-app.js";
import { handleProductPublicationRetry } from "./product-publish-retry.js";

export const productUploadModule = new Composer<AppContext>();

productUploadModule.command("addproduct", async (ctx) => {
  const userId = ctx.from?.id;

  if (!userId || !isProductAdmin(userId)) {
    await ctx.reply("⛔ دسترسی به این بخش مجاز نیست.");
    return;
  }

  if (ctx.chat.type !== "private") {
    await ctx.reply("آپلود محصول را در گفت‌وگوی خصوصی ربات انجام دهید.");
    return;
  }

  const miniAppUrl = getProductMiniAppLaunchUrl(userId);

  if (!miniAppUrl) {
    await ctx.conversation.enter("productUploadConversation");
    return;
  }

  const keyboard = new InlineKeyboard()
    .text("🧭 Guided Upload in Bot", "product-upload:start")
    .row()
    .webApp("⚡ Quick Upload Mini App", miniAppUrl);

  await ctx.reply("Choose how you want to add the product:", {
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
