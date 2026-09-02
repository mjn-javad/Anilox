import type { Bot, Context } from "grammy";
import type { AppContext } from "../types/context.js";

export async function setupCommands(bot: Bot<AppContext>) {
  await bot.api.setMyCommands([
    {
      command: "start",
      description: "شروع ربات",
    },
    {
      command: "addproduct",
      description: "اضافه کردن محصول",
    },
  ]);
}
