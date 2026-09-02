import type { MiddlewareFn } from "grammy";

export const loggerMiddleware: MiddlewareFn = async (ctx, next) => {
  const startedAt = performance.now();

  console.log(`[UPDATE] id=${ctx.update.update_id}`);

  console.log({
    userId: ctx.from?.id,
    username: ctx.from?.username,
    chatId: ctx.chatId,
    chatType: ctx.chat?.type,
  });

  await next();

  const duration = performance.now() - startedAt;

  console.log(`[DONE] update=${ctx.update.update_id} ${duration.toFixed(2)}ms`);
};
