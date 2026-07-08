import { initCarousels } from "./components/carousel";
import { initPhotoSwipeGalleries } from "./components/photoswipe";
import { initSupplierFilterPaginations } from "./components/supplierFilterPagination";

function initializeSiteScripts(): void {
  initSupplierFilterPaginations();
  initPhotoSwipeGalleries();
  initCarousels();
}

initializeSiteScripts();

document.addEventListener(
  "astro:page-load",
  initializeSiteScripts,
);