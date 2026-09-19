const FOOTER_BRAND_SELECTOR = "[data-footer-divider-reveal]";
const INITIALIZED_ATTRIBUTE = "footerRevealInitialized";
const LEGAL_REVEAL_DELAY = 450;

type RevealDirection = "left" | "bottom" | "right";

function prepareRevealStart(
  element: HTMLElement | null,
  direction: RevealDirection = "bottom",
): void {
  if (
    !element ||
    element.style.getPropertyValue("--footer-reveal-y")
  ) {
    return;
  }

  // Measure before the reveal animation applies its transform.
  const rect = element.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;

  const offsetX =
    direction === "left"
      ? -rect.right
      : direction === "right"
        ? viewportWidth - rect.left
        : 0;

  const offsetY = Math.max(0, viewportHeight - rect.top);

  element.style.setProperty(
    "--footer-reveal-x",
    `${offsetX}px`,
  );

  element.style.setProperty(
    "--footer-reveal-y",
    `${offsetY}px`,
  );
}

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

function initializeFooterReveal(
  brandElement: HTMLElement,
): void {
  if (
    brandElement.dataset[INITIALIZED_ATTRIBUTE] === "true"
  ) {
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
    footerElement.querySelector<HTMLElement>(
      ".footer-columns",
    );

  const socialElement =
    footerElement.querySelector<HTMLElement>(
      ".footer-social-row",
    );

  const legalElement =
    footerElement.querySelector<HTMLElement>(
      ".footer-legal",
    );

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (
    prefersReducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    revealImmediately(
      brandElement,
      columnsElement,
      socialElement,
      legalElement,
    );

    return;
  }

  footerElement.classList.add("is-reveal-ready");

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
        const columns =
          columnsElement.querySelectorAll<HTMLElement>(
            ":scope > div",
          );

        const isMobile = window.matchMedia(
          "(max-width: 640px)",
        ).matches;

        columns.forEach((column, index) => {
          const direction: RevealDirection = isMobile
            ? "bottom"
            : index === 0
              ? "left"
              : index === columns.length - 1
                ? "right"
                : "bottom";

          prepareRevealStart(column, direction);
        });

        // The CSS sibling selectors also reveal these rows.
        prepareRevealStart(socialElement);
        prepareRevealStart(legalElement);

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
        prepareRevealStart(socialElement);
        socialElement.classList.add("is-visible");

        if (legalElement) {
          window.setTimeout(() => {
            prepareRevealStart(legalElement);
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

  prepareRevealStart(legalElement);
  legalElement?.classList.add("is-visible");
}

export function initFooterDivider(): void {
  const brandElements =
    document.querySelectorAll<HTMLElement>(
      FOOTER_BRAND_SELECTOR,
    );

  brandElements.forEach(initializeFooterReveal);
}