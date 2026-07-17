const TOP_THRESHOLD = 8;
const HIDE_AFTER = 80;
const DIRECTION_DEAD_ZONE = 2;
const HIDE_TRAVEL = 28;
const SHOW_TRAVEL = 16;
const REVEAL_BELOW_Y = 200;

export function initSmartHeader(): void {
  const header = document.querySelector<HTMLElement>(
    "[data-site-header]",
  );

  if (!header) return;

  if (header.dataset.smartHeaderInitialized === "true") {
    return;
  }

  header.dataset.smartHeaderInitialized = "true";

  let lastScrollY = Math.max(window.scrollY, 0);
  let ticking = false;
  let menuOpen = false;
  let direction = 0;
  let travelled = 0;

  function showHeader(revealing = false): void {
    header.classList.toggle("is-revealing", revealing);
    header.classList.remove("is-hidden");
  }

  function hideHeader(): void {
    header.classList.remove("is-revealing");
    header.classList.add("is-hidden");
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
      travelled = 0;
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
    ticking = false;
  }

  function requestHeaderUpdate(): void {
    if (ticking) return;

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

  window.addEventListener("scroll", requestHeaderUpdate, {
    passive: true,
  });

  window.addEventListener("resize", requestHeaderUpdate, {
    passive: true,
  });

  document.addEventListener(
    "mobile-menu-state-change",
    handleMobileMenuState,
  );

  updateHeader();
}