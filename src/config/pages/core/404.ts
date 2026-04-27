import { defineSeo } from "../helpers";
import type { PageDefinition } from "../pageDefinition";

export const notFoundPage = {
  key: "notFound",
  paths: {
    bg: "/404",
    en: "/en/404",
  },
  template: "notFound",
  seo: defineSeo({
    bg: {
      title: "404 | Страницата не е намерена",
      description: "Страницата, която търсите, не съществува или е била преместена.",
      noIndex: true,
    },
    en: {
      title: "404 | Page not found",
      description: "The page you are looking for does not exist or has been moved.",
      noIndex: true,
    },
  }),
} as const satisfies PageDefinition<"notFound">;