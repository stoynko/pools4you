import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { LANGUAGES } from "./config/i18n/i18n";

const projects = defineCollection({
  loader: glob({
    base: "./src/content/projects",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ""),
  }),

  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      location: z.string(),
      client: z.string(),
      language: z.enum(LANGUAGES),
      slug: z.string(),
      translationKey: z.string(),

      heroImage: image(),
      thumbnailImage: image(),
      gallery: z.array(image()).default([]),

      relatedProjects: z.array(z.string()).default([]),

      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),

      isFeatured: z.boolean().default(false),
      featuredQuote: z.string().optional(),
      featuredExcerpt: z.string().optional(),
    }),
});

const facilitiesPages = defineCollection({
  loader: glob({
    base: "./src/content/facilitiesPages",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ""),
  }),

  schema: z.object({
    title: z.string(),
    description: z.string(),
    language: z.enum(LANGUAGES),
    benefits: z.array(z.string()).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

const facilities = defineCollection({
  loader: glob({
    base: "./src/content/facilities",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ""),
  }),

  schema: z.object({
    title: z.string(),
    description: z.string(),
    language: z.enum(LANGUAGES),
    slug: z.string(),
    translationKey: z.string(),

    order: z.number().default(0),
    cardTitle: z.string().optional(),

    heroImageKey: z.string().optional(),
    heroImageAlt: z.string().optional(),
    heroImagePosition: z.string().default("object-center"),

    featureCards: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageKey: z.string(),
          imageAlt: z.string(),
        }),
      )
      .default([]),

    contentSections: z
    .array(
      z.object({
        type: z.enum(["cards", "text"]),
        title: z.string(),
        text: z.string().optional(),
      }),
    )
    .default([]),

    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = {
  projects,
  facilitiesPages,
  facilities,
};