import { header } from "./header";
import { footer } from "./footer";
import { home } from "./home";
import { services } from "./services";
import { projects } from "./projects";
import { notFound } from "./notFound";

export const bg = {
  header,
  footer,
  home,
  services,
  projects,
  notFound,
} as const;