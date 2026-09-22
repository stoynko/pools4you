import gsap from "gsap";

import { revealController, type RevealContext } from "../../lib/animation/revealController";
import { applySectionHeaderRevealTiming } from "../../lib/animation/sectionHeaderReveal";

/* SELECTORS */
const HERO_SELECTOR = ".home-hero";
const SCROLL_CUE_SELECTOR = "[data-home-hero-scroll-cue]";
const HOME_VISION_SELECTOR = "[data-home-vision]";
const HOME_VISION_GRID_SELECTOR = ".home-vision__grid";
const HOME_PROJECTS_SELECTOR = "[data-home-projects]";
const HOME_PROJECTS_HEADER_SELECTOR = ".home-projects__header";
const HOME_CLIENTS_SELECTOR = "[data-home-clients]";
const HOME_CLIENTS_VIEWPORT_SELECTOR = "[data-home-clients-viewport]";
const HOME_CLIENTS_TRACK_SELECTOR = "[data-home-clients-track]";
const HOME_CLIENT_SELECTOR = "[data-home-client]";
const HOME_CLIENT_LOGO_SELECTOR = "[data-home-client-logo]";
const HOME_CLIENT_CLONE_SELECTOR = '[data-home-client-clone="true"]';

/* CONSTANTS */
const HOME_CLIENTS_SPEED = 28;
const SCROLL_CUE_DELAY = 3000;
const SCROLL_END_DELAY = 180;
const HERO_ACTIVE_RATIO = 0.5;
const HOME_VISION_HEADER_REVEAL_RATIO = 0.2;
const HOME_VISION_GRID_REVEAL_RATIO = 0.05;
const HOME_CLIENTS_HEADER_REVEAL_RATIO = 0.05;

const HOME_VISION_TIMING = {
  accentsDelay: 1650,
  itemDuration: 900,
  itemStagger: 100,
  separatorDuration: 700,
  separatorInitialDelay: 180,
  separatorStagger: 100,
} as const;

type HomeHeroState = {
  isHeroActive: boolean;
  revealTimer?: number;
  scrollEndTimer?: number;
};

type HomeVisionRevealState = {
  isGridReady: boolean;
  isHeaderSequenceComplete: boolean;
  hasRevealedAccents: boolean;
};

const HOME_PROJECTS_REVEAL = {
  headerThreshold: 0.05,
  ctaThreshold: 0.25,
} as const;

const HOME_CLIENTS_HEADER_TIMING = {
  titleDuration: 800,
  dividerDelay: 800,
  dividerDuration: 400,
} as const;


/* HOME HERO */

function initializeHomeHero(hero: HTMLElement): void {
  if (hero.dataset.homeHeroInitialized === "true") {
    return;
  }

  hero.dataset.homeHeroInitialized = "true";

  const scrollCue = hero.querySelector<HTMLElement>(SCROLL_CUE_SELECTOR);

  if (!scrollCue) {
    return;
  }

  const state: HomeHeroState = { isHeroActive: false };

  const clearRevealTimer = (): void => {
    if (state.revealTimer === undefined) {
      return;
    }

    window.clearTimeout(state.revealTimer);
    state.revealTimer = undefined;
  };

  const clearScrollEndTimer = (): void => {
    if (state.scrollEndTimer === undefined) {
      return;
    }

    window.clearTimeout(state.scrollEndTimer);
    state.scrollEndTimer = undefined;
  };

  const hideScrollCue = (): void => {
    clearRevealTimer();
    scrollCue.classList.remove("is-visible");
  };

  const showScrollCueAfterDelay = (): void => {
    hideScrollCue();

    if (!state.isHeroActive) {
      return;
    }

    state.revealTimer = window.setTimeout(() => {
      state.revealTimer = undefined;

      if (state.isHeroActive) {
        scrollCue.classList.add("is-visible");
      }
    }, SCROLL_CUE_DELAY);
  };

  const handleScrollStart = (): void => {
    hideScrollCue();
    clearScrollEndTimer();

    state.scrollEndTimer = window.setTimeout(() => {
      state.scrollEndTimer = undefined;

      if (state.isHeroActive) {
        showScrollCueAfterDelay();
      }
    }, SCROLL_END_DELAY);
  };

  const heroObserver = new IntersectionObserver(([entry]) => {
    if (!entry) {
      return;
    }
    
    state.isHeroActive = entry.isIntersecting && entry.intersectionRatio >= HERO_ACTIVE_RATIO;

    if (!state.isHeroActive) {
      hideScrollCue();
      return;
    }

    showScrollCueAfterDelay();
  }, { root: null, threshold: [0, HERO_ACTIVE_RATIO, 0.75, 1]});

  heroObserver.observe(hero);

  window.addEventListener("scroll", handleScrollStart, { passive: true });

  window.addEventListener("resize", () => {
    hideScrollCue();

    if (state.isHeroActive) {
      showScrollCueAfterDelay();
    }
  }, { passive: true });

  hero.classList.add("is-copy-pending");

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      hero.classList.add("is-copy-visible");
    });
  });
}

function initializeHomeVisionReveal(section: HTMLElement): void {

  if (section.dataset.homeVisionRevealInitialized === "true") {
    return;
  }

  applySectionHeaderRevealTiming(section);
  section.style.setProperty("--vision-item-duration", `${HOME_VISION_TIMING.itemDuration}ms`);
  section.style.setProperty("--vision-item-stagger", `${HOME_VISION_TIMING.itemStagger}ms`);
  section.style.setProperty("--vision-separator-duration", `${HOME_VISION_TIMING.separatorDuration}ms`);
  section.style.setProperty("--vision-separator-initial-delay", `${HOME_VISION_TIMING.separatorInitialDelay}ms`);
  section.style.setProperty("--vision-separator-stagger", `${HOME_VISION_TIMING.separatorStagger}ms`);

  section.dataset.homeVisionRevealInitialized = "true";

  const grid = section.querySelector<HTMLElement>(HOME_VISION_GRID_SELECTOR);

  const state: HomeVisionRevealState = {
    isGridReady: false,
    isHeaderSequenceComplete: false,
    hasRevealedAccents: false
  };

  const tryRevealAccents = (): void => {
    if (state.hasRevealedAccents || !state.isGridReady || !state.isHeaderSequenceComplete) {
      return;
    }

    state.hasRevealedAccents = true;
    section.classList.add("are-accents-revealed");
  };

 const revealHeader = (_element: HTMLElement, { immediate }: RevealContext): void => {
  if (section.classList.contains("is-header-revealed")) {
    return;
  }

  section.classList.add("is-header-revealed");

  if (immediate) {
    state.isHeaderSequenceComplete = true;
    tryRevealAccents();
    return;
  }

  window.setTimeout(() => {
    state.isHeaderSequenceComplete = true;
    tryRevealAccents();
  }, HOME_VISION_TIMING.accentsDelay);
};

  const markGridReady = (): void => {
    state.isGridReady = true;
    tryRevealAccents();
  };

  section.classList.add("is-reveal-ready");

  revealController.observe(section, {
    threshold: HOME_VISION_HEADER_REVEAL_RATIO,
    onReveal: revealHeader,
  });

  if (!grid) {
    markGridReady();
    return;
  }

  revealController.observe(grid, {
    threshold: HOME_VISION_GRID_REVEAL_RATIO,
    rootMargin: "0px 0px -10% 0px",
    onReveal: markGridReady,
  });
}

function initializeHomeProjectsReveal(section: HTMLElement): void {
  if (section.dataset.homeProjectsRevealInitialized === "true") {
    return;
  }

  section.dataset.homeProjectsRevealInitialized = "true";

  const header = section.querySelector<HTMLElement>(HOME_PROJECTS_HEADER_SELECTOR);

  const footer = section.querySelector<HTMLElement>(".home-projects__footer");

  applySectionHeaderRevealTiming(section);

  if (header) {
  revealController.observe(section, {
    threshold: HOME_PROJECTS_REVEAL.headerThreshold,
    once: true,

    onReveal: () => {
      section.classList.add("is-header-revealed");
    },
  });
}

  if (footer) {
    let stopObserving: () => void = () => {};

    const revealImmediately = (): void => {
      footer.classList.add(
        "is-cta-revealed",
        "is-cta-immediate",
      );

      stopObserving();
    };

    footer.classList.add("is-cta-reveal-ready");

    footer.addEventListener("focusin", revealImmediately, {
      once: true,
    });

    stopObserving = revealController.observe(footer, {
      threshold: HOME_PROJECTS_REVEAL.ctaThreshold,
      once: true,

      onReveal: (_element, { immediate }) => {
        if (immediate || footer.matches(":focus-within")) {
          revealImmediately();
          return;
        }

        footer.classList.add("is-cta-revealed");
      },
    });
  }
}

function initializeHomeClients(section: HTMLElement): void {
  if (section.dataset.homeClientsInitialized === "true") {
    return;
  }

  initializeHomeClientsReveal(section);
  
  const viewport = section.querySelector<HTMLElement>(HOME_CLIENTS_VIEWPORT_SELECTOR);

  const track = section.querySelector<HTMLElement>(HOME_CLIENTS_TRACK_SELECTOR);

  if (!viewport || !track) {
    return;
  }

  section.dataset.homeClientsInitialized = "true";

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let carouselTween:
    | gsap.core.Tween
    | null = null;

  let resizeFrame:
    | number
    | undefined;

  let isLogoHovered = false;
  let isLogoFocused = false;

  const removeClones = (): void => {
    track.querySelectorAll<HTMLElement>(HOME_CLIENT_CLONE_SELECTOR)
      .forEach((clone) => { clone.remove();
      });
  };

  const createClone = (item: HTMLElement): HTMLElement => {
    const clone = item.cloneNode(true) as HTMLElement;

    clone.dataset.homeClientClone = "true";

    clone.setAttribute("aria-hidden", "true");

    clone.querySelectorAll<HTMLElement>([
          "a",
          "button",
          "input",
          "select",
          "textarea",
          "[tabindex]",
        ].join(","),
      )
      .forEach((interactiveElement) => {
        interactiveElement.tabIndex = -1;
        }
      );

    return clone;
  };

  const appendCloneSet = (items: HTMLElement[]): void => {
    items.forEach((item) => {
      track.append(createClone(item));
    });
  };

  const updatePlayback = (): void => {
    if (!carouselTween) {
      return;
    }

    if (isLogoHovered || isLogoFocused) {
      carouselTween.pause();
      return;
    }

    carouselTween.resume();
  };

  const buildCarousel = (): void => {
    carouselTween?.kill();
    carouselTween = null;
    removeClones();
    gsap.set(track, { x: 0 });

    if (reducedMotionQuery.matches) {
      return;
    }

    const originalItems = Array.from(track.querySelectorAll<HTMLElement>(HOME_CLIENT_SELECTOR));

    if (originalItems.length === 0) {
      return;
    }

    appendCloneSet(originalItems);

    const firstOriginal = originalItems[0];

    const firstClone = track.querySelector<HTMLElement>(HOME_CLIENT_CLONE_SELECTOR);

    if (!firstOriginal || !firstClone) {
      return;
    }

    const cycleDistance = firstClone.offsetLeft - firstOriginal.offsetLeft;

    if (cycleDistance <= 0) {
      removeClones();
      return;
    }

    while (track.scrollWidth < viewport.clientWidth + cycleDistance) {
      appendCloneSet(originalItems);
    }

    carouselTween = gsap.to(track, {
        x: -cycleDistance,
        duration: cycleDistance / HOME_CLIENTS_SPEED,
        ease: "none",
        repeat: -1,
      }
    );

    updatePlayback();
  };

  section.addEventListener("pointerover", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const logo = event.target.closest<HTMLElement>(HOME_CLIENT_LOGO_SELECTOR);

      if (!logo || !section.contains(logo)) {
        return;
      }

      if (event.relatedTarget instanceof Node && logo.contains(event.relatedTarget)) {
        return;
      }

      isLogoHovered = true;
      updatePlayback();
    },
  );

  section.addEventListener("pointerout", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const logo = event.target.closest<HTMLElement>(HOME_CLIENT_LOGO_SELECTOR);

      if (!logo || !section.contains(logo)) {
        return;
      }

      if (event.relatedTarget instanceof Node && logo.contains(event.relatedTarget)) {
        return;
      }

      isLogoHovered = false;
      updatePlayback();
    }
  );

  section.addEventListener("focusin", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const logo = event.target.closest<HTMLElement>(HOME_CLIENT_LOGO_SELECTOR);

      if (!logo) {
        return;
      }

      isLogoFocused = true;
      updatePlayback();
    }
  );

  section.addEventListener("focusout", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const logo = event.target.closest<HTMLElement>(HOME_CLIENT_LOGO_SELECTOR);

      if (!logo) {
        return;
      }

      if (event.relatedTarget instanceof Node && logo.contains(event.relatedTarget)) {
        return;
      }

      isLogoFocused = false;
      updatePlayback();
    }
  );

  const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame !== undefined) {
        window.cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = undefined;
        buildCarousel();
      });
    });

  buildCarousel();
  resizeObserver.observe(viewport);
  reducedMotionQuery.addEventListener("change", buildCarousel);
}

function initializeHomeClientsReveal(section: HTMLElement): void {
  if (section.dataset.homeClientsRevealInitialized === "true") {
    return;
  }

  section.dataset.homeClientsRevealInitialized = "true";

  applySectionHeaderRevealTiming(section);

  section.style.setProperty(
    "--section-header-title-duration",
    `${HOME_CLIENTS_HEADER_TIMING.titleDuration}ms`,
  );

  section.style.setProperty(
    "--section-header-divider-delay",
    `${HOME_CLIENTS_HEADER_TIMING.dividerDelay}ms`,
  );

  section.style.setProperty(
    "--section-header-divider-duration",
    `${HOME_CLIENTS_HEADER_TIMING.dividerDuration}ms`,
  );

  revealController.observe(section, {
    threshold: HOME_CLIENTS_HEADER_REVEAL_RATIO,
    once: true,

    onReveal: () => {
      section.classList.add("is-header-revealed");
    },
  });
}

/* HOME PAGE INITIALIZATION */

export function initHomePageAnimations(): void {
  document.querySelectorAll<HTMLElement>(HERO_SELECTOR)
    .forEach(initializeHomeHero);

  document.querySelectorAll<HTMLElement>(HOME_VISION_SELECTOR)
    .forEach(initializeHomeVisionReveal);

  document.querySelectorAll<HTMLElement>(HOME_PROJECTS_SELECTOR)
    .forEach(initializeHomeProjectsReveal);

  document.querySelectorAll<HTMLElement>(HOME_CLIENTS_SELECTOR)
    .forEach(initializeHomeClients);
}