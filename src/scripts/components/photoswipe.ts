import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

const GALLERY_SELECTOR = "[data-photoswipe-gallery]";
const ITEM_SELECTOR = "[data-photoswipe-item]";
const THUMBNAIL_SELECTOR =
  "[data-photoswipe-thumbnail]";

const INITIALIZED_ATTRIBUTE =
  "photoswipeInitialized";

const OPEN_CLASS = "photoswipe-open";

function initializePhotoSwipeGallery(
  gallery: HTMLElement,
): void {
  if (
    gallery.dataset[INITIALIZED_ATTRIBUTE] === "true"
  ) {
    return;
  }

  const lightbox = new PhotoSwipeLightbox({
    gallery,
    children: ITEM_SELECTOR,
    thumbSelector: THUMBNAIL_SELECTOR,
    pswpModule: () => import("photoswipe"),

    bgOpacity: 0.92,
    showHideAnimationType: "zoom",
    wheelToZoom: true,

    paddingFn: (viewportSize) => {
      const padding =
        viewportSize.x < 680 ? 16 : 40;

      return {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding,
      };
    },
  });

  lightbox.on("beforeOpen", () => {
    document.documentElement.classList.add(
      OPEN_CLASS,
    );
  });

  lightbox.on("destroy", () => {
    document.documentElement.classList.remove(
      OPEN_CLASS,
    );
  });

  lightbox.init();

  gallery.dataset[INITIALIZED_ATTRIBUTE] =
    "true";
}

export function initPhotoSwipeGalleries(): void {
  const galleries =
    document.querySelectorAll<HTMLElement>(
      GALLERY_SELECTOR,
    );

  galleries.forEach(
    initializePhotoSwipeGallery,
  );
}