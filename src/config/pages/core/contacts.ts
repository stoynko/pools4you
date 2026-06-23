import type { PageDefinition } from "../pageTypes";
import { contactSeo } from "../../../lib/seo/pages/contactSeo";

export const contactsPage = {
  key: "contacts",
  paths: { bg: "/kontakti", en: "/en/contacts" },
  template: "contacts",
  seo: contactSeo,
} as const satisfies PageDefinition<"contacts">;