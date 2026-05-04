import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { LANGUAGES } from "./config/i18n/i18n";

const services = defineCollection({
  loader: glob ({
    base: ".src/content/services",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, "")
  }),
  
  schema: ({ image }) => 
    z.object({

    })
})

const projects = defineCollection({
  loader: glob({
    base: "./src/content/projects",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, "")
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

export const collections = {
  projects, 
  services
};