import gsap from "gsap";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

const SECTION_SELECTOR = "[data-service-highlights]";
const IMAGE_SELECTOR = "[data-service-image]";
const COPY_SELECTOR = "[data-service-copy]";
const SCROLL_HINT_SELECTOR = "[data-service-scroll-hint]";

const GESTURE_THRESHOLD = 30;
const NEW_IMPULSE_MIN_DELTA = 12;
const NEW_IMPULSE_ACCELERATION = 1.7;
const DECAY_FROM_PEAK_RATIO = 0.6;
const OBSERVER_STOP_DELAY = 0.14;
const SCROLL_HINT_DELAY_MS = 3000;
const POSITION_TOLERANCE = 4;

/* SERVICE HIGHLIGHTS ENTRY TRIGGER
  - LARGER VALUE - TAKEOVER HAPPENS EARLIER
*/
const ENTRY_TRIGGER_VIEWPORT_RATIO = 0.85;

/*
  DURATION OF THE AUTOMATIC SCROLL THAT 
  BRINGS SERVICE HIGHLIGHTS INTO ITS FULLY PINNED POSITION
 */
const ENTRY_SNAP_DURATION = 0.35;

const IMAGE_FADE_DURATION = 1;
const IMAGE_KEN_BURNS_DURATION = 2;
const IMAGE_KEN_BURNS_SCALE = 1.06;

const ENTRANCE_TITLE_DURATION = 0.78;
const ENTRANCE_DESCRIPTION_DURATION = 0.72;
const ENTRANCE_CTA_DURATION = 0.66;

type Direction = 1 | -1;

type ServiceHighlightElements = {
  images: HTMLElement[];
  copyLayers: HTMLElement[];
  scrollHint: HTMLElement | null;
};

type ServiceHighlightState = {
  activeIndex: number;
  observer: Observer | null;
  wasPinned: boolean;
  previousScrollY: number;
  enteringSection: boolean;
  autoEntering: boolean;
  impulseConsumed: boolean;
  accumulatedDelta: number;
  previousDelta: number;
  peakDelta: number;
  impulseDirection: Direction | 0;
  decayDetected: boolean;
  hintTimer?: number;
  entrancePrepared: boolean;
  entrancePlayed: boolean;
};

type EntranceTargets = {
  imageLayer: HTMLElement;

  image: HTMLElement | null;

  title: HTMLElement | null;

  description: HTMLElement | null;

  cta: HTMLElement | null;
};

/* --------------------------------------------------
 * Programmatic scrolling
 * -------------------------------------------------- */

function isProgrammaticScrollActive(): boolean {
  return (
    document.documentElement.dataset
      .programmaticScroll === "true"
  );
}

/* --------------------------------------------------
 * DOM
 * -------------------------------------------------- */

function getElements(
  section: HTMLElement,
): ServiceHighlightElements | null {
  const images = Array.from(
    section.querySelectorAll<HTMLElement>(
      IMAGE_SELECTOR,
    ),
  );

  const copyLayers = Array.from(
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
    copyLayers.length === 0 ||
    images.length !== copyLayers.length
  ) {
    return null;
  }

  return {
    images,
    copyLayers,
    scrollHint,
  };
}

function getImageElement(
  layer: HTMLElement | null,
): HTMLElement | null {
  return (
    layer?.querySelector<HTMLElement>(
      "img",
    ) ?? null
  );
}

/* --------------------------------------------------
 * Entrance targets
 * -------------------------------------------------- */

function getEntranceTargets(
  elements: ServiceHighlightElements,
): EntranceTargets | null {
  const imageLayer =
    elements.images[0];

  const copyLayer =
    elements.copyLayers[0];

  if (
    !imageLayer ||
    !copyLayer
  ) {
    return null;
  }

  return {
    imageLayer,

    image:
      getImageElement(
        imageLayer,
      ),

    title:
      copyLayer.querySelector<HTMLElement>(
        ".service-highlights__title",
      ),

    description:
      copyLayer.querySelector<HTMLElement>(
        ".service-highlights__description",
      ),

    cta:
      copyLayer.querySelector<HTMLElement>(
        ".service-highlights__cta",
      ),
  };
}

/* --------------------------------------------------
 * Image state
 * -------------------------------------------------- */

function setStaticImageState(
  activeIndex: number,
  elements: ServiceHighlightElements,
): void {
  elements.images.forEach(
    (
      layer,
      index,
    ) => {
      gsap.killTweensOf(
        layer,
      );

      const image =
        getImageElement(
          layer,
        );

      if (image) {
        gsap.killTweensOf(
          image,
        );
      }

      gsap.set(
        layer,
        {
          opacity:
            index === activeIndex
              ? 1
              : 0,

          zIndex:
            index === activeIndex
              ? 2
              : 1,
        },
      );

      if (image) {
        gsap.set(
          image,
          {
            scale: 1.06,
          },
        );
      }
    },
  );
}

/* --------------------------------------------------
 * Ken Burns image transition
 * -------------------------------------------------- */

function animateServiceImage(
  previousIndex: number,
  nextIndex: number,
  elements: ServiceHighlightElements,
): void {
  const previousLayer =
    previousIndex >= 0
      ? (
          elements.images[
            previousIndex
          ] ?? null
        )
      : null;

  const nextLayer =
    elements.images[
      nextIndex
    ] ?? null;

  if (!nextLayer) {
    return;
  }

  const previousImage =
    getImageElement(
      previousLayer,
    );

  const nextImage =
    getImageElement(
      nextLayer,
    );

  /*
   * Stop any old image animation first.
   *
   * This prevents a fast gesture from leaving
   * several images partially visible.
   */
  elements.images.forEach(
    (
      layer,
      index,
    ) => {
      gsap.killTweensOf(
        layer,
      );

      const image =
        getImageElement(
          layer,
        );

      if (image) {
        gsap.killTweensOf(
          image,
        );
      }

      gsap.set(
        layer,
        {
          zIndex:
            index === nextIndex
              ? 2
              : 1,
        },
      );
    },
  );

  const tl =
    gsap.timeline();

  /*
   * Fade previous service away.
   */
  if (
    previousLayer &&
    previousLayer !== nextLayer
  ) {
    tl.to(
      previousLayer,
      {
        opacity: 0,

        duration:
          IMAGE_FADE_DURATION,

        ease:
          "power2.out",
      },
      0,
    );
  }

  /*
   * Fade new service in.
   */
  tl.fromTo(
    nextLayer,
    {
      opacity: 0,
    },
    {
      opacity: 1,

      duration:
        IMAGE_FADE_DURATION,

      ease:
        "power2.inOut",
    },
    0,
  );

  if (nextImage) {
    tl.fromTo(
      nextImage,
      {
        scale: 1,
      },
      {
        scale:
          IMAGE_KEN_BURNS_SCALE,

        duration:
          IMAGE_KEN_BURNS_DURATION,

        ease:
          "power1.inOut",
      },
      0,
    );
  }

  if (
    previousImage &&
    previousLayer !== nextLayer
  ) {
    tl.set(
      previousImage,
      {
        scale: 1,
      },
      IMAGE_FADE_DURATION,
    );
  }
}

/* --------------------------------------------------
 * Active service
 * -------------------------------------------------- */

function setActiveService(
  index: number,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
  animateImage = true,
): void {
  const lastIndex =
    elements.copyLayers.length -
    1;

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

  const previousIndex =
    state.activeIndex;

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

  if (animateImage) {
    animateServiceImage(
      previousIndex,
      nextIndex,
      elements,
    );
  } else {
    setStaticImageState(
      nextIndex,
      elements,
    );
  }

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
 * Prepare first entrance
 * -------------------------------------------------- */

function prepareEntranceAnimation(
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  if (
    state.entrancePrepared ||
    state.entrancePlayed
  ) {
    return;
  }

  const targets =
    getEntranceTargets(
      elements,
    );

  if (!targets) {
    state.entrancePlayed =
      true;

    return;
  }

  gsap.set(
    targets.imageLayer,
    {
      opacity: 0,

      zIndex: 2,
    },
  );

  if (targets.image) {
    gsap.set(
      targets.image,
      {
        scale: 1,

        transformOrigin:
          "50% 50%",
      },
    );
  }

  if (targets.title) {
    gsap.set(
      targets.title,
      {
        autoAlpha: 0,

        y: 40,
      },
    );
  }

  if (targets.description) {
    gsap.set(
      targets.description,
      {
        autoAlpha: 0,

        y: 28,
      },
    );
  }

  if (targets.cta) {
    gsap.set(
      targets.cta,
      {
        autoAlpha: 0,

        y: 22,

        scale: 0.97,

        transformOrigin:
          "50% 50%",
      },
    );
  }

  state.entrancePrepared =
    true;
}

/* --------------------------------------------------
 * Cancel prepared entrance
 * -------------------------------------------------- */

function clearPreparedEntrance(
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  if (
    !state.entrancePrepared ||
    state.entrancePlayed
  ) {
    return;
  }

  const targets =
    getEntranceTargets(
      elements,
    );

  if (!targets) {
    state.entrancePrepared =
      false;

    state.entrancePlayed =
      true;

    return;
  }

  gsap.set(
    targets.imageLayer,
    {
      opacity: 1,

      clearProps:
        "zIndex",
    },
  );

  const clearTargets = [
    targets.image,
    targets.title,
    targets.description,
    targets.cta,
  ].filter(
    (
      target,
    ): target is HTMLElement =>
      target !== null,
  );

  gsap.set(
    clearTargets,
    {
      clearProps:
        "opacity,visibility,transform",
    },
  );

  state.entrancePrepared =
    false;

  state.entrancePlayed =
    true;
}

/* --------------------------------------------------
 * First entrance animation
 * -------------------------------------------------- */

function playEntranceAnimation(
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  if (
    state.entrancePlayed ||
    isProgrammaticScrollActive()
  ) {
    return;
  }

  if (!state.entrancePrepared) {
    prepareEntranceAnimation(
      state,
      elements,
    );
  }

  const targets =
    getEntranceTargets(
      elements,
    );

  if (!targets) {
    state.entrancePlayed =
      true;

    return;
  }

  state.entrancePlayed =
    true;

  gsap.killTweensOf(
    targets.imageLayer,
  );

  if (targets.image) {
    gsap.killTweensOf(
      targets.image,
    );
  }

  const tl =
    gsap.timeline({
      defaults: {
        ease:
          "power3.out",
      },

      onComplete: () => {

        const clearTargets = [
          targets.title,
          targets.description,
          targets.cta,
        ].filter(
          (
            target,
          ): target is HTMLElement =>
            target !== null,
        );

        gsap.set(
          clearTargets,
          {
            clearProps:
              "opacity,visibility,transform",
          },
        );

        state.entrancePrepared =
          false;
      },
    });

  /*
   * Image fade.
   */
  tl.to(
    targets.imageLayer,
    {
      opacity: 1,

      duration:
        IMAGE_FADE_DURATION,

      ease:
        "power2.inOut",
    },
    0,
  );

  /*
   * Ken Burns zoom.
   */
  if (targets.image) {
    tl.to(
      targets.image,
      {
        scale:
          IMAGE_KEN_BURNS_SCALE,

        duration:
          IMAGE_KEN_BURNS_DURATION,

        ease:
          "power1.inOut",
      },
      0,
    );
  }

  /*
   * Title.
   */
  if (targets.title) {
    tl.to(
      targets.title,
      {
        autoAlpha: 1,

        y: 0,

        duration:
          ENTRANCE_TITLE_DURATION,
      },
      0.16,
    );
  }

  /*
   * Description.
   */
  if (targets.description) {
    tl.to(
      targets.description,
      {
        autoAlpha: 1,

        y: 0,

        duration:
          ENTRANCE_DESCRIPTION_DURATION,
      },
      0.3,
    );
  }

  /*
   * CTA.
   */
  if (targets.cta) {
    tl.to(
      targets.cta,
      {
        autoAlpha: 1,

        y: 0,

        scale: 1,

        duration:
          ENTRANCE_CTA_DURATION,
      },
      0.44,
    );
  }
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
 * Automatic section entry
 * -------------------------------------------------- */

function shouldAutoEnterSection(
  section: HTMLElement,
  state: ServiceHighlightState,
): boolean {
  if (
    state.autoEntering ||
    state.wasPinned ||
    isProgrammaticScrollActive()
  ) {
    return false;
  }

  const rect =
    section.getBoundingClientRect();

  if (
    rect.top <=
    POSITION_TOLERANCE
  ) {
    return false;
  }

  const triggerY =
    window.innerHeight *
    ENTRY_TRIGGER_VIEWPORT_RATIO;

  const movingDown =
    window.scrollY >
    state.previousScrollY;

  return (
    movingDown &&
    rect.top <= triggerY
  );
}

function autoEnterSection(
  section: HTMLElement,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  if (
    state.autoEntering ||
    isProgrammaticScrollActive()
  ) {
    return;
  }

  state.autoEntering =
    true;

  state.observer?.disable();

  hideScrollHint(
    state,
    elements,
  );

  resetImpulse(
    state,
  );

  if (
    state.activeIndex !== 0
  ) {
    setActiveService(
      0,
      state,
      elements,
      false,
    );
  }

  const scrollPosition = {
    y: window.scrollY,
  };

  const targetY =
    getSectionStart(
      section,
    );

  gsap.to(
    scrollPosition,
    {
      y:
        targetY,

      duration:
        ENTRY_SNAP_DURATION,

      ease:
        "power2.inOut",

      overwrite:
        true,

      onUpdate: () => {
        if (
          isProgrammaticScrollActive()
        ) {
          return;
        }

        window.scrollTo(
          0,
          scrollPosition.y,
        );
      },

      onComplete: () => {
        if (
          isProgrammaticScrollActive()
        ) {
          state.autoEntering =
            false;

          return;
        }

        window.scrollTo({
          top:
            getSectionStart(
              section,
            ),

          behavior:
            "auto",
        });

        state.autoEntering =
          false;

        state.wasPinned =
          true;

        state.previousScrollY =
          window.scrollY;

        resetImpulse(
          state,
        );

        state.enteringSection =
          true;

        state.impulseConsumed =
          true;

        state.observer?.enable();

        hideScrollHint(
          state,
          elements,
        );

        requestAnimationFrame(
          () => {
            playEntranceAnimation(
              state,
              elements,
            );
          },
        );
      },
    },
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
  clearHintTimer(
    state,
  );

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
  if (
    isProgrammaticScrollActive()
  ) {
    return;
  }

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

        if (
          isProgrammaticScrollActive() ||
          !isPinned(section)
        ) {
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
 * Gesture impulse
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
  if (
    isProgrammaticScrollActive()
  ) {
    return;
  }

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

    behavior:
      "auto",
  });
}

function leaveSection(
  section: HTMLElement,
  direction: Direction,
  state: ServiceHighlightState,
): void {
  if (
    isProgrammaticScrollActive()
  ) {
    return;
  }

  state.observer?.disable();

  resetImpulse(
    state,
  );

  state.enteringSection =
    false;

  if (direction > 0) {
    window.scrollTo({
      top:
        getSectionEnd(
          section,
        ) +
        POSITION_TOLERANCE +
        2,

      behavior:
        "auto",
    });

    return;
  }

  window.scrollTo({
    top:
      getSectionStart(
        section,
      ) -
      POSITION_TOLERANCE -
      2,

    behavior:
      "auto",
  });
}

function executeImpulse(
  direction: Direction,
  section: HTMLElement,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  if (
    isProgrammaticScrollActive()
  ) {
    return;
  }

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
  if (
    isProgrammaticScrollActive() ||
    state.autoEntering ||
    !isPinned(section)
  ) {
    return;
  }

  hideScrollHint(
    state,
    elements,
  );

  const delta =
    Math.abs(
      rawDelta,
    );

  if (delta <= 0) {
    return;
  }

  if (
    state.impulseConsumed
  ) {
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

  if (
    state.enteringSection
  ) {
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
      target:
        window,

      type:
        "wheel,touch",

      preventDefault:
        true,

      lockAxis:
        true,

      debounce:
        true,

      tolerance:
        4,

      onStopDelay:
        OBSERVER_STOP_DELAY,

      onDown: (
        self: Observer,
      ) => {
        if (
          isProgrammaticScrollActive() ||
          state.autoEntering
        ) {
          return;
        }

        handleObserverInput(
          1,
          self.deltaY,
          section,
          state,
          elements,
        );
      },

      onUp: (
        self: Observer,
      ) => {
        if (
          isProgrammaticScrollActive() ||
          state.autoEntering
        ) {
          return;
        }

        handleObserverInput(
          -1,
          self.deltaY,
          section,
          state,
          elements,
        );
      },

      onStop: () => {
        if (
          isProgrammaticScrollActive() ||
          state.autoEntering
        ) {
          return;
        }

        resetImpulse(
          state,
        );

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
  if (
    isProgrammaticScrollActive()
  ) {
    return;
  }

  if (
    state.autoEntering
  ) {
    return;
  }

  if (
    shouldAutoEnterSection(
      section,
      state,
    )
  ) {
    autoEnterSection(
      section,
      state,
      elements,
    );

    return;
  }

  const pinned =
    isPinned(
      section,
    );

  const currentScrollY =
    window.scrollY;

  const movingDown =
    currentScrollY >=
    state.previousScrollY;

  if (
    pinned &&
    !state.wasPinned
  ) {
    resetImpulse(
      state,
    );

    state.enteringSection =
      true;

    state.impulseConsumed =
      true;

    /*
     * Normal top-to-bottom entry.
     */
    if (movingDown) {
      if (
        state.activeIndex !== 0
      ) {
        setActiveService(
          0,
          state,
          elements,
          false,
        );
      }

      window.scrollTo({
        top:
          getSectionStart(
            section,
          ),

        behavior:
          "auto",
      });

      requestAnimationFrame(
        () => {
          playEntranceAnimation(
            state,
            elements,
          );
        },
      );
    } else {

      clearPreparedEntrance(
        state,
        elements,
      );

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

        behavior:
          "auto",
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

    resetImpulse(
      state,
    );

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
  if (
    isProgrammaticScrollActive() ||
    state.autoEntering ||
    !isPinned(section)
  ) {
    return;
  }

  window.scrollTo({
    top:
      getServicePosition(
        section,
        state.activeIndex,
        elements.copyLayers.length,
      ),

    behavior:
      "auto",
  });
}

/* --------------------------------------------------
 * Programmatic scrolling
 * -------------------------------------------------- */

function suspendServiceHighlights(
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {

  state.autoEntering =
    false;

  state.observer?.disable();

  resetImpulse(
    state,
  );

  state.enteringSection =
    false;

  hideScrollHint(
    state,
    elements,
  );
}

function resumeServiceHighlights(
  section: HTMLElement,
  state: ServiceHighlightState,
  elements: ServiceHighlightElements,
): void {
  state.autoEntering =
    false;

  const pinned =
    isPinned(
      section,
    );

  state.wasPinned =
    pinned;

  state.previousScrollY =
    window.scrollY;

  resetImpulse(
    state,
  );

  state.enteringSection =
    false;

  if (!pinned) {
    state.observer?.disable();

    hideScrollHint(
      state,
      elements,
    );

    return;
  }

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

  const index =
    Math.round(
      progress *
        (
          elements
            .copyLayers
            .length -
          1
        ),
    );

  if (
    index === 0 &&
    !state.entrancePlayed
  ) {
    if (
      state.activeIndex !== 0
    ) {
      setActiveService(
        0,
        state,
        elements,
        false,
      );
    }

    requestAnimationFrame(
      () => {
        playEntranceAnimation(
          state,
          elements,
        );
      },
    );
  } else {
    if (
      index !== 0 &&
      !state.entrancePlayed
    ) {
      clearPreparedEntrance(
        state,
        elements,
      );
    }

    if (
      index !==
      state.activeIndex
    ) {
      setActiveService(
        index,
        state,
        elements,
      );
    }
  }

  state.observer?.enable();

  scheduleScrollHint(
    section,
    state,
    elements,
  );
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
    getElements(
      section,
    );

  if (!elements) {
    return;
  }

  section.dataset
    .serviceHighlightsInitialized =
    "true";

  const pinnedInitially =
    isPinned(
      section,
    );

  const state:
    ServiceHighlightState = {
      activeIndex:
        -1,

      observer:
        null,

      wasPinned:
        pinnedInitially,

      previousScrollY:
        window.scrollY,

      enteringSection:
        false,

      autoEntering:
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

      entrancePrepared:
        false,

      entrancePlayed:
        false,
    };

  /*
   * Establish service 1 without animation.
   *
   * This happens while the section is normally still
   * below the viewport.
   */
  setActiveService(
    0,
    state,
    elements,
    false,
  );

  prepareEntranceAnimation(
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

    if (
      initialIndex === 0
    ) {
      requestAnimationFrame(
        () => {
          playEntranceAnimation(
            state,
            elements,
          );
        },
      );
    } else {

      clearPreparedEntrance(
        state,
        elements,
      );

      setActiveService(
        initialIndex,
        state,
        elements,
        false,
      );
    }

    if (
      !isProgrammaticScrollActive()
    ) {
      state.observer.enable();

      scheduleScrollHint(
        section,
        state,
        elements,
      );
    }
  }

  /* ------------------------------------------------
   * Programmatic scroll events
   * ------------------------------------------------ */

  window.addEventListener(
    "site:programmatic-scroll-start",
    () => {
      suspendServiceHighlights(
        state,
        elements,
      );
    },
  );

  window.addEventListener(
    "site:programmatic-scroll-end",
    () => {
      resumeServiceHighlights(
        section,
        state,
        elements,
      );
    },
  );

  /* ------------------------------------------------
   * Native events
   * ------------------------------------------------ */

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
      passive:
        true,
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
      passive:
        true,
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