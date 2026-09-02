import "dotenv/config";

import { Bot, GrammyError, HttpError } from "grammy";

import { registerMiddlewares } from "./bot/register-middlewares.js";
import { registerModules } from "./bot/register-module.js";
import { setupCommands } from "./bot/setup-commands.js";
import type { AppContext } from "./types/context.js";
import { registerConversations } from "./bot/register-conversations.js";
import { AppError } from "./errors/app-error.js";
import { hydrateFiles } from "@grammyjs/files";

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new Bot<AppContext>(token);
setupCommands(bot);
bot.api.config.use(hydrateFiles(bot.token));
registerMiddlewares(bot);
registerConversations(bot);
registerModules(bot);

bot.catch(async (err) => {
  const error = err.error;
  const ctx = err.ctx;

  console.error("Bot update failed", {
    updateId: ctx.update.update_id,
    userId: ctx.from?.id,
    chatId: ctx.chat?.id,
    error,
  });

  try {
    if (error instanceof AppError) {
      await ctx.reply(error.userMessage);
      return;
    }

    if (error instanceof GrammyError) {
      console.error("Telegram API Error:", error.description);
    } else if (error instanceof HttpError) {
      console.error("Network Error:", error);
    } else {
      console.error("Unknown Error:", error);
    }

    await ctx.reply("❌ خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کن.");
  } catch (replyError) {
    console.error("Could not send error response:", replyError);
  }
});

bot.start();

console.log("🤖 Bot is running...");
