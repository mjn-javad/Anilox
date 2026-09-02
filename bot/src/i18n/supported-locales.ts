export const SUPPORTED_LOCALES = ["fa", "en", "ar"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "fa";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(
  value: string | null | undefined,
): SupportedLocale {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const normalized = value.toLowerCase().split("-")[0];

  if (normalized && isSupportedLocale(normalized)) {
    return normalized;
  }

  return DEFAULT_LOCALE;
}
