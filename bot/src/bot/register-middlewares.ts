import type { Bot } from "grammy";

import type { AppContext } from "../types/context.js";

import { sessionMiddleware } from "../middlewares/session.middleware.js";

import { loggerMiddleware } from "../middlewares/logger.middleware.js";

import { timingMiddleware } from "../middlewares/timing.middleware.js";
import { i18n } from "../i18n/i18n.js";

export function registerMiddlewares(bot: Bot<AppContext>) {
  bot.use(loggerMiddleware);

  bot.use(timingMiddleware);

  bot.use(sessionMiddleware);

  bot.use(i18n);
}
