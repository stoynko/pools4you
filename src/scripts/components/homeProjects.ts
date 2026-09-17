import gsap from "gsap";
import { revealController } from "../../lib/animation/revealController";

/* CONSTANTS */
const CARD_FLIP_ANGLE = 180;

/* SELECTORS */
const BOOK_SELECTOR = "[data-home-projects-book]";
const CARD_SELECTOR = "[data-home-project-card]";
const CARD_SCENE_SELECTOR = ".home-project-card__scene";
const CARD_FLIPPER_SELECTOR = ".home-project-card__flipper";
const CARD_ROTATE_SELECTOR = ".home-project-card__rotate";

/* QUERIES */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_QUERY = "(max-width: 47.5rem)";
const CARD_TILT_QUERY = "(hover: hover) and (pointer: fine)";

const ENTRANCE_REVEAL_THRESHOLD = 0.05;
const ENTRANCE_REVEAL_ROOT_MARGIN = "0px 0px -200px 0px";

const PROJECT_ENTRANCE = {
  desktop: {
  stagger: 0.25,
  arrivalDuration: 0.7,
  overshoot: 0,
  recoil: 0,
},
mobile: {
  stagger: 0.12,
  arrivalDuration: 0.4,
  overshoot: 3,
  recoil: -0.5,
},
  mobileStartOffset: -96,
  offscreenPadding: 32,
  fadeDuration: 0.16,
  recoilDuration: 0.14,
  settleDuration: 0.18,
  fadeEase: "power1.out",
  arrivalEase: "power3.out",
  recoilEase: "power1.inOut",
  settleEase: "power2.out",
} as const;

const CARD_TILT = {
  maxRotationX: 2,
  maxRotationY: 3,
  followDuration: 0.4,
  resetDuration: 0.65,
  followEase: "power2.out",
  resetEase: "power3.out",
} as const;

type ProjectCard = HTMLElement;

const ROTATE_HINT_DELAY = 2000;

type RotateHintState = {
  hovered: boolean;
  timer?: number;
};

const rotateHintStates = new WeakMap<ProjectCard, RotateHintState>();

function resetRotateHint(card: ProjectCard): void {
  const state = rotateHintStates.get(card);

  if (!state) {
    return;
  }

  window.clearTimeout(state.timer);
  state.timer = undefined;

  card.classList.remove("is-rotate-hint-visible");

  if (!state.hovered || !card.classList.contains("is-active")) {
    return;
  }

  state.timer = window.setTimeout(() => {
    state.timer = undefined;

    if (state.hovered && card.classList.contains("is-active")) {
      card.classList.add("is-rotate-hint-visible");
    }
  }, ROTATE_HINT_DELAY);
}

function initializeRotateHints(cards: ProjectCard[]): void {
  cards.forEach((card) => {
    const state: RotateHintState = {
      hovered: false,
    };

    rotateHintStates.set(card, state);

    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      state.hovered = true;
      resetRotateHint(card);
    });

    const clearHover = (): void => {
      state.hovered = false;
      resetRotateHint(card);
    };

    card.addEventListener("pointerleave", clearHover);
    card.addEventListener("pointercancel", clearHover);
  });
}

type FlipDirection = -1 | 1;

type CardFlipState = {
  angle: number;
  lastDirection: FlipDirection;
  isRotating: boolean;
  releaseRotation?: () => void;
};

const cardFlipStates = new WeakMap<ProjectCard, CardFlipState>();

function getCardFlipState(card: ProjectCard): CardFlipState {
  let state = cardFlipStates.get(card);

  if (!state) {
    state = {
      angle: 0,
      lastDirection: 1,
      isRotating: false,
    };

    cardFlipStates.set(card, state);
  }

  return state;
}

function trackCardRotation(flipper: HTMLElement, state: CardFlipState): void {
  state.releaseRotation?.();
  state.isRotating = true;

  const release = (): void => {
    if (state.releaseRotation !== release) {
      return;
    }

    state.isRotating = false;
    state.releaseRotation = undefined;
  };

  state.releaseRotation = release;

  const transitions = flipper.getAnimations().filter((animation) => {
    return (
      "transitionProperty" in animation &&
      animation.transitionProperty === "transform"
    );
  });

  if (transitions.length === 0) {
    release();
    return;
  }

  void Promise.allSettled(transitions.map((animation) => animation.finished)).then(release);
}

function initializeProjectEntrance(book: HTMLElement, cards: ProjectCard[]): void {
  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    return;
  }

  let timeline: gsap.core.Timeline | null = null;
  let finished = false;
  let stopObserving: () => void = () => {};

  const finishEntrance = (): void => {
    if (finished) {
      return;
    }

    finished = true;
    stopObserving();

    timeline?.kill();
    timeline = null;

    gsap.set(cards, {
      clearProps: "transform,opacity,willChange",
    });

    book.removeEventListener("pointerdown", finishEntrance);
    book.removeEventListener("focusin", finishEntrance);
    reducedMotion.removeEventListener("change", handleMotionChange);
    window.removeEventListener("resize", handleResize);
  };

  const handleMotionChange = (): void => {
    if (reducedMotion.matches) {
      finishEntrance();
    }
  };

  const handleResize = (): void => {
    if (timeline) {
      finishEntrance();
    }
  };

  gsap.set(cards, { opacity: 0 });
  book.addEventListener("pointerdown", finishEntrance);
  book.addEventListener("focusin", finishEntrance);
  reducedMotion.addEventListener("change", handleMotionChange);
  window.addEventListener("resize", handleResize, { passive: true });

  stopObserving = revealController.observe(book, {
    threshold: ENTRANCE_REVEAL_THRESHOLD,
    rootMargin: ENTRANCE_REVEAL_ROOT_MARGIN,

    onReveal: (_element, { immediate }) => {
      if (finished) {
        return;
      }

      if (immediate || reducedMotion.matches) {
        finishEntrance();
        return;
      }

      const mobile = window.matchMedia(MOBILE_QUERY).matches;

      const { stagger, arrivalDuration, overshoot, recoil} = mobile
        ? PROJECT_ENTRANCE.mobile
        : PROJECT_ENTRANCE.desktop;

      const startingOffsets = cards.map((card) => {return mobile ? 
        PROJECT_ENTRANCE.mobileStartOffset : 
        -(card.getBoundingClientRect().right + PROJECT_ENTRANCE.offscreenPadding);
      });

      cards.forEach((card, index) => {
        gsap.set(card, {
          x: startingOffsets[index],
          willChange: "transform, opacity",
        });
      });

      const entranceTimeline = gsap.timeline({ paused: true, onComplete: finishEntrance});

      timeline = entranceTimeline;

      [...cards].reverse().forEach((card, index) => {
        const start = index * stagger;
        const recoilStart = start + arrivalDuration;
        const settleStart = recoilStart + PROJECT_ENTRANCE.recoilDuration;

        entranceTimeline.to(card, {
          opacity: 1,
          duration: PROJECT_ENTRANCE.fadeDuration,
          ease: PROJECT_ENTRANCE.fadeEase
        }, start).to(
          card, {
            x: overshoot,
            duration: arrivalDuration,
            ease: PROJECT_ENTRANCE.arrivalEase
          }, start
        ).to(card, {
          x: recoil,
          duration: PROJECT_ENTRANCE.recoilDuration,
          ease: PROJECT_ENTRANCE.recoilEase
        }, recoilStart
      ).to(card, {
        x: 0,
        duration: PROJECT_ENTRANCE.settleDuration,
        ease: PROJECT_ENTRANCE.settleEase
      }, settleStart);
    });
    
    entranceTimeline.play();
  }
});
}

/* CARD STATE */

function setCardState(card: ProjectCard, isActive: boolean): void {
  const state = getCardFlipState(card);

  const flipper = card.querySelector<HTMLElement>(CARD_FLIPPER_SELECTOR);

  state.releaseRotation?.();

  if (card.classList.contains("is-flipped")) {
    state.angle -= state.lastDirection * CARD_FLIP_ANGLE;
  }

  flipper?.style.setProperty("--project-flip-angle", `${state.angle}deg`);

  card.classList.toggle("is-active", isActive);
  card.classList.remove("is-flipped");

  card.setAttribute("aria-current", String(isActive));
  card.setAttribute("aria-expanded", String(isActive));

  if (flipper) {
    trackCardRotation(flipper, state);
  }

  resetRotateHint(card);
}

function toggleCardFlip(card: ProjectCard, clientX?: number, fromRotateButton = false): void {
  const flipper = card.querySelector<HTMLElement>(CARD_FLIPPER_SELECTOR);

  if (!flipper) {
    return;
  }

  const state = getCardFlipState(card);

  if (state.isRotating) {
    return;
  }

  const isFlipped = card.classList.contains("is-flipped");

  let direction: FlipDirection;

  if (isFlipped && fromRotateButton) {
    direction = state.lastDirection === 1 ? -1 : 1;
  } else if (clientX !== undefined) {
    const bounds = card.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;

    direction = clientX < centerX ? -1 : 1;
  } else {
    direction = 1;

    if (isFlipped && state.lastDirection === 1) {
      direction = -1;
    }
  }

  state.angle += direction * CARD_FLIP_ANGLE;
  state.lastDirection = direction;

  flipper.style.setProperty(
    "--project-flip-angle",
    `${state.angle}deg`,
  );

  card.classList.toggle("is-flipped", !isFlipped);

  trackCardRotation(flipper, state);
  resetRotateHint(card);
}

function activateCard(cards: ProjectCard[], card: ProjectCard, 
  clientX?: number, fromRotateButton = false): void {

  if (card.classList.contains("is-active")) {
    toggleCardFlip(card, clientX, fromRotateButton);
    return;
  }

  cards.forEach((item) => {
    setCardState(item, item === card);
  });
}

function initializeCardTilt(card: ProjectCard): void {
  const scene = card.querySelector<HTMLElement>(CARD_SCENE_SELECTOR);

  if (!scene) {
    return;
  }

  const hoverQuery = window.matchMedia(CARD_TILT_QUERY);
  const reducedMotion = window.matchMedia(
    REDUCED_MOTION_QUERY,
  );

  const canTilt = (): boolean => {
    return hoverQuery.matches && !reducedMotion.matches;
  };

  const resetTilt = (): void => {
    gsap.to(scene, {
      rotationX: 0,
      rotationY: 0,
      duration: canTilt() ? CARD_TILT.resetDuration : 0,
      ease: CARD_TILT.resetEase,
      overwrite: true,
      onComplete: () => {
        gsap.set(scene, {
          clearProps: "transform",
        });
      },
    });
  };

  card.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !canTilt()) {
      return;
    }

    const rect = card.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const x = gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width - 0.5) * 2);
    const y = gsap.utils.clamp(-1, 1, ((event.clientY - rect.top) / rect.height - 0.5) * 2);

    gsap.to(scene, {
      rotationX: -y * CARD_TILT.maxRotationX,
      rotationY: x * CARD_TILT.maxRotationY,
      duration: CARD_TILT.followDuration,
      ease: CARD_TILT.followEase,
      overwrite: true,
    });
  });

  card.addEventListener("pointerleave", resetTilt);
  card.addEventListener("pointercancel", resetTilt);

  hoverQuery.addEventListener("change", resetTilt);
  reducedMotion.addEventListener("change", resetTilt);
}

/* PROJECT BOOK */

function initializeProjectBook(book: HTMLElement): void {
  if (book.dataset.homeProjectsInitialized === "true") {
    return;
  }

  const cards = Array.from(
    book.querySelectorAll<ProjectCard>(CARD_SELECTOR),
  );

  if (cards.length === 0) {
    return;
  }

  book.dataset.homeProjectsInitialized = "true";

  initializeProjectEntrance(book, cards);
  cards.forEach(initializeCardTilt);
  initializeRotateHints(cards);

  book.addEventListener("click", (event: MouseEvent) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("a")) {
      return;
    }

    const card = target.closest<ProjectCard>(CARD_SELECTOR);

    if (!card || !book.contains(card)) {
      return;
    }

    const fromRotateButton =
      target.closest(CARD_ROTATE_SELECTOR) !== null;

    activateCard(
      cards,
      card,
      event.detail > 0 ? event.clientX : undefined,
      fromRotateButton,
    );
  });

  book.addEventListener("keydown", (event) => {
    const target = event.target;

    if (target instanceof Element && target.closest("a, button")) {
      return;
    }

    const activeIndex = cards.findIndex((card) => {
      return card.classList.contains("is-active");
    });

    if (activeIndex < 0) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      const activeCard = cards[activeIndex];

      if (activeCard) {
        toggleCardFlip(activeCard);
      }

      return;
    }

    const previousKeys = ["ArrowLeft", "ArrowUp"];
    const nextKeys = ["ArrowRight", "ArrowDown"];

    if (
      !previousKeys.includes(event.key) &&
      !nextKeys.includes(event.key)
    ) {
      return;
    }

    event.preventDefault();

    const direction = nextKeys.includes(event.key) ? 1 : -1;
    const nextIndex =
      (activeIndex + direction + cards.length) % cards.length;

    const nextCard = cards[nextIndex];

    if (nextCard) {
      activateCard(cards, nextCard);
    }
  });
}

/* HOME FEATURED PROJECTS INITIALIZATION */

export function initHomeProjects(): void {
  document.querySelectorAll<HTMLElement>(BOOK_SELECTOR).forEach(initializeProjectBook);
}