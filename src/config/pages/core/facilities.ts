import type { PageDefinition } from "../pageDefinition";
import { facilitiesSeo } from "../../../lib/seo/pages/facilitiesSeo";

export const facilitiesPage = {
    key: "facilities",
    paths: { bg: "/suorazhenia", en: "/en/facilities" },
    template: "facilities",
    seo: facilitiesSeo,
  } as const satisfies PageDefinition<"facilities">;