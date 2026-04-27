import type { PageDefinition } from "../pageTypes";
import { aboutSeo } from "../../../lib/seo/pages/aboutSeo";

export const aboutPage = {
  key: "about",
  paths: { bg: "/za-nas", en: "/en/about" },
  template: "about",
  seo: aboutSeo,
} as const satisfies PageDefinition<"about">;
