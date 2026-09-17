import { revealController, type RevealContext } from "../../lib/animation/revealController";
import { applySectionHeaderRevealTiming } from "../../lib/animation/sectionHeaderReveal";

const HERO_SELECTOR = ".home-hero";
const SCROLL_CUE_SELECTOR = "[data-home-hero-scroll-cue]";
const HOME_VISION_SELECTOR = "[data-home-vision]";
const HOME_VISION_GRID_SELECTOR = ".home-vision__grid";
const HOME_PROJECTS_SELECTOR = "[data-home-projects]";
const HOME_PROJECTS_HEADER_SELECTOR = ".home-projects__header";

const SCROLL_CUE_DELAY = 3000;
const SCROLL_END_DELAY = 180;
const HERO_ACTIVE_RATIO = 0.5;
const HOME_VISION_HEADER_REVEAL_RATIO = 0.2;
const HOME_VISION_GRID_REVEAL_RATIO = 0.05;

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

  const header = section.querySelector<HTMLElement>(
    HOME_PROJECTS_HEADER_SELECTOR,
  );

  const footer = section.querySelector<HTMLElement>(
    ".home-projects__footer",
  );

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

/* HOME PAGE INITIALIZATION */

export function initHomePageAnimations(): void {
  document.querySelectorAll<HTMLElement>(HERO_SELECTOR)
    .forEach(initializeHomeHero);

  document.querySelectorAll<HTMLElement>(HOME_VISION_SELECTOR)
    .forEach(initializeHomeVisionReveal);

  document.querySelectorAll<HTMLElement>(HOME_PROJECTS_SELECTOR)
    .forEach(initializeHomeProjectsReveal);
}