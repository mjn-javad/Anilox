import type { Bot, Context } from "grammy";
import type { AppContext } from "../types/context.js";

export async function setupCommands(bot: Bot<AppContext>) {
  await bot.api.setMyCommands([
    {
      command: "addproduct",
      description: "Add a new product",
    },
    {
      command: "start",
      description: "Start the bot",
    },
  ]);

  await bot.api.setChatMenuButton({
    menu_button: { type: "commands" },
  });
}
