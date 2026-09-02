import type { MiddlewareFn } from "grammy";

export const timingMiddleware: MiddlewareFn = async (ctx, next) => {
  const start = Date.now();

  try {
    await next();
  } finally {
    const duration = Date.now() - start;

    console.log(`Update ${ctx.update.update_id}: ${duration}ms`);
  }
};
