import type { Language } from "../i18n/i18n";

export const contacts = {
  email: "pools4you@email.com",

  phone: {
    display: "+359 0123456789",
    href: "+3590123456789",
  },

  address: {
    bg: "Бургас, България",
    en: "Burgas, Bulgaria",
  },

  hours: {
    bg: "Понеделник - Петък 08:00 - 17:00",
    en: "Monday - Friday 08:00 - 17:00",
  },

  map: {
    iframeSrc:
      "https://www.google.com/maps?q=Burgas%2C%20Bulgaria&output=embed",
    openUrl:
      "https://www.google.com/maps/search/?api=1&query=Burgas%2C%20Bulgaria",
  },
} as const;

export function getSiteContacts(language: Language) {
  return {
    email: contacts.email,
    phone: contacts.phone.display,
    phoneHref: contacts.phone.href,
    address: contacts.address[language],
    hours: contacts.hours[language],
    map: contacts.map,
  };
}