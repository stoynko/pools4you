import type { Language } from "../i18n/i18n";
import type { PageSeo } from "./pageTypes";

// * A HELPER FUNCTION TO DEFINE SEO DATA WITH TYPE SAFETY. */
export function defineSeo(seo: Record<Language, PageSeo>) {
  return seo;
}