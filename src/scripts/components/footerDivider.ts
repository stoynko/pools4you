const FOOTER_BRAND_SELECTOR = "[data-footer-divider-reveal]";

const INITIALIZED_ATTRIBUTE = "footerRevealInitialized";

const LEGAL_REVEAL_DELAY = 450;

function revealImmediately(
  brandElement: HTMLElement,

  columnsElement: HTMLElement | null,

  socialElement: HTMLElement | null,

  legalElement: HTMLElement | null,
): void {
  brandElement.classList.add("is-visible");

  columnsElement?.classList.add("is-visible");

  socialElement?.classList.add("is-visible");

  legalElement?.classList.add("is-visible");
}

function createRevealObserver(
  element: HTMLElement,

  callback: () => void,

  options: IntersectionObserverInit,
): IntersectionObserver {
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];

    if (!entry?.isIntersecting) {
      return;
    }

    callback();

    observer.disconnect();
  }, options);

  observer.observe(element);

  return observer;
}

function initializeFooterReveal(brandElement: HTMLElement): void {
  if (brandElement.dataset[INITIALIZED_ATTRIBUTE] === "true") {
    return;
  }

  brandElement.dataset[INITIALIZED_ATTRIBUTE] = "true";

  const footerElement = brandElement.closest<HTMLElement>(
    "[data-footer-reveal]",
  );

  if (!footerElement) {
    brandElement.classList.add("is-visible");

    return;
  }

  const columnsElement =
    footerElement.querySelector<HTMLElement>(".footer-columns");

  const socialElement =
    footerElement.querySelector<HTMLElement>(".footer-social-row");

  const legalElement =
    footerElement.querySelector<HTMLElement>(".footer-legal");

  footerElement.classList.add("is-reveal-ready");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealImmediately(
      brandElement,

      columnsElement,

      socialElement,

      legalElement,
    );

    return;
  }

  createRevealObserver(
    footerElement,

    () => {
      brandElement.classList.add("is-visible");
    },

    {
      threshold: 0,

      rootMargin: "0px 0px -5% 0px",
    },
  );

  if (columnsElement) {
    createRevealObserver(
      columnsElement,

      () => {
        columnsElement.classList.add("is-visible");
      },

      {
        threshold: 0.15,

        rootMargin: "0px 0px -8% 0px",
      },
    );
  }

  if (socialElement) {
    createRevealObserver(
      socialElement,

      () => {
        socialElement.classList.add("is-visible");

        if (legalElement) {
          window.setTimeout(() => {
            legalElement.classList.add("is-visible");
          }, LEGAL_REVEAL_DELAY);
        }
      },

      {
        threshold: 0.3,

        rootMargin: "0px 0px -8% 0px",
      },
    );

    return;
  }

  legalElement?.classList.add("is-visible");
}

export function initFooterDivider(): void {
  const brandElements = document.querySelectorAll<HTMLElement>(
    FOOTER_BRAND_SELECTOR,
  );

  brandElements.forEach(initializeFooterReveal);
}
