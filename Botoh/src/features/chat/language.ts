export type Language = "en" | "es" | "fr" | "tr" | "pt";

export const DEFAULT_LANGUAGE: Language =
  (process.env.LANGUAGE as Language) ?? "pt";

export function isSupportedLanguage(language: string): language is Language {
  return ["en", "es", "fr", "tr", "pt"].includes(language);
}
