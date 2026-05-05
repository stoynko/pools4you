/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONTACT_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type RouteContext = {
  route: import("./config/pages/pageRegistry").PageKey;
  language: import("./config/i18n/i18n").Language;
};

declare namespace App {
  interface Locals {
    requestLanguage: import("./config/i18n").Language;
    routeContext: RouteContext | null;
  }
}