import type { Bot, Context } from "grammy";

import { userModule } from "../modules/user/user.module.js";

import type { AppContext } from "../types/context.js";

import { productUploadModule } from "../modules/product-upload/product-upload.module.js";
// import { registrationModuleHandle } from "../modules/registration/handlers/registration-text.handler.js";

export function registerModules(bot: Bot<AppContext>) {
  bot.use(userModule);
  bot.use(productUploadModule);
  // bot.use(registrationModuleHandle);
}
