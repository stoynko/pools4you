const TOP_THRESHOLD = 8;
const HIDE_AFTER = 80;
const DIRECTION_DEAD_ZONE = 2;
const HIDE_TRAVEL = 28;
const SHOW_TRAVEL = 16;
const REVEAL_BELOW_Y = 200;
const HEADER_ENTRANCE_FALLBACK_MS = 700;

const SCROLL_STORAGE_PREFIX = "pools4you:scroll-position:";

type NavigationType = PerformanceNavigationTiming["type"];

export function initSmartHeader(): void {
  const headerElement = document.querySelector<HTMLElement>(
    "[data-site-header]",
  );

  if (!headerElement) return;

  const header = headerElement;

  if (header.dataset.smartHeaderInitialized === "true") {
    return;
  }

  header.dataset.smartHeaderInitialized = "true";

  const storageKey = `${SCROLL_STORAGE_PREFIX}${window.location.pathname}${window.location.search}`;
  const navigationType = getNavigationType();

  let lastScrollY = Math.max(window.scrollY, 0);
  let ticking = false;
  let menuOpen = false;
  let direction = 0;
  let travelled = 0;
  let isReady = false;
  let entranceFallbackTimer: number | undefined;

  function getNavigationType(): NavigationType {
    const [navigationEntry] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];

    return navigationEntry?.type ?? "navigate";
  }

  function readStoredScrollY(): number {
    try {
      const storedValue = window.sessionStorage.getItem(storageKey);
      const parsedValue = Number(storedValue);

      return Number.isFinite(parsedValue)
        ? Math.max(parsedValue, 0)
        : 0;
    } catch {
      return 0;
    }
  }

  function storeScrollY(scrollY = window.scrollY): void {
    try {
      window.sessionStorage.setItem(
        storageKey,
        String(Math.max(scrollY, 0)),
      );
    } catch {
    }
  }

  function stopHeaderEntrance(): void {
    header.classList.remove("is-entering");

    if (entranceFallbackTimer !== undefined) {
      window.clearTimeout(entranceFallbackTimer);
      entranceFallbackTimer = undefined;
    }
  }

  function startHeaderEntrance(): void {
    if (
      header.classList.contains("is-hidden") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    header.classList.add("is-entering");

    entranceFallbackTimer = window.setTimeout(
      stopHeaderEntrance,
      HEADER_ENTRANCE_FALLBACK_MS,
    );
  }

  function handleHeaderAnimationEnd(
    event: AnimationEvent,
  ): void {
    if (
      event.target !== header ||
      event.animationName !== "slide-in-top"
    ) {
      return;
    }

    stopHeaderEntrance();
  }

  function showHeader(revealing = false): void {
    header.classList.toggle("is-revealing", revealing);
    header.classList.remove("is-hidden");
  }

  function hideHeader(): void {

    stopHeaderEntrance();

    header.classList.remove("is-revealing");
    header.classList.add("is-hidden");
  }

  function syncHeaderToPosition(scrollY: number): void {
    const currentScrollY = Math.max(scrollY, 0);
    const isAtTop = currentScrollY <= TOP_THRESHOLD;

    header.classList.toggle("is-at-top", isAtTop);

    if (
      isAtTop ||
      menuOpen ||
      currentScrollY <= HIDE_AFTER
    ) {
      showHeader(false);
    } else {
      hideHeader();
    }

    lastScrollY = currentScrollY;
    direction = 0;
    travelled = 0;
    ticking = false;
  }

  function getInitialScrollY(): number {
    const currentScrollY = Math.max(window.scrollY, 0);

    if (
      navigationType !== "reload" &&
      navigationType !== "back_forward"
    ) {
      return currentScrollY;
    }

    return Math.max(currentScrollY, readStoredScrollY());
  }

  function releaseInitialPaintLock(): void {
    if (isReady) return;

    syncHeaderToPosition(getInitialScrollY());

    void header.offsetHeight;

    window.requestAnimationFrame(() => {
      startHeaderEntrance();

      header.style.removeProperty("visibility");
      header.classList.remove("is-booting");

      isReady = true;
    });
  }

  function updateHeader(): void {
    const currentScrollY = Math.max(window.scrollY, 0);
    const delta = currentScrollY - lastScrollY;
    const isAtTop = currentScrollY <= TOP_THRESHOLD;

    header.classList.toggle("is-at-top", isAtTop);

    const nextDirection =
      Math.abs(delta) <= DIRECTION_DEAD_ZONE
        ? direction
        : delta > 0
          ? 1
          : -1;

    if (nextDirection !== direction) {
      direction = nextDirection;
      travelled = Math.abs(delta);
    } else {
      travelled += Math.abs(delta);
    }

    if (isAtTop || menuOpen) {
      showHeader(false);
      travelled = 0;
    } else if (
      direction > 0 &&
      currentScrollY > HIDE_AFTER &&
      travelled >= HIDE_TRAVEL
    ) {
      hideHeader();
      travelled = 0;
    } else if (
      direction < 0 &&
      currentScrollY <= REVEAL_BELOW_Y &&
      travelled >= SHOW_TRAVEL
    ) {
      showHeader(true);
      travelled = 0;
    } else if (
      direction < 0 &&
      currentScrollY > REVEAL_BELOW_Y
    ) {
      header.classList.remove("is-revealing");
    }

    lastScrollY = currentScrollY;
    storeScrollY(currentScrollY);
    ticking = false;
  }

  function requestHeaderUpdate(): void {

    storeScrollY();

    if (!isReady || ticking) return;

    ticking = true;
    window.requestAnimationFrame(updateHeader);
  }

  function handleMobileMenuState(event: Event): void {
    if (!(event instanceof CustomEvent)) return;

    menuOpen = event.detail?.open === true;

    if (menuOpen) {
      showHeader(false);
      travelled = 0;
    }
  }

  header.addEventListener(
    "animationend",
    handleHeaderAnimationEnd,
  );

  window.addEventListener("scroll", requestHeaderUpdate, {
    passive: true,
  });

  window.addEventListener("resize", requestHeaderUpdate, {
    passive: true,
  });

  window.addEventListener("pagehide", () => {
    storeScrollY();
  });

  window.addEventListener("beforeunload", () => {
    storeScrollY();
  });

  window.addEventListener(
    "pageshow",
    () => {
      if (!isReady) {
        releaseInitialPaintLock();
        return;
      }

      syncHeaderToPosition(window.scrollY);
    },
    { passive: true },
  );

  document.addEventListener(
    "mobile-menu-state-change",
    handleMobileMenuState,
  );

  if (document.readyState === "complete") {
    releaseInitialPaintLock();
  }
}