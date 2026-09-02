import { fileURLToPath } from "node:url";

import { I18n } from "@grammyjs/i18n";

import type { AppContext } from "../types/context.js";

import { DEFAULT_LOCALE, normalizeLocale } from "./supported-locales.js";

const localesDirectory = fileURLToPath(new URL("./locales", import.meta.url));

export const i18n = new I18n<AppContext>({
  defaultLocale: DEFAULT_LOCALE,

  directory: localesDirectory,

  localeNegotiator: (ctx) => {
    const telegramUser = ctx.from;

    if (!telegramUser) {
      return DEFAULT_LOCALE;
    }

    return normalizeLocale(telegramUser.language_code);
  },

  fluentBundleOptions: {
    useIsolating: false,
  },
});
