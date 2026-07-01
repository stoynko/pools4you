import type { CollectionEntry } from "astro:content";

type SupplierEntry = CollectionEntry<"suppliers">;

export function getSupplierPath(supplier: SupplierEntry) {
  if (supplier.data.language === "bg") {
    return `/dostavchitsi/${supplier.data.slug}`;
  }

  return `/en/suppliers/${supplier.data.slug}`;
}
