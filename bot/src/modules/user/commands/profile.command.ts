import type { CommandContext } from "grammy";

import type { AppContext } from "../../../types/context.js";

import { normalizeLocale } from "../../../i18n/supported-locales.js";

export async function profileCommand(ctx: CommandContext<AppContext>) {
  const telegramUser = ctx.from;

  if (!telegramUser) {
    return;
  }

  const username = telegramUser.username
    ? `@${telegramUser.username}`
    : ctx.t("value-not-set");

  const locale = normalizeLocale(telegramUser.language_code);

  const language = ctx.t(`locale-${locale}`);

  const name = [telegramUser.first_name, telegramUser.last_name]
    .filter(Boolean)
    .join(" ");

  await ctx.reply(
    ctx.t("profile-message", {
      id: String(telegramUser.id),
      name,
      username,
      language,
    }),
  );
}
