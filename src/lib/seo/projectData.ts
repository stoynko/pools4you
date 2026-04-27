import type { CollectionEntry } from "astro:content";

type ProjectEntry = CollectionEntry<"projects">;

type CreateProjectStructuredDataParams = {
  project: ProjectEntry;
  projectUrl: string;
  heroImageUrl: string;
  baseUrl: string;
};

export function createProjectStructuredData({
  project,
  projectUrl,
  heroImageUrl,
  baseUrl,
}: CreateProjectStructuredDataParams) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: project.data.title,
    description: project.data.seoDescription ?? project.data.description,
    image: heroImageUrl,
    datePublished: project.data.date.toISOString(),
    dateModified: project.data.date.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": projectUrl,
    },
    author: {
      "@type": "Organization",
      name: "Pools4You",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Pools4You",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon.svg`,
      },
    },
  };
}