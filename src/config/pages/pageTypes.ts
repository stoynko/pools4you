import type { Language } from "../i18n/i18n";

export type OpenGraphType = "website" | "article" | "video.other";

export type SeoImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
};

export type SeoVideo = {
  src: string;
  width?: number;
  height?: number;
  type?: string;
};

export type SchemaType = "organization" | "website" | "service" | "article";

export type PageSeo = {
  title: string;
  description: string;
  noIndex?: boolean;

  canonical?: string;
  alternates?: Partial<Record<Language, string>>;

  ogTitle?: string;
  ogDescription?: string;
  ogType?: OpenGraphType;
  ogImage?: SeoImage;

  schemaType?: SchemaType;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;

  media?: {
    image?: SeoImage;
    video?: SeoVideo;
  };
};

export type TemplateKey =
  | "home"
  | "services"
  | "projects"
  | "facilities"
  | "about"
  | "notFound";

export type PageDefinition<TKey extends string = string> = {
  key: TKey;
  paths: Record<Language, `/${string}`>;
  template: TemplateKey;
  seo: Record<Language, PageSeo>;
};

export function defineSeo(seo: Record<Language, PageSeo>) {
  return seo;
}