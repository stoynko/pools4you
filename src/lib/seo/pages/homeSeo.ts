import { defineSeo } from "../../../config/pages/helpers";

export const homeSeo = defineSeo({
  bg: {
    title: "Басейни, СПА, уелнес и водни атракции | Pools4You",
    description:
      "Pools4You предлага професионално проектиране, изграждане и поддръжка на басейни, СПА и уелнес зони, както и решения за водни атракции за частни и обществени обекти.",
    ogType: "website",
    ogImage: {
      src: "/images/seo/home-og.jpg",
      alt: "Pools4You - басейни, СПА, уелнес и водни атракции",
      width: 1200,
      height: 630,
      type: "image/jpeg",
    },
  },
  en: {
    title: "Swimming Pools, SPA, Wellness and Water Attractions | Pools4You",
    description:
      "Pools4You delivers professional design, construction and maintenance of swimming pools, SPA and wellness areas, as well as tailored water attraction solutions for private and public projects.",
    ogType: "website",
    ogImage: {
      src: "/images/seo/home-og.jpg",
      alt: "Pools4You - swimming pools, SPA, wellness and water attractions",
      width: 1200,
      height: 630,
      type: "image/jpeg",
    },
  },
});