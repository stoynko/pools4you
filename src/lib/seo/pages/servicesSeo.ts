import { defineSeo } from "../../../config/pages/pageSeo";

export const servicesSeo = defineSeo({
  bg: {
    title: "Проектиране, изграждане и поддръжка на басейни | Pools4You",
    description:
      "Pools4You предлага цялостни услуги по проектиране, дизайн, изграждане, оборудване и поддръжка на басейни, СПА и уелнес пространства, съобразени с изискванията на всеки обект.",
    ogType: "website",
    ogImage: {
      src: "/images/seo/services-og.jpg",
      alt: "Услуги от Pools4You за басейни, СПА и уелнес зони",
      width: 1200,
      height: 630,
      type: "image/jpeg",
    },
  },
  en: {
    title: "Services | Pool Design, Construction and Maintenance | Pools4You",
    description:
      "Pools4You provides end-to-end services for the design, construction, equipment and maintenance of swimming pools, SPA facilities and wellness spaces tailored to each project.",
    ogType: "website",
    ogImage: {
      src: "/images/seo/services-og.jpg",
      alt: "Pools4You services for swimming pools, SPA and wellness areas",
      width: 1200,
      height: 630,
      type: "image/jpeg",
    },
  },
});
