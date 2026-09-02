import type { Bot } from "grammy";

import { conversations, createConversation } from "@grammyjs/conversations";

import { productUploadConversation } from "../modules/product-upload/product-upload.conversation.js";
import type { AppContext } from "../types/context.js";

export function registerConversations(bot: Bot<AppContext>) {
  bot.use(conversations());
  bot.use(createConversation(productUploadConversation));
}
