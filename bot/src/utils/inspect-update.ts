import type { Context } from "grammy";

export function inspectUpdate(ctx: Context) {
  console.log("\n==============================");
  console.log("NEW TELEGRAM UPDATE");
  console.log("==============================");

  console.log("Update ID:", ctx.update.update_id);

  console.log("User:", {
    id: ctx.from?.id,
    username: ctx.from?.username,
    firstName: ctx.from?.first_name,
  });

  console.log("Chat:", {
    id: ctx.chat?.id,
    type: ctx.chat?.type,
  });

  console.log("Message ID:", ctx.msgId);

  console.log("\nRAW UPDATE:");

  console.dir(ctx, {
    depth: null,
    colors: true,
  });

  console.log("==============================\n");
}
