import { en } from "./en/index";
import { bg } from "./bg/index";
import type { Language } from "../../config/i18n/i18n";
import { DEFAULT_LANGUAGE } from "../../config/i18n/i18n";

export type DeepString<T> = {
  [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string;
};

export type TranslationSchema = DeepString<typeof bg>;

const translations = { en, bg } as const satisfies Record<
  Language,
  TranslationSchema
>;

export function getTranslations(language: Language): TranslationSchema {
  return translations[language] ?? translations[DEFAULT_LANGUAGE];
}

export function getPageTranslations<K extends keyof TranslationSchema>(
  language: Language,
  page: K,
): TranslationSchema[K] {
  return getTranslations(language)[page];
}
