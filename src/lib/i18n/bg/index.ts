import { header } from "./header";
import { footer } from "./footer";
import { home } from "./home";
import { services } from "./services";
import { projects } from "./projects";
import { facilities } from "./facilities";
import { contacts } from "./contacts";
import { about } from "./about"
import { notFound } from "./notFound";

export const bg = {
  header,
  footer,
  home,
  services,
  projects,
  facilities,
  contacts,
  about,
  notFound,
} as const;