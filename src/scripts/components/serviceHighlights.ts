import gsap from "gsap";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

const SECTION_SELECTOR =
  "[data-service-highlights]";

const IMAGE_SELECTOR =
  "[data-service-image]";

const COPY_SELECTOR =
  "[data-service-copy]";

const SCROLL_HINT_SELECTOR =
  "[data-service-scroll-hint]";

/*
 * Minimum accumulated movement required
 * to change service.
 */
const GESTURE_THRESHOLD = 30;

/*
 * Once a swipe triggers a service, its momentum
 * tail is ignored.
 *
 * A new swipe can be recognised when the incoming
 * delta accelerates strongly again.
 */
const NEW_IMPULSE_MIN_DELTA = 12;

const NEW_IMPULSE_ACCELERATION = 1.7;

/*
 * The current swipe must begin losing energy before
 * a new acceleration is considered another gesture.
 */
const DECAY_FROM_PEAK_RATIO = 0.6;

/*
 * Used for final gesture-stream cleanup only.
 *
 * This does not determine when another service
 * is allowed to activate.
 */
const OBSERVER_STOP_DELAY = 0.14;

const SCROLL_HINT_DELAY_MS = 3000;

const POSITION_TOLERANCE = 4;

type Direction =
  | 1
  | -1;

type ServiceHighlightElements = {
  images: HTMLElement[];

  copyLayers: HTMLElement[];

  scrollHint:
    HTMLElement | null;
};

type ServiceHighlightState = {
  activeIndex: number;

  observer:
    Observer | null;

  wasPinned: boolean;

  previousScrollY: number;

  /*
   * Prevent the gesture which entered the section
   * from immediately changing to the next service.
   */
  enteringSection: boolean;

  impulseConsumed: boolean;

  accumulatedDelta: number;

  previousDelta: number;

  peakDelta: number;

  impulseDirection:
    Direction | 0;

  decayDetected: boolean;

  hintTimer?: number;
};

/* --------------------------------------------------
 * DOM
 * -------------------------------------------------- */

function getElements(
  section: HTMLElement,
): ServiceHighlightElements | null {
  const images =
    Array.from(
      section.querySelectorAll<HTMLElement>(
        IMAGE_SELECTOR,
      ),
    );

  const copyLayers =
    Array.from(
      section.querySelectorAll<HTMLElement>(
        COPY_SELECTOR,
      ),
    );

  const scrollHint =
    section.querySelector<HTMLElement>(
      SCROLL_HINT_SELECTOR,
    );

  if (
    images.length === 0 ||
    copyLayers.length === 0
  ) {
    return null;
  }

  if (
    images.length !==
    copyLayers.length
  ) {
    return null;
  }

  return {
    images,
    copyLayers,
    scrollHint,
  };
}

/* --------------------------------------------------
 * Active service
 * -------------------------------------------------- */

function setActiveService(
  index: number,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  const lastIndex =
    elements.copyLayers.length - 1;

  const nextIndex =
    Math.min(
      Math.max(
        index,
        0,
      ),
      lastIndex,
    );

  if (
    nextIndex ===
    state.activeIndex
  ) {
    return;
  }

  state.activeIndex =
    nextIndex;

  elements.images.forEach(
    (
      image,
      imageIndex,
    ) => {
      image.classList.toggle(
        "is-active",
        imageIndex === nextIndex,
      );
    },
  );

  elements.copyLayers.forEach(
    (
      layer,
      layerIndex,
    ) => {
      const isActive =
        layerIndex === nextIndex;

      layer.classList.toggle(
        "is-active",
        isActive,
      );

      layer.setAttribute(
        "aria-hidden",
        isActive
          ? "false"
          : "true",
      );

      const link =
        layer.querySelector<HTMLAnchorElement>(
          "a",
        );

      if (link) {
        link.tabIndex =
          isActive
            ? 0
            : -1;
      }
    },
  );
}

/* --------------------------------------------------
 * Section geometry
 * -------------------------------------------------- */

function getSectionStart(
  section: HTMLElement,
): number {
  return (
    window.scrollY +
    section
      .getBoundingClientRect()
      .top
  );
}

function getSectionTravel(
  section: HTMLElement,
): number {
  return Math.max(
    section.offsetHeight -
      window.innerHeight,
    0,
  );
}

function getSectionEnd(
  section: HTMLElement,
): number {
  return (
    getSectionStart(section) +
    getSectionTravel(section)
  );
}

function getServicePosition(
  section: HTMLElement,
  index: number,
  serviceCount: number,
): number {
  if (serviceCount <= 1) {
    return getSectionStart(
      section,
    );
  }

  const step =
    getSectionTravel(section) /
    (serviceCount - 1);

  return (
    getSectionStart(section) +
    step * index
  );
}

function isPinned(
  section: HTMLElement,
): boolean {
  const rect =
    section.getBoundingClientRect();

  return (
    rect.top <=
      POSITION_TOLERANCE &&
    rect.bottom >=
      window.innerHeight -
        POSITION_TOLERANCE
  );
}

/* --------------------------------------------------
 * Scroll hint
 * -------------------------------------------------- */

function clearHintTimer(
  state: ServiceHighlightState,
): void {
  if (
    state.hintTimer ===
    undefined
  ) {
    return;
  }

  window.clearTimeout(
    state.hintTimer,
  );

  state.hintTimer =
    undefined;
}

function hideScrollHint(
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  clearHintTimer(state);

  elements.scrollHint
    ?.classList.remove(
      "is-visible",
    );
}

function scheduleScrollHint(
  section: HTMLElement,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  hideScrollHint(
    state,
    elements,
  );

  if (!isPinned(section)) {
    return;
  }

  state.hintTimer =
    window.setTimeout(
      () => {
        state.hintTimer =
          undefined;

        if (!isPinned(section)) {
          return;
        }

        elements.scrollHint
          ?.classList.add(
            "is-visible",
          );
      },
      SCROLL_HINT_DELAY_MS,
    );
}

/* --------------------------------------------------
 * Gesture impulse state
 * -------------------------------------------------- */

function resetImpulse(
  state: ServiceHighlightState,
): void {
  state.impulseConsumed =
    false;

  state.accumulatedDelta =
    0;

  state.previousDelta =
    0;

  state.peakDelta =
    0;

  state.impulseDirection =
    0;

  state.decayDetected =
    false;
}

function beginNewImpulse(
  direction: Direction,
  delta: number,
  state: ServiceHighlightState,
): void {
  state.impulseConsumed =
    false;

  state.accumulatedDelta =
    0;

  state.previousDelta =
    delta;

  state.peakDelta =
    delta;

  state.impulseDirection =
    direction;

  state.decayDetected =
    false;

  state.enteringSection =
    false;
}

function isNewImpulse(
  direction: Direction,
  delta: number,
  state: ServiceHighlightState,
): boolean {
  if (
    state.impulseDirection !==
      0 &&
    direction !==
      state.impulseDirection
  ) {
    return (
      delta >=
      NEW_IMPULSE_MIN_DELTA
    );
  }

  if (
    state.previousDelta <= 0
  ) {
    return false;
  }

  if (
    state.peakDelta > 0 &&
    delta <=
      state.peakDelta *
        DECAY_FROM_PEAK_RATIO
  ) {
    state.decayDetected =
      true;
  }

  if (!state.decayDetected) {
    return false;
  }

  const significantlyAccelerating =
    delta >=
    state.previousDelta *
      NEW_IMPULSE_ACCELERATION;

  const strongEnough =
    delta >=
    NEW_IMPULSE_MIN_DELTA;

  return (
    significantlyAccelerating &&
    strongEnough
  );
}

function updateImpulseMetrics(
  direction: Direction,
  delta: number,
  state: ServiceHighlightState,
): void {
  if (
    state.impulseDirection ===
    0
  ) {
    state.impulseDirection =
      direction;
  }

  if (
    direction ===
    state.impulseDirection
  ) {
    state.peakDelta =
      Math.max(
        state.peakDelta,
        delta,
      );
  }

  if (
    state.peakDelta > 0 &&
    delta <=
      state.peakDelta *
        DECAY_FROM_PEAK_RATIO
  ) {
    state.decayDetected =
      true;
  }

  state.previousDelta =
    delta;
}

/* --------------------------------------------------
 * Service movement
 * -------------------------------------------------- */

function moveToService(
  section: HTMLElement,
  index: number,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  setActiveService(
    index,
    state,
    elements,
  );

  window.scrollTo({
    top:
      getServicePosition(
        section,
        index,
        elements.copyLayers.length,
      ),

    behavior: "auto",
  });
}

function leaveSection(
  section: HTMLElement,
  direction: Direction,
  state: ServiceHighlightState,
): void {
  state.observer?.disable();

  resetImpulse(state);

  state.enteringSection =
    false;

  if (direction > 0) {
    window.scrollTo({
      top:
        getSectionEnd(section) +
        POSITION_TOLERANCE +
        2,

      behavior: "auto",
    });

    return;
  }

  window.scrollTo({
    top:
      getSectionStart(section) -
      POSITION_TOLERANCE -
      2,

    behavior: "auto",
  });
}

function executeImpulse(
  direction: Direction,
  section: HTMLElement,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  state.impulseConsumed =
    true;

  const lastIndex =
    elements.copyLayers.length -
    1;

  if (
    direction > 0 &&
    state.activeIndex ===
      lastIndex
  ) {
    leaveSection(
      section,
      1,
      state,
    );

    return;
  }

  if (
    direction < 0 &&
    state.activeIndex === 0
  ) {
    leaveSection(
      section,
      -1,
      state,
    );

    return;
  }

  moveToService(
    section,
    state.activeIndex +
      direction,
    state,
    elements,
  );
}

/* --------------------------------------------------
 * Observer input
 * -------------------------------------------------- */

function handleObserverInput(
  direction: Direction,
  rawDelta: number,
  section: HTMLElement,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  if (!isPinned(section)) {
    return;
  }

  hideScrollHint(
    state,
    elements,
  );

  const delta =
    Math.abs(rawDelta);

  if (delta <= 0) {
    return;
  }

  if (state.impulseConsumed) {
    if (
      isNewImpulse(
        direction,
        delta,
        state,
      )
    ) {
      beginNewImpulse(
        direction,
        delta,
        state,
      );
    } else {
      updateImpulseMetrics(
        direction,
        delta,
        state,
      );

      return;
    }
  }

  if (state.enteringSection) {
    state.impulseConsumed =
      true;

    state.impulseDirection =
      direction;

    state.previousDelta =
      delta;

    state.peakDelta =
      delta;

    state.decayDetected =
      false;

    return;
  }

  if (
    state.impulseDirection !==
      0 &&
    direction !==
      state.impulseDirection
  ) {
    state.accumulatedDelta =
      0;

    state.peakDelta =
      0;

    state.decayDetected =
      false;
  }

  state.impulseDirection =
    direction;

  state.accumulatedDelta +=
    delta;

  state.peakDelta =
    Math.max(
      state.peakDelta,
      delta,
    );

  state.previousDelta =
    delta;

  if (
    state.accumulatedDelta <
    GESTURE_THRESHOLD
  ) {
    return;
  }

  state.accumulatedDelta =
    0;

  executeImpulse(
    direction,
    section,
    state,
    elements,
  );
}

/* --------------------------------------------------
 * GSAP Observer
 * -------------------------------------------------- */

function createServiceObserver(
  section: HTMLElement,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): Observer {
  const observer =
    Observer.create({
      target: window,

      type:
        "wheel,touch",

      preventDefault: true,

      lockAxis: true,

      debounce: true,

      tolerance: 4,

      onStopDelay:
        OBSERVER_STOP_DELAY,

      onDown: (self) => {
        handleObserverInput(
          1,
          self.deltaY,
          section,
          state,
          elements,
        );
      },

      onUp: (self) => {
        handleObserverInput(
          -1,
          self.deltaY,
          section,
          state,
          elements,
        );
      },

      onStop: () => {
        resetImpulse(state);

        state.enteringSection =
          false;

        scheduleScrollHint(
          section,
          state,
          elements,
        );
      },
    });

  observer.disable();

  return observer;
}

/* --------------------------------------------------
 * Window scroll
 * -------------------------------------------------- */

function handleWindowScroll(
  section: HTMLElement,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  const pinned =
    isPinned(section);

  const currentScrollY =
    window.scrollY;

  const movingDown =
    currentScrollY >=
    state.previousScrollY;

  if (
    pinned &&
    !state.wasPinned
  ) {
    resetImpulse(state);

    state.enteringSection =
      true;

    state.impulseConsumed =
      true;

    if (movingDown) {
      setActiveService(
        0,
        state,
        elements,
      );

      window.scrollTo({
        top:
          getSectionStart(
            section,
          ),

        behavior: "auto",
      });
    } else {
      const lastIndex =
        elements.copyLayers.length -
        1;

      setActiveService(
        lastIndex,
        state,
        elements,
      );

      window.scrollTo({
        top:
          getSectionEnd(
            section,
          ),

        behavior: "auto",
      });
    }

    state.observer?.enable();

    hideScrollHint(
      state,
      elements,
    );
  }

  if (
    !pinned &&
    state.wasPinned
  ) {
    state.observer?.disable();

    resetImpulse(state);

    state.enteringSection =
      false;

    hideScrollHint(
      state,
      elements,
    );
  }

  state.wasPinned =
    pinned;

  state.previousScrollY =
    window.scrollY;
}

/* --------------------------------------------------
 * Resize
 * -------------------------------------------------- */

function handleResize(
  section: HTMLElement,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  if (!isPinned(section)) {
    return;
  }

  window.scrollTo({
    top:
      getServicePosition(
        section,
        state.activeIndex,
        elements.copyLayers.length,
      ),

    behavior: "auto",
  });
}

/* --------------------------------------------------
 * Initialisation
 * -------------------------------------------------- */

function initializeSection(
  section: HTMLElement,
): void {
  if (
    section.dataset
      .serviceHighlightsInitialized ===
    "true"
  ) {
    return;
  }

  const elements =
    getElements(section);

  if (!elements) {
    return;
  }

  section.dataset
    .serviceHighlightsInitialized =
    "true";

  const pinnedInitially =
    isPinned(section);

  const state:
    ServiceHighlightState = {
      activeIndex: -1,

      observer: null,

      wasPinned:
        pinnedInitially,

      previousScrollY:
        window.scrollY,

      enteringSection:
        false,

      impulseConsumed:
        false,

      accumulatedDelta:
        0,

      previousDelta:
        0,

      peakDelta:
        0,

      impulseDirection:
        0,

      decayDetected:
        false,
    };

  setActiveService(
    0,
    state,
    elements,
  );

  state.observer =
    createServiceObserver(
      section,
      state,
      elements,
    );

  if (pinnedInitially) {
    const sectionStart =
      getSectionStart(
        section,
      );

    const travel =
      getSectionTravel(
        section,
      );

    const progress =
      travel === 0
        ? 0
        : Math.min(
            Math.max(
              (
                window.scrollY -
                sectionStart
              ) /
                travel,
              0,
            ),
            1,
          );

    const initialIndex =
      Math.round(
        progress *
          (
            elements
              .copyLayers
              .length -
            1
          ),
      );

    setActiveService(
      initialIndex,
      state,
      elements,
    );

    state.observer.enable();

    scheduleScrollHint(
      section,
      state,
      elements,
    );
  }

  window.addEventListener(
    "scroll",
    () => {
      handleWindowScroll(
        section,
        state,
        elements,
      );
    },
    {
      passive: true,
    },
  );

  window.addEventListener(
    "resize",
    () => {
      handleResize(
        section,
        state,
        elements,
      );
    },
    {
      passive: true,
    },
  );
}

/* --------------------------------------------------
 * Public initializer
 * -------------------------------------------------- */

export function initServiceHighlights(): void {
  document
    .querySelectorAll<HTMLElement>(
      SECTION_SELECTOR,
    )
    .forEach(
      initializeSection,
    );
}