import type { Language } from "../i18n/i18n";
import { pageDefinitions } from "./pageRegistry";
import type { PageKey } from "./pageRegistry";
import type { PageSeo } from "./pageDefinition";

// * RETURNS THE LOCALIZED PATH FOR A PAGE KEY AND LANGUAGE. */
export function getPagePath(pageKey: PageKey, language: Language): string {
  const page = pageDefinitions[pageKey];

  if (!page) {
    throw new Error(
      `[getPagePath] Invalid pageKey "${String(pageKey)}". Available keys: ${Object.keys(pageDefinitions).join(", ")}`
    );
  }

  const path = page.paths[language];

  if (!path) {
    throw new Error(
      `[getPagePath] Missing path for pageKey "${String(pageKey)}" and language "${String(language)}".`
    );
  }

  return path;
}

// * NORMALIZES PATHS BY REMOVING TRAILING SLASHES WHILE KEEPING ROOT

export function normalizePath(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

// * A HELPER FUNCTION TO DEFINE SEO DATA WITH TYPE SAFETY. */
export function defineSeo(seo: Record<Language, PageSeo>) {
  return seo;
}