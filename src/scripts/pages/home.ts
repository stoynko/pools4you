const HERO_SELECTOR = ".home-hero";
const SCROLL_CUE_SELECTOR = "[data-home-hero-scroll-cue]";

const SCROLL_CUE_DELAY = 1200;
const SCROLL_END_DELAY = 180;
const HERO_ACTIVE_RATIO = 0.5;

type HomeHeroState = {
  isHeroActive: boolean;
  revealTimer?: number;
  scrollEndTimer?: number;
};

function initializeHomeHero(hero: HTMLElement): void {
  if (hero.dataset.homeHeroInitialized === "true") {
    return;
  }

  hero.dataset.homeHeroInitialized = "true";

  const scrollCue =
    hero.querySelector<HTMLButtonElement>(SCROLL_CUE_SELECTOR);

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

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    nextSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
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
        entry.intersectionRatio >= HERO_ACTIVE_RATIO;

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

  scrollCue.addEventListener("click", scrollToNextSection);

  window.addEventListener("scroll", handleScrollStart, {
    passive: true,
  });

  window.addEventListener("resize", () => {
    hideScrollCue();

    if (state.isHeroActive) {
      showScrollCueAfterDelay();
    }
  });

  hero.classList.add("is-copy-pending");

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      hero.classList.add("is-copy-visible");
    });
  });
}

export function initHomePageAnimations(): void {
  document
    .querySelectorAll<HTMLElement>(HERO_SELECTOR)
    .forEach(initializeHomeHero);
}