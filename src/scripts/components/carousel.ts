const CAROUSEL_SELECTOR = "[data-carousel]";
const VIEWPORT_SELECTOR = "[data-carousel-viewport]";
const TRACK_SELECTOR = "[data-carousel-track]";
const SLIDE_SELECTOR = "[data-carousel-slide]";
const PREVIOUS_SELECTOR = "[data-carousel-previous]";
const NEXT_SELECTOR = "[data-carousel-next]";

const INITIALIZED_ATTRIBUTE = "carouselInitialized";

const SCROLL_TOLERANCE = 2;
const DRAG_THRESHOLD = 10;
const PROGRAMMATIC_SCROLL_TIMEOUT = 700;

type CarouselMode = "manual" | "autoplay" | "continuous";

type CarouselOptions = {
  mode: CarouselMode;
  loop: boolean;
  draggable: boolean;
  autoplayInterval: number;
  continuousSpeed: number;
  pauseOnHover: boolean;
  pauseOnFocus: boolean;
};

function readBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

function readPositiveNumber(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : fallback;
}

function readOptions(root: HTMLElement): CarouselOptions {
  const requestedMode = root.dataset.carouselMode;

  const mode: CarouselMode =
    requestedMode === "autoplay" ||
    requestedMode === "continuous"
      ? requestedMode
      : "manual";

  return {
    mode,

    loop: readBoolean(
      root.dataset.carouselLoop,
      false,
    ),

    draggable: readBoolean(
      root.dataset.carouselDraggable,
      true,
    ),

    autoplayInterval: readPositiveNumber(
      root.dataset.carouselAutoplayInterval,
      4500,
    ),

    continuousSpeed: readPositiveNumber(
      root.dataset.carouselContinuousSpeed,
      28,
    ),

    pauseOnHover: readBoolean(
      root.dataset.carouselPauseOnHover,
      true,
    ),

    pauseOnFocus: readBoolean(
      root.dataset.carouselPauseOnFocus,
      true,
    ),
  };
}

function getSlides(track: HTMLElement): HTMLElement[] {
  return Array.from(
    track.querySelectorAll<HTMLElement>(
      SLIDE_SELECTOR,
    ),
  );
}

function getTrackGap(track: HTMLElement): number {
  const styles = window.getComputedStyle(track);

  return (
    Number.parseFloat(
      styles.columnGap || styles.gap,
    ) || 0
  );
}

function getSlideStep(
  track: HTMLElement,
  viewport: HTMLElement,
): number {
  const firstSlide = getSlides(track)[0];

  if (!firstSlide) {
    return viewport.clientWidth;
  }

  return (
    firstSlide.getBoundingClientRect().width +
    getTrackGap(track)
  );
}

function getVisibleSlideCount(
  track: HTMLElement,
  viewport: HTMLElement,
): number {
  const slideStep = getSlideStep(
    track,
    viewport,
  );

  if (slideStep <= 0) {
    return 1;
  }

  const gap = getTrackGap(track);

  return Math.max(
    1,
    Math.floor(
      (viewport.clientWidth + gap) / slideStep,
    ),
  );
}

function initializeCarousel(root: HTMLElement): void {
  if (
    root.dataset[INITIALIZED_ATTRIBUTE] === "true"
  ) {
    return;
  }

  const viewport =
    root.querySelector<HTMLElement>(
      VIEWPORT_SELECTOR,
    );

  const track =
    root.querySelector<HTMLElement>(
      TRACK_SELECTOR,
    );

  if (!viewport || !track) {
    return;
  }

  const previousButton =
    root.querySelector<HTMLButtonElement>(
      PREVIOUS_SELECTOR,
    );

  const nextButton =
    root.querySelector<HTMLButtonElement>(
      NEXT_SELECTOR,
    );

  const options = readOptions(root);

  let activePointerId: number | null = null;
  let pointerStartX = 0;
  let scrollStartX = 0;

  let isPointerDown = false;
  let isDragging = false;
  let suppressNextClick = false;

  let autoplayTimer: number | undefined;

  /*
   * While smooth scrolling, controls must reflect the destination
   * rather than each intermediate scroll position.
   */
  let pendingScrollTarget: number | null = null;
  let pendingScrollTimeout: number | undefined;

  const getMaximumScroll = (): number => {
    return Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth,
    );
  };

  const clampScrollPosition = (
    position: number,
  ): number => {
    return Math.min(
      getMaximumScroll(),
      Math.max(0, position),
    );
  };

  const updateControlsForPosition = (
    position: number,
  ): void => {
    if (!previousButton || !nextButton) {
      return;
    }

    const maximumScroll = getMaximumScroll();

    if (
      options.loop &&
      maximumScroll > SCROLL_TOLERANCE
    ) {
      previousButton.disabled = false;
      nextButton.disabled = false;
      return;
    }

    const clampedPosition =
      clampScrollPosition(position);

    const canScroll =
      maximumScroll > SCROLL_TOLERANCE;

    previousButton.disabled =
      !canScroll ||
      clampedPosition <= SCROLL_TOLERANCE;

    nextButton.disabled =
      !canScroll ||
      clampedPosition >=
        maximumScroll - SCROLL_TOLERANCE;
  };

  const clearPendingScroll = (): void => {
    pendingScrollTarget = null;

    if (pendingScrollTimeout !== undefined) {
      window.clearTimeout(pendingScrollTimeout);
      pendingScrollTimeout = undefined;
    }
  };

  const finishPendingScroll = (): void => {
    clearPendingScroll();

    updateControlsForPosition(
      viewport.scrollLeft,
    );
  };

  const updateControls = (): void => {
    updateControlsForPosition(
      pendingScrollTarget ??
        viewport.scrollLeft,
    );
  };

  const getNavigationDistance = (): number => {
    const slideStep = getSlideStep(
      track,
      viewport,
    );

    const visibleSlideCount =
      getVisibleSlideCount(
        track,
        viewport,
      );

    return slideStep * visibleSlideCount;
  };

  const scrollToPosition = (
    position: number,
  ): void => {
    const targetPosition =
      clampScrollPosition(position);

    clearPendingScroll();

    pendingScrollTarget = targetPosition;

    /*
     * Disable the destination arrow before animation starts.
     * Scroll events during the animation will continue using
     * this target, preventing any enabled-state flash.
     */
    updateControlsForPosition(targetPosition);

    viewport.scrollTo({
      left: targetPosition,
      behavior: "smooth",
    });

    /*
     * Fallback for browsers where scrollend is unavailable
     * or is not emitted reliably.
     */
    pendingScrollTimeout = window.setTimeout(
      finishPendingScroll,
      PROGRAMMATIC_SCROLL_TIMEOUT,
    );
  };

  const scrollByPage = (
    direction: -1 | 1,
  ): void => {
    const currentPosition =
      pendingScrollTarget ??
      viewport.scrollLeft;

    const targetPosition =
      currentPosition +
      getNavigationDistance() * direction;

    scrollToPosition(targetPosition);
  };

  const stopAutoplay = (): void => {
    if (autoplayTimer === undefined) {
      return;
    }

    window.clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  };

  const startAutoplay = (): void => {
    if (
      options.mode !== "autoplay" ||
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
    ) {
      return;
    }

    stopAutoplay();

    autoplayTimer = window.setInterval(() => {
      const maximumScroll =
        getMaximumScroll();

      const currentPosition =
        pendingScrollTarget ??
        viewport.scrollLeft;

      if (
        currentPosition >=
        maximumScroll - SCROLL_TOLERANCE
      ) {
        if (options.loop) {
          scrollToPosition(0);
        }

        return;
      }

      scrollByPage(1);
    }, options.autoplayInterval);
  };

  previousButton?.addEventListener(
    "click",
    () => {
      if (previousButton.disabled) {
        return;
      }

      scrollByPage(-1);
    },
  );

  nextButton?.addEventListener(
    "click",
    () => {
      if (nextButton.disabled) {
        return;
      }

      scrollByPage(1);
    },
  );

  viewport.addEventListener(
    "scroll",
    updateControls,
    {
      passive: true,
    },
  );

  viewport.addEventListener(
    "scrollend",
    finishPendingScroll,
  );

  viewport.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "ArrowLeft" &&
        !previousButton?.disabled
      ) {
        event.preventDefault();
        scrollByPage(-1);
      }

      if (
        event.key === "ArrowRight" &&
        !nextButton?.disabled
      ) {
        event.preventDefault();
        scrollByPage(1);
      }
    },
  );

  viewport.addEventListener(
    "dragstart",
    (event) => {
      event.preventDefault();
    },
  );

  if (options.draggable) {
    viewport.classList.add(
      "carousel__viewport--draggable",
    );

    viewport.addEventListener(
      "pointerdown",
      (event) => {
        if (
          event.button !== 0 ||
          event.pointerType === "touch"
        ) {
          return;
        }

        /*
         * Manual dragging takes control away from any active
         * programmatic smooth scroll.
         */
        clearPendingScroll();

        activePointerId = event.pointerId;
        pointerStartX = event.clientX;
        scrollStartX = viewport.scrollLeft;

        isPointerDown = true;
        isDragging = false;
        suppressNextClick = false;
      },
    );

    viewport.addEventListener(
      "pointermove",
      (event) => {
        if (
          !isPointerDown ||
          activePointerId !== event.pointerId
        ) {
          return;
        }

        const movement =
          event.clientX - pointerStartX;

        if (!isDragging) {
          if (
            Math.abs(movement) <
            DRAG_THRESHOLD
          ) {
            return;
          }

          isDragging = true;
          suppressNextClick = true;

          viewport.classList.add(
            "carousel__viewport--dragging",
          );

          viewport.setPointerCapture(
            event.pointerId,
          );
        }

        event.preventDefault();

        viewport.scrollLeft =
          scrollStartX - movement;

        updateControlsForPosition(
          viewport.scrollLeft,
        );
      },
    );

    const finishPointerInteraction = (
      event: PointerEvent,
    ): void => {
      if (
        activePointerId !== event.pointerId
      ) {
        return;
      }

      if (
        viewport.hasPointerCapture(
          event.pointerId,
        )
      ) {
        viewport.releasePointerCapture(
          event.pointerId,
        );
      }

      activePointerId = null;
      isPointerDown = false;
      isDragging = false;

      viewport.classList.remove(
        "carousel__viewport--dragging",
      );

      updateControlsForPosition(
        viewport.scrollLeft,
      );

      window.setTimeout(() => {
        suppressNextClick = false;
      }, 0);
    };

    viewport.addEventListener(
      "pointerup",
      finishPointerInteraction,
    );

    viewport.addEventListener(
      "pointercancel",
      finishPointerInteraction,
    );

    viewport.addEventListener(
      "click",
      (event) => {
        if (!suppressNextClick) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        suppressNextClick = false;
      },
      true,
    );
  }

  if (options.pauseOnHover) {
    root.addEventListener(
      "mouseenter",
      stopAutoplay,
    );

    root.addEventListener(
      "mouseleave",
      startAutoplay,
    );
  }

  if (options.pauseOnFocus) {
    root.addEventListener(
      "focusin",
      stopAutoplay,
    );

    root.addEventListener(
      "focusout",
      startAutoplay,
    );
  }

  const resizeObserver =
    new ResizeObserver(() => {
      clearPendingScroll();

      updateControlsForPosition(
        viewport.scrollLeft,
      );
    });

  resizeObserver.observe(viewport);
  resizeObserver.observe(track);

  updateControlsForPosition(
    viewport.scrollLeft,
  );

  startAutoplay();

  root.dataset[INITIALIZED_ATTRIBUTE] =
    "true";
}

export function initCarousels(): void {
  const carousels =
    document.querySelectorAll<HTMLElement>(
      CAROUSEL_SELECTOR,
    );

  carousels.forEach(initializeCarousel);
}