import { homePage } from "./core/home";
import { servicesPage } from "./core/services";
import { projectsPage } from "./core/projects";
import { facilitiesPage } from "./core/facilities";
import { aboutPage } from "./core/about";
import { notFoundPage } from "./core/404";

export const pageDefinitions = {
  home: homePage,
  services: servicesPage,
  projects: projectsPage,
  facilities: facilitiesPage,
  about: aboutPage,
  notFound: notFoundPage
} as const;

export type PageKey = keyof typeof pageDefinitions;
export { getPagePath, normalizePath } from "./helpers";