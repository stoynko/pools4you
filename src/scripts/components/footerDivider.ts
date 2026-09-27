/* SELECTORS */
const FOOTER_SELECTOR = "[data-footer-reveal]";
const FOOTER_BRAND_SELECTOR = "[data-footer-divider-reveal]";
const FOOTER_COLUMNS_SELECTOR = ".footer-columns";
const FOOTER_COLUMN_SELECTOR = ".footer-column";
const FOOTER_SOCIAL_SELECTOR = ".footer-social-row";
const FOOTER_LEGAL_SELECTOR = ".footer-legal";

const INITIALIZED_ATTRIBUTE = "footerRevealInitialized";

/* CONSTANTS */
const MOBILE_MEDIA_QUERY = "(max-width: 640px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const COLUMN_REVEAL_STAGGER_MS = 80;
const LEGAL_REVEAL_DELAY_MS = 120;

type RevealDirection = "left" | "bottom" | "right";

function setRevealDelay(element: HTMLElement, delayMs: number): void {
  element.style.setProperty("--footer-reveal-delay",`${delayMs}ms`);
}

function prepareRevealStart(element: HTMLElement | null, direction: RevealDirection = "bottom"): void {
  if (!element) {
    return;
  }

  const rect = element.getBoundingClientRect();

  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;

  let offsetX = 0;

  if (direction === "left") {
    offsetX = -rect.right;
  } else if (direction === "right") {
    offsetX = viewportWidth - rect.left;
  }

  const offsetY = Math.max(0, viewportHeight - rect.top);

  element.style.setProperty("--footer-reveal-x", `${offsetX}px`);
  element.style.setProperty("--footer-reveal-y",`${offsetY}px`);
}

function revealImmediately(brandElement: HTMLElement, columnsElement: HTMLElement | null, 
  socialElement: HTMLElement | null, legalElement: HTMLElement | null): void {
  brandElement.classList.add("is-visible");

  columnsElement?.classList.add("is-visible");
  socialElement?.classList.add("is-visible");
  legalElement?.classList.add("is-visible");
}

function createRevealObserver(element: HTMLElement, callback: () => void, options: IntersectionObserverInit): void {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (!entry?.isIntersecting) {
        return;
      }

      callback();
      observer.disconnect();
    }, options
  );

  observer.observe(element);
}

function getColumnDirection(index: number, totalColumns: number, isMobile: boolean): RevealDirection {
  if (isMobile || totalColumns <= 1) {
    return "bottom";
  }

  if (index === 0) {
    return "left";
  }

  if (index === totalColumns - 1) {
    return "right";
  }

  return "bottom";
}

function initializeColumnsReveal(columnsElement: HTMLElement): void {
  createRevealObserver(
    columnsElement,
    () => {
      const columns = columnsElement.querySelectorAll<HTMLElement>(FOOTER_COLUMN_SELECTOR);

      const isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;

      columns.forEach((column, index) => {
        const direction = getColumnDirection(index, columns.length, isMobile);
        prepareRevealStart(column, direction);
        setRevealDelay(column, index * COLUMN_REVEAL_STAGGER_MS);
      });

      columnsElement.classList.add("is-visible");
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -8% 0px"
    }
  );
}

function initializeElementReveal(element: HTMLElement, delayMs = 0): void {
  createRevealObserver(element, () => {
      prepareRevealStart(element, "bottom");
      setRevealDelay(element, delayMs);

      element.classList.add("is-visible");
    },
    {
      threshold: 0.25,
      rootMargin: "0px 0px -6% 0px"
    }
  );
}

function initializeFooterReveal(brandElement: HTMLElement): void {

  if (brandElement.dataset[INITIALIZED_ATTRIBUTE] === "true") {
    return;
  }

  brandElement.dataset[INITIALIZED_ATTRIBUTE] = "true";

  const footerElement = brandElement.closest<HTMLElement>(FOOTER_SELECTOR);

  if (!footerElement) {
    brandElement.classList.add("is-visible" );
    return;
  }

  const columnsElement = footerElement.querySelector<HTMLElement>(FOOTER_COLUMNS_SELECTOR);
  const socialElement = footerElement.querySelector<HTMLElement>(FOOTER_SOCIAL_SELECTOR);
  const legalElement =footerElement.querySelector<HTMLElement>(FOOTER_LEGAL_SELECTOR);
  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if ( prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealImmediately(brandElement, columnsElement, socialElement, legalElement);
    return;
  }

  footerElement.classList.add("is-reveal-ready");

  createRevealObserver(footerElement, () => {
      brandElement.classList.add("is-visible");
    },
    {
      threshold: 0,
      rootMargin: "0px 0px -5% 0px"
    }
  );

  if (columnsElement) {
    initializeColumnsReveal(columnsElement);
  }

  if (socialElement) {
    initializeElementReveal(socialElement);
  }

  if (legalElement) {
    initializeElementReveal(legalElement, LEGAL_REVEAL_DELAY_MS);
  }
}

export function initFooterDivider(): void {
  const brandElements =  document.querySelectorAll<HTMLElement>(FOOTER_BRAND_SELECTOR);
  brandElements.forEach(initializeFooterReveal);
}