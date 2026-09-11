const HERO_SELECTOR = ".home-hero";
const SCROLL_CUE_SELECTOR = "[data-home-hero-scroll-cue]";
const HOME_VISION_SELECTOR = "[data-home-vision]";
const HOME_VISION_GRID_SELECTOR = ".home-vision__grid";
const SCROLL_CUE_DELAY = 3000;
const SCROLL_END_DELAY = 180;
const HERO_ACTIVE_RATIO = 0.5;
const HOME_VISION_HEADER_REVEAL_RATIO = 0.2;
const HOME_VISION_GRID_REVEAL_RATIO = 0.05;

const HOME_VISION_TIMING = {
  titleDuration: 800,
  titleSeparatorDelay: 800,
  titleSeparatorDuration: 400,
  descriptionDelay: 1350,
  descriptionDuration: 750,
  accentsDelay: 1650,
  itemDuration: 900,
  itemStagger: 100,
  separatorDuration: 700,
  separatorInitialDelay: 180,
  separatorStagger: 100
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

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/*
 * HOME HERO
 */

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
};

function initializeHomeVisionReveal(section: HTMLElement): void {
  if (section.dataset.homeVisionRevealInitialized === "true") {
    return;
  }

  section.style.setProperty("--vision-title-duration", `${HOME_VISION_TIMING.titleDuration}ms`);
  section.style.setProperty("--vision-title-separator-delay", `${HOME_VISION_TIMING.titleSeparatorDelay}ms`);
  section.style.setProperty("--vision-title-separator-duration", `${HOME_VISION_TIMING.titleSeparatorDuration}ms`);
  section.style.setProperty("--vision-description-delay", `${HOME_VISION_TIMING.descriptionDelay}ms`);
  section.style.setProperty("--vision-description-duration", `${HOME_VISION_TIMING.descriptionDuration}ms`);
  section.style.setProperty("--vision-item-duration", `${HOME_VISION_TIMING.itemDuration}ms`);
  section.style.setProperty("--vision-item-stagger", `${HOME_VISION_TIMING.itemStagger}ms`,);
  section.style.setProperty("--vision-separator-duration", `${HOME_VISION_TIMING.separatorDuration}ms`);
  section.style.setProperty("--vision-separator-initial-delay", `${HOME_VISION_TIMING.separatorInitialDelay}ms`,);
  section.style.setProperty("--vision-separator-stagger", `${HOME_VISION_TIMING.separatorStagger}ms`,);

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

  const revealHeader = (): void => {
    if (section.classList.contains("is-header-revealed")) {
      return;
    }
    
    section.classList.add("is-header-revealed");

    window.setTimeout(() => {
      state.isHeaderSequenceComplete = true;
      tryRevealAccents();
    }, HOME_VISION_TIMING.accentsDelay);
  };

  const markGridReady = (): void => {
    state.isGridReady = true;
    tryRevealAccents();
  };

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    section.classList.add("is-header-revealed");
    state.isHeaderSequenceComplete = true;
    state.isGridReady = true;
    tryRevealAccents();
    return;
  }

  section.classList.add("is-reveal-ready");

  const headerObserver = new IntersectionObserver(([entry]) => {
    if (!entry || !entry.isIntersecting || entry.intersectionRatio < HOME_VISION_HEADER_REVEAL_RATIO) {
      return;
    }

    headerObserver.disconnect();
    revealHeader();
  }, {
    root: null,
    threshold: [0, HOME_VISION_HEADER_REVEAL_RATIO, 0.5],
    rootMargin: "0px 0px -8% 0px",
  });

  headerObserver.observe(section);

  if (!grid) {
    markGridReady();
    return;
  }

  const gridObserver = new IntersectionObserver(([entry]) => {
    if (!entry || !entry.isIntersecting || entry.intersectionRatio < HOME_VISION_GRID_REVEAL_RATIO) {
      return;
    }

    gridObserver.disconnect();
    markGridReady();
  }, {
    root: null,
    threshold: [0, HOME_VISION_GRID_REVEAL_RATIO, 0.25],
    rootMargin: "0px 0px -10% 0px"},
  );

  gridObserver.observe(grid);
}

/*
 * HOME PAGE INITIALIZATION
 */

export function initHomePageAnimations(): void {
  document.querySelectorAll<HTMLElement>(HERO_SELECTOR)
    .forEach(initializeHomeHero);

  document.querySelectorAll<HTMLElement>(HOME_VISION_SELECTOR)
    .forEach(initializeHomeVisionReveal);
}