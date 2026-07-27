const HERO_SELECTOR = ".home-hero";
const SCROLL_CUE_SELECTOR ="[data-home-hero-scroll-cue]";

const HOME_VISION_SELECTOR = "[data-home-vision]";
const HOME_VISION_GRID_SELECTOR = ".home-vision__grid";
const HOME_VISION_DESCRIPTION_SELECTOR =".home-vision__accents-description";

const SCROLL_CUE_DELAY = 1200;
const SCROLL_END_DELAY = 180;
const HERO_ACTIVE_RATIO = 0.5;

const HOME_VISION_HEADER_REVEAL_RATIO = 0.2;
const HOME_VISION_GRID_REVEAL_RATIO = 0.05;

const HOME_VISION_HEADER_SEQUENCE_FALLBACK = 1700;

type HomeHeroState = {
  isHeroActive: boolean;
  revealTimer?: number;
  scrollEndTimer?: number;
};

type HomeVisionRevealState = {
  isGridReady: boolean;
  isHeaderSequenceComplete: boolean;
  hasRevealedAccents: boolean;
  sequenceFallbackTimer?: number;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

/*
 * Home hero
 */

function initializeHomeHero(
  hero: HTMLElement,
): void {
  if (
    hero.dataset.homeHeroInitialized === "true"
  ) {
    return;
  }

  hero.dataset.homeHeroInitialized = "true";

  const scrollCue =
    hero.querySelector<HTMLButtonElement>(
      SCROLL_CUE_SELECTOR,
    );

  if (!scrollCue) {
    return;
  }

  const state: HomeHeroState = {
    isHeroActive: false,
  };

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

  const scrollToNextSection = (): void => {
    hideScrollCue();
    clearScrollEndTimer();

    const nextSection = hero.nextElementSibling;

    if (!(nextSection instanceof HTMLElement)) {
      return;
    }

    nextSection.scrollIntoView({
      behavior: prefersReducedMotion()
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry) {
        return;
      }

      state.isHeroActive =
        entry.isIntersecting &&
        entry.intersectionRatio >=
          HERO_ACTIVE_RATIO;

      if (!state.isHeroActive) {
        hideScrollCue();
        return;
      }

      showScrollCueAfterDelay();
    },
    {
      root: null,
      threshold: [
        0,
        HERO_ACTIVE_RATIO,
        0.75,
        1,
      ],
    },
  );

  heroObserver.observe(hero);

  scrollCue.addEventListener(
    "click",
    scrollToNextSection,
  );

  window.addEventListener(
    "scroll",
    handleScrollStart,
    {
      passive: true,
    },
  );

  window.addEventListener(
    "resize",
    () => {
      hideScrollCue();

      if (state.isHeroActive) {
        showScrollCueAfterDelay();
      }
    },
    {
      passive: true,
    },
  );

  hero.classList.add("is-copy-pending");

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      hero.classList.add("is-copy-visible");
    });
  });
}

function initializeHomeVisionReveal(
  section: HTMLElement,
): void {
  if (
    section.dataset.homeVisionRevealInitialized ===
    "true"
  ) {
    return;
  }

  section.dataset.homeVisionRevealInitialized =
    "true";

  const grid =
    section.querySelector<HTMLElement>(
      HOME_VISION_GRID_SELECTOR,
    );

  const description =
    section.querySelector<HTMLElement>(
      HOME_VISION_DESCRIPTION_SELECTOR,
    );

  const state: HomeVisionRevealState = {
    isGridReady: false,
    isHeaderSequenceComplete: false,
    hasRevealedAccents: false,
  };

  const clearSequenceFallback = (): void => {
    if (
      state.sequenceFallbackTimer === undefined
    ) {
      return;
    }

    window.clearTimeout(
      state.sequenceFallbackTimer,
    );

    state.sequenceFallbackTimer = undefined;
  };

  const tryRevealAccents = (): void => {
    if (
      state.hasRevealedAccents ||
      !state.isGridReady ||
      !state.isHeaderSequenceComplete
    ) {
      return;
    }

    state.hasRevealedAccents = true;

    section.classList.add(
      "are-accents-revealed",
    );
  };

  const completeHeaderSequence = (): void => {
    if (state.isHeaderSequenceComplete) {
      return;
    }

    clearSequenceFallback();

    state.isHeaderSequenceComplete = true;

    tryRevealAccents();
  };

  const revealHeader = (): void => {
    if (
      section.classList.contains(
        "is-header-revealed",
      )
    ) {
      return;
    }

    section.classList.add("is-header-revealed");

    state.sequenceFallbackTimer =
      window.setTimeout(
        completeHeaderSequence,
        HOME_VISION_HEADER_SEQUENCE_FALLBACK,
      );
  };

  const markGridReady = (): void => {
    state.isGridReady = true;

    tryRevealAccents();
  };

  if (
    prefersReducedMotion() ||
    !("IntersectionObserver" in window)
  ) {
    section.classList.add("is-header-revealed");

    state.isHeaderSequenceComplete = true;
    state.isGridReady = true;

    tryRevealAccents();

    return;
  }

  section.classList.add("is-reveal-ready");

  description?.addEventListener(
    "animationend",
    (event: AnimationEvent) => {
      if (
        event.animationName !==
        "vision-description-reveal"
      ) {
        return;
      }

      completeHeaderSequence();
    },
    {
      once: true,
    },
  );

  const headerObserver = new IntersectionObserver(
    ([entry]) => {
      if (
        !entry ||
        !entry.isIntersecting ||
        entry.intersectionRatio <
          HOME_VISION_HEADER_REVEAL_RATIO
      ) {
        return;
      }

      headerObserver.disconnect();

      revealHeader();
    },
    {
      root: null,
      threshold: [
        0,
        HOME_VISION_HEADER_REVEAL_RATIO,
        0.5,
      ],
      rootMargin: "0px 0px -8% 0px",
    },
  );

  headerObserver.observe(section);

  if (!grid) {
    markGridReady();
    return;
  }

  const gridObserver = new IntersectionObserver(
    ([entry]) => {
      if (
        !entry ||
        !entry.isIntersecting ||
        entry.intersectionRatio <
          HOME_VISION_GRID_REVEAL_RATIO
      ) {
        return;
      }

      gridObserver.disconnect();

      markGridReady();
    },
    {
      root: null,
      threshold: [
        0,
        HOME_VISION_GRID_REVEAL_RATIO,
        0.25,
      ],

      rootMargin: "0px 0px -10% 0px",
    },
  );

  gridObserver.observe(grid);
}

/*
 * Home page initialization
 */

export function initHomePageAnimations(): void {
  document
    .querySelectorAll<HTMLElement>(HERO_SELECTOR)
    .forEach(initializeHomeHero);

  document
    .querySelectorAll<HTMLElement>(
      HOME_VISION_SELECTOR,
    )
    .forEach(initializeHomeVisionReveal);
}