import type { Language } from "../i18n/i18n";

export const contacts = {
  email: "pools4you@abv.bg",

  phone: {
    display: "+359 0878 190 980",
    href: "+3590123456789",
  },

  address: {
    bg: "гр. Бургас ул. Крайезерна 1, ет. 3",
    en: "Burgas, Kraiezerna 1, fl. 3",
  },

  hours: {
    bg: "Понеделник - Петък 09:00 - 18:00 | Събота 10:00 – 14:00",
    en: "Monday - Friday 09:00 - 18:00 | Saturday 10:00 - 14:00",
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