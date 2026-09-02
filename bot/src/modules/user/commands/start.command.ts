import type { CommandContext } from "grammy";

import type { AppContext } from "../../../types/context.js";

export async function startCommand(ctx: CommandContext<AppContext>) {
  const user = ctx.from;

  if (!user) {
    return;
  }

  await ctx.reply(
    ctx.t("start-welcome", {
      name: user.first_name,
    }),
  );
}
