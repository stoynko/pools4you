import gsap from "gsap";

const SERVICE_CONTROL_ATTRIBUTE = "serviceHighlightsControl";
const PROGRAMMATIC_SCROLL_ATTRIBUTE = "programmaticScroll";
const SCROLL_LERP = 0.12;
const STOP_THRESHOLD = 0.5;
const LINE_HEIGHT_PX = 16;

let currentY = 0;
let targetY = 0;

let tickerActive = false;
let initialized = false;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isProgrammaticScrollActive(): boolean {
  return (document.documentElement.dataset[PROGRAMMATIC_SCROLL_ATTRIBUTE] === "true");
}

function isServiceHighlightsControlling(): boolean {
  return (
    document.documentElement.dataset[SERVICE_CONTROL_ATTRIBUTE] === "true"
  );
}

function isSpecialScrollActive(): boolean {
  return (
    isProgrammaticScrollActive() || isServiceHighlightsControlling()
  );
}

function getMaximumScrollY(): number {
  return Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
}

function clampScrollY(value: number): number {
  return gsap.utils.clamp(0, getMaximumScrollY(), value);
}

function normalizeWheelDelta(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return (event.deltaY * LINE_HEIGHT_PX);
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return (event.deltaY * window.innerHeight);
  }

  return event.deltaY;
}

function syncWithWindow(): void {
  const scrollY = window.scrollY;
  currentY = scrollY;
  targetY = scrollY;
}

function stopTicker(): void {
  if (!tickerActive) {
    return;
  }

  gsap.ticker.remove(updateScroll);
  tickerActive = false;
}

function stopAndSync(): void {
  stopTicker();
  syncWithWindow();
}

function updateScroll(): void {

  if (isSpecialScrollActive()) {
    stopAndSync();
    return;
  }

  const difference = targetY - currentY;

  if (Math.abs(difference) <= STOP_THRESHOLD) {
    currentY = targetY;
    window.scrollTo(0, currentY);
    stopTicker();
    return;
  }

  currentY += difference * SCROLL_LERP;
  window.scrollTo(0, currentY);
}

function startTicker(): void {
  if (tickerActive) {
    return;
  }

  tickerActive = true;
  gsap.ticker.add(updateScroll);
}

function shouldIgnoreWheel(event: WheelEvent): boolean {

  if (event.ctrlKey) {
    return true;
  }

  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    return true;
  }

  if (isSpecialScrollActive()) {
    return true;
  }

  if (prefersReducedMotion()) {
    return true;
  }

  return false;
}

function handleWheel(event: WheelEvent): void {
  if (shouldIgnoreWheel(event)) {
    if (isSpecialScrollActive()) {
      stopAndSync();
    }

    return;
  }

  const deltaY =normalizeWheelDelta(event);

  if (deltaY === 0) {
    return;
  }

  event.preventDefault();

  if (!tickerActive) {
    syncWithWindow();
  }

  targetY = clampScrollY(targetY +deltaY);
  startTicker();
}

function handleNativeScroll(): void {

  if (tickerActive) {
    return;
  }

  syncWithWindow();
}

function handleResize(): void {
  targetY = clampScrollY(targetY);
  currentY = clampScrollY(currentY);

  if (!tickerActive) {
    syncWithWindow();
  }
}

function handlePointerDown(): void {
  stopAndSync();
}

function handleTouchStart(): void {
  stopAndSync();
}

function handleKeyDown(event: KeyboardEvent): void {
  const nativeScrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];

  if (!nativeScrollKeys.includes(event.key)) {
    return;
  }

  stopAndSync();
}

function handleProgrammaticScrollStart(): void {
  stopAndSync();
}

function handleProgrammaticScrollEnd(): void {
  syncWithWindow();
}

export function initSmoothWheelScroll(): void {

  if (initialized) {
    stopAndSync();
    return;
  }

  initialized = true;
  syncWithWindow();

  window.addEventListener("wheel", handleWheel, {
      passive: false,
  });

  window.addEventListener("scroll", handleNativeScroll, {
    passive: true
  });

  window.addEventListener("resize", handleResize, {
      passive: true,
  });

  window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
  });

  window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
  });

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("site:programmatic-scroll-start", handleProgrammaticScrollStart);
  window.addEventListener("site:programmatic-scroll-end", handleProgrammaticScrollEnd);
}