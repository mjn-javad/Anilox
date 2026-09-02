import { Composer } from "grammy";

import type { AppContext } from "../../types/context.js";
import { isProductAdmin } from "./product-upload.auth.js";

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

  await ctx.conversation.enter("productUploadConversation");
});
