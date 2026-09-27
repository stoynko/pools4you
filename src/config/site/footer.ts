import type { PageKey } from "../pages/pageDefinitions";

type FooterPageLink = {
  page: PageKey;
  labelKey: string;
};

type FooterSection =
  | {
      key: string;
      titleKey: string;
      source: "pages";
      links: readonly FooterPageLink[];
    }
  | {
      key: string;
      titleKey: string;
      source: "facilities";
    };

export const footerSections = [
  {
    key: "services",
    titleKey: "categoryServices",
    source: "pages",
    links: [
      {
        page: "services",
        labelKey: "subServicesDesign",
      },
      {
        page: "services",
        labelKey: "subServicesConstruction",
      },
      {
        page: "services",
        labelKey: "subServicesRenovation",
      },
      {
        page: "services",
        labelKey: "subServicesMaintenance",
      },
      {
        page: "services",
        labelKey: "subServicesConsulting",
      },
    ],
  },

  {
    key: "solutions",
    titleKey: "categorySolutions",
    source: "facilities",
  },

  {
    key: "projects",
    titleKey: "categoryProjects",
    source: "pages",
    links: [
      {
        page: "projects",
        labelKey: "subProjectsHospitality",
      },
      {
        page: "projects",
        labelKey: "subProjectsPublic",
      },
      {
        page: "projects",
        labelKey: "subProjectsPrivate",
      },
    ],
  },

  {
    key: "company",
    titleKey: "categoryCompany",
    source: "pages",
    links: [
      {
        page: "about",
        labelKey: "subCompanyAbout",
      },
      {
        page: "contacts",
        labelKey: "subCompanyContacts",
      },
    ],
  },
] as const satisfies readonly FooterSection[];