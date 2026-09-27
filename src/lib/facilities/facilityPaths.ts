import type { CollectionEntry } from "astro:content";
import { getPagePath } from "../../config/pages/pagePaths";

type FacilityEntry = CollectionEntry<"facilities">;

export function getFacilityPath(entry: FacilityEntry): string {
  const basePath = getPagePath(
    "facilities",
    entry.data.language,
  );

  return `${basePath}/${entry.data.slug}`;
}