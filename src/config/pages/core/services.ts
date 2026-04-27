import type { PageDefinition } from "../pageTypes";
import { servicesSeo } from "../../../lib/seo/pages/servicesSeo";

export const servicesPage = {
  key: "services",
  paths: { bg: "/uslugi", en: "/en/services" },
  template: "services",
  seo: servicesSeo,
} as const satisfies PageDefinition<"services">;
