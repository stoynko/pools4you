import type { PageDefinition } from "../pageTypes";
import { projectsSeo } from "../../../lib/seo/pages/projectsSeo";

export const projectsPage = {
  key: "projects",
  paths: { bg: "/proekti", en: "/en/projects" },
  template: "projects",
  seo: projectsSeo,
} as const satisfies PageDefinition<"projects">;
