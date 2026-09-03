import { initSmartHeader } from "./components/smartHeader";
import { initServiceHighlights } from "./components/serviceHighlights";
import { initCarousels } from "./components/carousel";
import { initPhotoSwipeGalleries } from "./components/photoswipe";
import { initSupplierFilterPaginations } from "./components/supplierFilterPagination";
import { initFooterDivider } from "./components/footerDivider";

function initializeSiteScripts(): void {
  initSmartHeader();
  initServiceHighlights();
  initSupplierFilterPaginations();
  initPhotoSwipeGalleries();
  initCarousels();
  initFooterDivider();
}

initializeSiteScripts();

document.addEventListener(
  "astro:page-load",
  initializeSiteScripts,
);