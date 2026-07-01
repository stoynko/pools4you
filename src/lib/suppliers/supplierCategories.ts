import type { CollectionEntry } from "astro:content";
import type { Language } from "../../config/i18n/i18n";

export type SupplierCategoryKey =
  CollectionEntry<"suppliers">["data"]["categoryKeys"][number];

export const SUPPLIER_CATEGORY_KEYS = [
  "design",
  "equipment",
  "finish",
  "water",
  "wellness",
  "maintenance",
] as const satisfies readonly SupplierCategoryKey[];

const SUPPLIER_CATEGORY_LABELS: Record<
  SupplierCategoryKey,
  Record<Language, string>
> = {
  design: {
    bg: "Проектиране",
    en: "Design",
  },
  equipment: {
    bg: "Оборудване",
    en: "Equipment",
  },
  finish: {
    bg: "Облицовки",
    en: "Finishes",
  },
  water: {
    bg: "Водна обработка",
    en: "Water treatment",
  },
  wellness: {
    bg: "Уелнес",
    en: "Wellness",
  },
  maintenance: {
    bg: "Поддръжка",
    en: "Maintenance",
  },
};

export function getSupplierCategoryLabel(
  categoryKey: SupplierCategoryKey,
  language: Language,
) {
  return SUPPLIER_CATEGORY_LABELS[categoryKey][language];
}

export function getSupplierCategoryLabels(
  categoryKeys: readonly SupplierCategoryKey[],
  language: Language,
) {
  return categoryKeys.map((categoryKey) => {
    return getSupplierCategoryLabel(categoryKey, language);
  });
}
