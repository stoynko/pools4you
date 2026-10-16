import gsap from "gsap";

const SECTION_SELECTOR = "[data-service-highlights]";
const STICKY_SELECTOR = ".service-highlights__sticky";
const IMAGE_SELECTOR = "[data-service-image]";
const COPY_SELECTOR = "[data-service-copy]";
const CTA_SELECTOR = "[data-service-cta]";
const SCROLL_HINT_SELECTOR = "[data-service-scroll-hint]";

const ADVANCE_AT = 0.35;
const RETREAT_AT = 0.15;

const HOLD_STEPS_FALLBACK = 0.75;
const HOLD_STEPS_VARIABLE = "--service-hold-steps";

const PIN_TOLERANCE = 1;
const ENTRANCE_TRIGGER_VIEWPORT_RATIO = 0.6;
const SCROLL_HINT_DELAY_MS = 3000;
 
/* SERVICE SLIDES - IMAGE ANIMATION CONSTANTS*/
const IMAGE_FADE_DURATION = 0.7;
const IMAGE_KEN_BURNS_DURATION = 1;
const IMAGE_KEN_BURNS_SCALE = 1.06;

/* SERVICE SLIDES - TITLE, DESCRIPTION, CTA ANIMATION CONSTANTS*/
const COPY_OUT_DURATION = 0.18;
const COPY_IN_DURATION = 0.35;
const COPY_DESCRIPTION_DELAY = 0.1;
const COPY_BLUR_PX = 4;
 
const ENTRANCE_TITLE_DURATION = 0.78;
const ENTRANCE_DESCRIPTION_DURATION = 0.72;
const ENTRANCE_CTA_DURATION = 0.66;
 
type ServiceHighlightElements = {
  images: HTMLElement[];
  copyLayers: HTMLElement[];
  scrollHint: HTMLElement | null;
};
 
type ServiceHighlightState = {
  activeIndex: number;
  frame: number;
  lastScrollY: number;
  hintTimer: number | undefined;
  imageTimeline: gsap.core.Timeline | null;
  zIndexCounter: number;
  entrancePrepared: boolean;
  entrancePlayed: boolean;
  descriptionOpacity: number;
  holdSteps: number;
};
 
type ServiceHighlightContext = {
  section: HTMLElement;
  sticky: HTMLElement;
  elements: ServiceHighlightElements;
  state: ServiceHighlightState;
};
 
type SectionMetrics = {
  top: number;
  steps: number;
  pinned: boolean;
};
 
type EntranceTargets = {
  imageLayer: HTMLElement;
  image: HTMLElement | null;
  title: HTMLElement | null;
  description: HTMLElement | null;
  cta: HTMLElement | null;
};
 
/* ENVIRONMENT */
 
function isProgrammaticScrollActive(): boolean {
  return document.documentElement.dataset.programmaticScroll === "true";
}
 
function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
 
/* DOM */
 
function getElements(section: HTMLElement): ServiceHighlightElements | null {
  const images = Array.from(section.querySelectorAll<HTMLElement>(IMAGE_SELECTOR));
  const copyLayers = Array.from(section.querySelectorAll<HTMLElement>(COPY_SELECTOR));
  const scrollHint = section.querySelector<HTMLElement>(SCROLL_HINT_SELECTOR);
 
  if (images.length === 0 || images.length !== copyLayers.length) {
    return null;
  }
 
  return { images, copyLayers, scrollHint };
}
 
function getImageElement(layer: HTMLElement | null | undefined): HTMLElement | null {
  return layer?.querySelector<HTMLElement>("img") ?? null;
}
 
function revealEdgeBlend(section: HTMLElement): void {
  section.dataset.edgeBlendReady = "true";
}
 
function readHoldSteps(section: HTMLElement): number {
  const raw = parseFloat(getComputedStyle(section).getPropertyValue(HOLD_STEPS_VARIABLE));

  return Number.isFinite(raw) && raw >= 0 ? raw : HOLD_STEPS_FALLBACK;
}

function measureSection(context: ServiceHighlightContext): SectionMetrics {
  const rect = context.section.getBoundingClientRect();
  const stickyHeight = context.sticky.offsetHeight;
  const travel = Math.max(rect.height - stickyHeight, 0);
  const lastIndex = context.elements.copyLayers.length - 1;
  const holdSteps = context.state.holdSteps;
  const totalSteps = lastIndex + holdSteps * 2;
  const progress = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0;
  const steps = Math.min(Math.max(progress * totalSteps - holdSteps, 0), lastIndex);

  return {
    top: rect.top,
    steps,
    pinned: rect.top <= PIN_TOLERANCE && rect.bottom >= stickyHeight - PIN_TOLERANCE,
  };
}

function resolveIndex(steps: number, current: number, lastIndex: number): number {
  let index = Math.min(Math.max(current, 0), lastIndex);
 
  while (index < lastIndex && steps >= index + ADVANCE_AT) {
    index += 1;
  }
 
  while (index > 0 && steps <= index - 1 + RETREAT_AT) {
    index -= 1;
  }
 
  return index;
}
 
/* STATIC STATE */
 
function setStaticImageState(context: ServiceHighlightContext, activeIndex: number): void {
  const { elements, state } = context;
 
  state.imageTimeline?.kill();
  state.imageTimeline = null;
  state.zIndexCounter = 1;
 
  elements.images.forEach((layer, index) => {
    const image = getImageElement(layer);
 
    gsap.killTweensOf(layer);
 
    if (image) {
      gsap.killTweensOf(image);
      gsap.set(image, { scale: IMAGE_KEN_BURNS_SCALE });
    }
 
    gsap.set(layer, {
      opacity: index === activeIndex ? 1 : 0,
      zIndex: index === activeIndex ? 1 : 0,
    });
  });
}

function getCopyText(layer: HTMLElement): HTMLElement[] {
  return Array.from(layer.querySelectorAll<HTMLElement>(".service-highlights__title, .service-highlights__description"));
}

function setStaticCopyState(context: ServiceHighlightContext): void {
  const texts = context.elements.copyLayers.flatMap(getCopyText);
  gsap.killTweensOf(texts);
  gsap.set(texts, { clearProps: "opacity,visibility,filter"});
}

function syncCopyAccessibility(context: ServiceHighlightContext, activeIndex: number): void {
  context.elements.images.forEach((layer, index) => {
    layer.classList.toggle("is-active", index === activeIndex);
  });
 
  context.elements.copyLayers.forEach((layer, index) => {
    const isActive = index === activeIndex;
 
    layer.classList.toggle("is-active", isActive);
    layer.setAttribute("aria-hidden", isActive ? "false" : "true");
 
    const link = layer.querySelector<HTMLAnchorElement>("a");
 
    if (link) {
      link.tabIndex = isActive ? 0 : -1;
    }
  });
}

function animateImages(context: ServiceHighlightContext, nextIndex: number): void {
  const { elements, state } = context;
  const nextLayer = elements.images[nextIndex];
 
  if (!nextLayer) {
    return;
  }

  state.imageTimeline?.kill();
 
  state.zIndexCounter += 1;
  gsap.set(nextLayer, { zIndex: state.zIndexCounter });
 
  const startOpacity = Number(gsap.getProperty(nextLayer, "opacity")) || 0;
  const nextImage = getImageElement(nextLayer);
 
  const timeline = gsap.timeline({
    onComplete: () => {
      if (state.imageTimeline !== timeline) {
        return;
      }
 
      state.imageTimeline = null;
      state.zIndexCounter = 1;
 
      elements.images.forEach((layer, index) => {
        gsap.set(layer, {
          opacity: index === nextIndex ? 1 : 0,
          zIndex: index === nextIndex ? 1 : 0,
        });
      });
    },
  });
 
  timeline.fromTo(
    nextLayer,
    { opacity: startOpacity },
    { opacity: 1, duration: IMAGE_FADE_DURATION, ease: "power2.inOut" },
    0
  );
 
  if (nextImage) {
    timeline.fromTo(
      nextImage,
      { scale: 1 },
      { scale: IMAGE_KEN_BURNS_SCALE, duration: IMAGE_KEN_BURNS_DURATION, ease: "power1.out" },
      0
    );
  }
 
  state.imageTimeline = timeline;
}

function animateCopy(context: ServiceHighlightContext, nextIndex: number): void {
  const { elements, state } = context;
  const nextLayer = elements.copyLayers[nextIndex];

  if (!nextLayer) {
    return;
  }

  const incoming = getCopyText(nextLayer);

  const outgoing = elements.copyLayers.flatMap((layer, index) =>
      index === nextIndex ? [] : getCopyText(layer),
  );

  const all = [...outgoing, ...incoming];

  gsap.killTweensOf(all);

  all.forEach((element) => {
    const opacity = Number(gsap.getProperty(element, "opacity")) || 0;
    gsap.set(element, { autoAlpha: opacity });
  });

  outgoing.forEach((element) => {
    const opacity = Number(gsap.getProperty(element, "opacity")) || 0;

    if (opacity <= 0.01) {
      return;
    }

    gsap.to(element, {
      autoAlpha: 0,
      duration: COPY_OUT_DURATION,
      ease: "none",
      overwrite: "auto"
    });
  });

  incoming.forEach((element, position) => {
    const currentOpacity = Number(gsap.getProperty(element, "opacity")) || 0;
    const isDescription = position === 1;
    const targetOpacity = isDescription ? state.descriptionOpacity : 1;
    const alreadyVisible = currentOpacity > 0.05;

    if (!alreadyVisible) {
      gsap.set(element, { autoAlpha: 0 });
    }

    gsap.to(element, {
      autoAlpha: targetOpacity,
      duration: COPY_IN_DURATION,
      delay: alreadyVisible ? 0 : position * COPY_DESCRIPTION_DELAY,
      ease: "power1.out",
      overwrite: "auto"
    });
  });
}

/* ACTIVE SERVICE */
 
function setActiveService(context: ServiceHighlightContext, index: number, animate: boolean): void {
  const { state, elements } = context;
  const nextIndex = Math.min(Math.max(index, 0), elements.copyLayers.length - 1);
 
  if (nextIndex === state.activeIndex) {
    return;
  }
 
  state.activeIndex = nextIndex;

  if (animate) {
    animateImages(context, nextIndex);
    animateCopy(context, nextIndex);
  } else {
    setStaticImageState(context, nextIndex);
    setStaticCopyState(context);
  }
 
  syncCopyAccessibility(context, nextIndex);
}
 
/* FIRST ENTRANCE */
 
function getEntranceTargets(elements: ServiceHighlightElements): EntranceTargets | null {
  const imageLayer = elements.images[0];
  const copyLayer = elements.copyLayers[0];
 
  if (!imageLayer || !copyLayer) {
    return null;
  }
 
  return {
    imageLayer,
    image: getImageElement(imageLayer),
    title: copyLayer.querySelector<HTMLElement>(".service-highlights__title"),
    description: copyLayer.querySelector<HTMLElement>(".service-highlights__description"),
    cta: copyLayer.querySelector<HTMLElement>(CTA_SELECTOR)
  };
}
 
function getCopyTargets(targets: EntranceTargets): HTMLElement[] {
  return [targets.title, targets.description, targets.cta].filter(
    (target): target is HTMLElement => target !== null,
  );
}
 
function prepareEntranceAnimation(context: ServiceHighlightContext): void {
  const { state, elements } = context;
 
  if (state.entrancePrepared || state.entrancePlayed) {
    return;
  }
 
  const targets = getEntranceTargets(elements);
 
  if (!targets) {
    state.entrancePlayed = true;
    return;
  }
 
  gsap.set(targets.imageLayer, { opacity: 0, zIndex: 1 });
 
  if (targets.image) {
    gsap.set(targets.image, { scale: 1, transformOrigin: "50% 50%" });
  }
 
  [targets.title, targets.description].forEach((element) => {
    if (element) {
      gsap.set(element, { autoAlpha: 0, filter: `blur(${COPY_BLUR_PX}px)` });
    }
  });

  if (targets.cta) {
    gsap.set(targets.cta, { autoAlpha: 0 });
  }
 
  state.entrancePrepared = true;
}

function skipEntranceAnimation(context: ServiceHighlightContext): void {
  const { state, elements, section } = context;
  const targets = getEntranceTargets(elements);
 
  if (targets) {
    const copyTargets = getCopyTargets(targets);
 
    gsap.killTweensOf(targets.imageLayer);
 
    if (targets.image) {
      gsap.killTweensOf(targets.image);
    }
 
    gsap.killTweensOf(copyTargets);
    gsap.set(copyTargets, { clearProps: "opacity,visibility,transform,filter" });
  }
 
  state.entrancePrepared = false;
  state.entrancePlayed = true;
 
  setStaticImageState(context, Math.max(state.activeIndex, 0));
  setStaticCopyState(context);
  revealEdgeBlend(section);
}
 
function playEntranceAnimation(context: ServiceHighlightContext): void {
  const { state, elements, section } = context;
 
  if (state.entrancePlayed) {
    return;
  }
 
  prepareEntranceAnimation(context);
 
  const targets = getEntranceTargets(elements);
 
  if (!targets) {
    state.entrancePlayed = true;
    return;
  }
 
  state.entrancePlayed = true;
 
  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      gsap.set(getCopyTargets(targets), { clearProps: "opacity,visibility,transform,filter" });
      state.entrancePrepared = false;
      revealEdgeBlend(section);
    },
  });
 
  timeline.to(targets.imageLayer, { opacity: 1, duration: IMAGE_FADE_DURATION, ease: "power2.inOut" }, 0);
 
  if (targets.image) {
    timeline.to(
      targets.image,
      { scale: IMAGE_KEN_BURNS_SCALE, duration: IMAGE_KEN_BURNS_DURATION, ease: "power1.out" },
      0,
    );
  }
 
  if (targets.title) {
    timeline.to(targets.title, { 
      autoAlpha: 1, 
      filter: "blur(0px)", 
      duration: ENTRANCE_TITLE_DURATION 
    }, 0.16);
  }
 
  if (targets.description) {
    timeline.to(targets.description, {
        autoAlpha: state.descriptionOpacity,
        filter: "blur(0px)",
        duration: ENTRANCE_DESCRIPTION_DURATION,
      }, 0.3);
  }
 
  if (targets.cta) {
    timeline.to(targets.cta, { autoAlpha: 1, duration: ENTRANCE_CTA_DURATION }, 0.44);
  }
}

function handleEntrance(context: ServiceHighlightContext, metrics: SectionMetrics): void {
  const { state } = context;
 
  if (state.entrancePlayed) {
    return;
  }
 
  if (metrics.top <= PIN_TOLERANCE || prefersReducedMotion()) {
    skipEntranceAnimation(context);
    return;
  }
 
  if (isProgrammaticScrollActive()) {
    return;
  }
 
  if (metrics.top <= window.innerHeight * ENTRANCE_TRIGGER_VIEWPORT_RATIO) {
    playEntranceAnimation(context);
  }
}
 
/* SCROLL HINT */
 
function hideScrollHint(context: ServiceHighlightContext): void {
  const { state, elements } = context;
 
  if (state.hintTimer !== undefined) {
    window.clearTimeout(state.hintTimer);
    state.hintTimer = undefined;
  }
 
  elements.scrollHint?.classList.remove("is-visible");
}
 
function scheduleScrollHint(context: ServiceHighlightContext): void {
  const { state, elements } = context;
 
  hideScrollHint(context);
 
  if (!elements.scrollHint) {
    return;
  }
 
  state.hintTimer = window.setTimeout(() => {
    state.hintTimer = undefined;
 
    const metrics = measureSection(context);
 
    if (metrics.pinned && state.activeIndex < elements.copyLayers.length - 1) {
      elements.scrollHint?.classList.add("is-visible");
    }
  }, SCROLL_HINT_DELAY_MS);
}
 
/* UPDATE LOOP */
 
function update(context: ServiceHighlightContext, forceStatic = false): void {
  const { state, elements } = context;
  const lastIndex = elements.copyLayers.length - 1;
  const metrics = measureSection(context);
 
  handleEntrance(context, metrics);
 
  const animate = !forceStatic && !isProgrammaticScrollActive() && !prefersReducedMotion();
  const nextIndex = resolveIndex(metrics.steps, state.activeIndex, lastIndex);
 
  setActiveService(context, nextIndex, animate);
 
  if (window.scrollY !== state.lastScrollY) {
    state.lastScrollY = window.scrollY;
 
    if (metrics.pinned && state.activeIndex < lastIndex) {
      scheduleScrollHint(context);
    } else {
      hideScrollHint(context);
    }
  }
}
 
function scheduleUpdate(context: ServiceHighlightContext): void {
  if (context.state.frame) {
    return;
  }
 
  context.state.frame = window.requestAnimationFrame(() => {
    context.state.frame = 0;
    update(context);
  });
}
 
/* INITIALIZATION */
 
function initializeSection(section: HTMLElement): void {
  if (section.dataset.serviceHighlightsInitialized === "true") {
    return;
  }
 
  const elements = getElements(section);
  const sticky = section.querySelector<HTMLElement>(STICKY_SELECTOR);
 
  if (!elements || !sticky) {
    return;
  }
 
  const context: ServiceHighlightContext = {
    section,
    sticky,
    elements,
    state: {
      activeIndex: -1,
      frame: 0,
      lastScrollY: -1,
      hintTimer: undefined,
      imageTimeline: null,
      zIndexCounter: 1,
      entrancePrepared: false,
      entrancePlayed: false,
      descriptionOpacity: 1,
      holdSteps: readHoldSteps(section)
    }
  };

  setActiveService(context, 0, false);

  context.state.descriptionOpacity = 0.92;
 
  prepareEntranceAnimation(context);
 
  section.dataset.serviceHighlightsInitialized = "true";

  update(context, true);
 
  const onScrollOrResize = () => scheduleUpdate(context);
  const onResize = () => {
    context.state.holdSteps = readHoldSteps(section);
    scheduleUpdate(context);
  };
  const onStaticSync = () => window.requestAnimationFrame(() => update(context, true));
 
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("pageshow", onStaticSync, { passive: true });
  window.addEventListener("site:programmatic-scroll-end", onStaticSync);
}
 
export function initServiceHighlights(): void {
  document.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach(initializeSection);
}