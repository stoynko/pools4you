import gsap from "gsap";

/* --------------------------------------------------
 * Configuration
 * -------------------------------------------------- */

const SERVICE_CONTROL_ATTRIBUTE =
  "serviceHighlightsControl";

const PROGRAMMATIC_SCROLL_ATTRIBUTE =
  "programmaticScroll";

/*
 * Higher value = faster / tighter.
 * Lower value = softer / more floaty.
 *
 * Good range:
 * 0.12 - 0.2
 */
const SCROLL_LERP = 0.16;

/*
 * Stop interpolating once the remaining
 * distance is smaller than this.
 */
const STOP_THRESHOLD = 0.5;

/*
 * Converts wheel events reported in "lines"
 * into approximately equivalent pixels.
 */
const LINE_HEIGHT_PX = 16;

/* --------------------------------------------------
 * State
 * -------------------------------------------------- */

let currentY = 0;
let targetY = 0;

let tickerActive = false;
let initialized = false;

/* --------------------------------------------------
 * Helpers
 * -------------------------------------------------- */

function prefersReducedMotion(): boolean {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

function isProgrammaticScrollActive(): boolean {
  return (
    document.documentElement.dataset[
      PROGRAMMATIC_SCROLL_ATTRIBUTE
    ] === "true"
  );
}

function isServiceHighlightsControlling(): boolean {
  return (
    document.documentElement.dataset[
      SERVICE_CONTROL_ATTRIBUTE
    ] === "true"
  );
}

function isSpecialScrollActive(): boolean {
  return (
    isProgrammaticScrollActive() ||
    isServiceHighlightsControlling()
  );
}

function getMaximumScrollY(): number {
  return Math.max(
    document.documentElement.scrollHeight -
      window.innerHeight,
    0,
  );
}

function clampScrollY(
  value: number,
): number {
  return gsap.utils.clamp(
    0,
    getMaximumScrollY(),
    value,
  );
}

/* --------------------------------------------------
 * Wheel normalization
 * -------------------------------------------------- */

function normalizeWheelDelta(
  event: WheelEvent,
): number {
  if (
    event.deltaMode ===
    WheelEvent.DOM_DELTA_LINE
  ) {
    return (
      event.deltaY *
      LINE_HEIGHT_PX
    );
  }

  if (
    event.deltaMode ===
    WheelEvent.DOM_DELTA_PAGE
  ) {
    return (
      event.deltaY *
      window.innerHeight
    );
  }

  return event.deltaY;
}

/* --------------------------------------------------
 * State synchronization
 * -------------------------------------------------- */

function syncWithWindow(): void {
  const scrollY =
    window.scrollY;

  currentY =
    scrollY;

  targetY =
    scrollY;
}

/* --------------------------------------------------
 * GSAP ticker
 * -------------------------------------------------- */

function stopTicker(): void {
  if (!tickerActive) {
    return;
  }

  gsap.ticker.remove(
    updateScroll,
  );

  tickerActive =
    false;
}

function stopAndSync(): void {
  stopTicker();

  syncWithWindow();
}

function updateScroll(): void {
  /*
   * ServiceHighlights or another programmatic
   * scroll operation has taken ownership.
   *
   * Forget all remaining wheel momentum.
   */
  if (
    isSpecialScrollActive()
  ) {
    stopAndSync();

    return;
  }

  const difference =
    targetY -
    currentY;

  if (
    Math.abs(
      difference,
    ) <=
    STOP_THRESHOLD
  ) {
    currentY =
      targetY;

    window.scrollTo(
      0,
      currentY,
    );

    stopTicker();

    return;
  }

  currentY +=
    difference *
    SCROLL_LERP;

  window.scrollTo(
    0,
    currentY,
  );
}

function startTicker(): void {
  if (tickerActive) {
    return;
  }

  tickerActive =
    true;

  gsap.ticker.add(
    updateScroll,
  );
}

/* --------------------------------------------------
 * Wheel handling
 * -------------------------------------------------- */

function shouldIgnoreWheel(
  event: WheelEvent,
): boolean {
  /*
   * Browser zoom:
   *
   * Ctrl + wheel on Windows/Linux and
   * some trackpad gestures use this.
   */
  if (event.ctrlKey) {
    return true;
  }

  /*
   * Do not hijack predominantly horizontal
   * scrolling.
   */
  if (
    Math.abs(
      event.deltaX,
    ) >
    Math.abs(
      event.deltaY,
    )
  ) {
    return true;
  }

  if (
    isSpecialScrollActive()
  ) {
    return true;
  }

  if (
    prefersReducedMotion()
  ) {
    return true;
  }

  return false;
}

function handleWheel(
  event: WheelEvent,
): void {
  if (
    shouldIgnoreWheel(
      event,
    )
  ) {
    /*
     * If another scroll system has just
     * taken over, ensure no old wheel
     * momentum remains.
     */
    if (
      isSpecialScrollActive()
    ) {
      stopAndSync();
    }

    return;
  }

  const deltaY =
    normalizeWheelDelta(
      event,
    );

  if (
    deltaY === 0
  ) {
    return;
  }

  event.preventDefault();

  /*
   * When starting a completely new motion,
   * use the browser's actual position as
   * the source of truth.
   */
  if (!tickerActive) {
    syncWithWindow();
  }

  targetY =
    clampScrollY(
      targetY +
        deltaY,
    );

  startTicker();
}

/* --------------------------------------------------
 * Native scroll synchronization
 * -------------------------------------------------- */

function handleNativeScroll(): void {
  /*
   * While our ticker is active, the scroll
   * event is caused by our own window.scrollTo().
   */
  if (tickerActive) {
    return;
  }

  syncWithWindow();
}

function handleResize(): void {
  targetY =
    clampScrollY(
      targetY,
    );

  currentY =
    clampScrollY(
      currentY,
    );

  if (!tickerActive) {
    syncWithWindow();
  }
}

/* --------------------------------------------------
 * Other native input
 * -------------------------------------------------- */

function handlePointerDown(): void {
  /*
   * Scrollbar dragging or other pointer-driven
   * navigation should immediately cancel
   * remaining wheel momentum.
   */
  stopAndSync();
}

function handleTouchStart(): void {
  /*
   * Touch remains completely native.
   */
  stopAndSync();
}

function handleKeyDown(
  event: KeyboardEvent,
): void {
  const nativeScrollKeys = [
    "ArrowUp",
    "ArrowDown",
    "PageUp",
    "PageDown",
    "Home",
    "End",
    " ",
  ];

  if (
    !nativeScrollKeys.includes(
      event.key,
    )
  ) {
    return;
  }

  /*
   * Let keyboard scrolling remain native.
   */
  stopAndSync();
}

/* --------------------------------------------------
 * Programmatic scroll events
 * -------------------------------------------------- */

function handleProgrammaticScrollStart(): void {
  stopAndSync();
}

function handleProgrammaticScrollEnd(): void {
  syncWithWindow();
}

/* --------------------------------------------------
 * Initialization
 * -------------------------------------------------- */

export function initSmoothWheelScroll(): void {
  /*
   * main.ts runs immediately and again on
   * astro:page-load.
   *
   * Global window listeners only need to be
   * installed once.
   */
  if (initialized) {
    stopAndSync();

    return;
  }

  initialized =
    true;

  syncWithWindow();

  window.addEventListener(
    "wheel",
    handleWheel,
    {
      passive: false,
    },
  );

  window.addEventListener(
    "scroll",
    handleNativeScroll,
    {
      passive: true,
    },
  );

  window.addEventListener(
    "resize",
    handleResize,
    {
      passive: true,
    },
  );

  window.addEventListener(
    "pointerdown",
    handlePointerDown,
    {
      passive: true,
    },
  );

  window.addEventListener(
    "touchstart",
    handleTouchStart,
    {
      passive: true,
    },
  );

  window.addEventListener(
    "keydown",
    handleKeyDown,
  );

  window.addEventListener(
    "site:programmatic-scroll-start",
    handleProgrammaticScrollStart,
  );

  window.addEventListener(
    "site:programmatic-scroll-end",
    handleProgrammaticScrollEnd,
  );
}