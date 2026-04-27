import { defineSeo } from "../../../config/pages/pageSeo";

export const aboutSeo = defineSeo({
  bg: {
    title: "За нас | Pools4You",
    description:
      "Научете повече за Pools4You, нашия опит, подход и ангажимент към качествени решения за басейни, СПА, уелнес зони и водни атракции за различни типове обекти.",
    ogType: "website",
    ogImage: {
      src: "/images/seo/about-og.jpg",
      alt: "За Pools4You - опит и професионални решения за басейни и СПА",
      width: 1200,
      height: 630,
      type: "image/jpeg",
    },
  },
  en: {
    title: "About Us | Pools4You",
    description:
      "Learn more about Pools4You, our experience, working approach and commitment to delivering high-quality solutions for swimming pools, SPA, wellness areas and water attractions.",
    ogType: "website",
    ogImage: {
      src: "/images/seo/about-og.jpg",
      alt: "About Pools4You - experience and professional pool and SPA solutions",
      width: 1200,
      height: 630,
      type: "image/jpeg",
    },
  },
});
