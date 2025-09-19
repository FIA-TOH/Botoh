export type Language = "en" | "es" | "fr" | "tr" | "pt";

export const DEFAULT_LANGUAGE: Language =
  (process.env.LANGUAGE as Language) ?? "pt";
