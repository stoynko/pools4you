import type { PageDefinition } from "../pageDefinition";
import { homeSeo } from "../../../lib/seo/pages/homeSeo";

export const homePage = {
  key: "home",
  paths: { 
    bg: "/", 
    en: "/en" 
    },
  template: "home",
  seo: homeSeo,
} as const satisfies PageDefinition<"home">;