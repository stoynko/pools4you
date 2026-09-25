import gsap from "gsap";

const SERVICE_CONTROL_ATTRIBUTE = "serviceHighlightsControl";
const PROGRAMMATIC_SCROLL_ATTRIBUTE = "programmaticScroll";
const SCROLL_LERP = 0.12;
const STOP_THRESHOLD = 0.5;
const LINE_HEIGHT_PX = 16;
const SAFARI_SMOOTHING_MS = 130;
const SAFARI_MAX_FRAME_MS = 64;

let currentY = 0;
let targetY = 0;

let tickerActive = false;
let initialized = false;
let useSafariSmoothing = false;
let lastFrameTime = 0;
let lastWheelDirection = 0;

function isSafari(): boolean {
  const { userAgent } = window.navigator;
  return /AppleWebKit\//.test(userAgent) && /Version\/\d+.*Safari\//.test(userAgent) &&
    !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|OPiOS|Android/.test(userAgent);
}

function isInsideScrollablePanel(event: WheelEvent): boolean {
  for (const target of event.composedPath()) {
    if (!(target instanceof HTMLElement)) continue;
    if (target === document.body || target === document.documentElement) break;

    const { overflowY } = window.getComputedStyle(target);
    if (/^(auto|scroll|overlay)$/.test(overflowY) &&
        target.scrollHeight > target.clientHeight) {
      return true;
    }
  }
  return false;
}

function shouldUseNativeSafariScroll(event: WheelEvent): boolean {
  if (event.defaultPrevented || !event.cancelable || event.metaKey ||
      event.shiftKey || event.deltaY === 0) return true;

  const rootOverflow = window.getComputedStyle(document.documentElement).overflowY;
  const bodyOverflow = window.getComputedStyle(document.body).overflowY;
  return /^(hidden|clip)$/.test(rootOverflow) ||
    /^(hidden|clip)$/.test(bodyOverflow) ||
    isInsideScrollablePanel(event);
}

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
  if (useSafariSmoothing) {
    lastWheelDirection = 0;
  }
}

function updateScroll(): void {

  if (isSpecialScrollActive() || (useSafariSmoothing && prefersReducedMotion())) {
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

  let amount = SCROLL_LERP;
  if (useSafariSmoothing) {
    const now = performance.now();
    const elapsed = Math.min(Math.max(now - lastFrameTime, 0), SAFARI_MAX_FRAME_MS);
    lastFrameTime = now;
    amount = 1 - Math.exp(-elapsed / SAFARI_SMOOTHING_MS);
  }

  currentY += difference * amount;
  window.scrollTo(0, currentY);
}

function startTicker(): void {
  if (tickerActive) {
    return;
  }

  tickerActive = true;
  if (useSafariSmoothing) {
    lastFrameTime = performance.now();
  }
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
  if (useSafariSmoothing && shouldUseNativeSafariScroll(event)) {
    stopAndSync();
    return;
  }

  if (shouldIgnoreWheel(event)) {
    if (useSafariSmoothing || isSpecialScrollActive()) {
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

  if (useSafariSmoothing) {
    const maximumY = getMaximumScrollY();
    currentY = gsap.utils.clamp(0, maximumY, window.scrollY);
    const direction = Math.sign(deltaY);
    if (direction !== lastWheelDirection) targetY = currentY;
    lastWheelDirection = direction;

    // Bound queued travel relative to the actual position, including large wheel impulses.
    const maximumTravel = Math.min(1200, Math.max(200, window.innerHeight * 0.75));
    targetY = gsap.utils.clamp(
      Math.max(0, currentY - maximumTravel),
      Math.min(maximumY, currentY + maximumTravel),
      targetY + deltaY,
    );
  } else {
    targetY = clampScrollY(targetY +deltaY);
  }
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
  useSafariSmoothing = isSafari();
  syncWithWindow();

  if (useSafariSmoothing) {
    window.matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", stopAndSync);
  }

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