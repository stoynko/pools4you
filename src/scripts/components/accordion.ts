const accordions = document.querySelectorAll<HTMLElement>("[data-accordion]");
const animationDuration = 450;

const getPanel = (item: HTMLDetailsElement): HTMLElement | null =>
  item.querySelector<HTMLElement>("[data-accordion-panel]");

const clearPanelAnimation = (item: HTMLDetailsElement): void => {
  const panel = getPanel(item);

  if (!panel) {
    return;
  }

  const timerExists = panel.dataset.animationTimer;

  if (timerExists) {
    window.clearTimeout(Number(timerExists));
    delete panel.dataset.animationTimer;
  }
};

const openItem = (item: HTMLDetailsElement): void => {
  const panel = getPanel(item);

  if (!panel || item.dataset.accordionState === "open") {
    return;
  }

  clearPanelAnimation(item);

  item.dataset.accordionState = "open";
  item.open = true;

  panel.style.height = "0px";
  panel.style.overflow = "hidden";
  panel.style.transition = "";

  requestAnimationFrame(() => {
    panel.style.transition = `height ${animationDuration}ms ease`;
    panel.style.height = `${panel.scrollHeight}px`;

    const timer = window.setTimeout(() => {
      if (item.dataset.accordionState === "open") {
        panel.style.height = "auto";
        panel.style.overflow = "";
        panel.style.transition = "";
      }

      delete panel.dataset.animationTimer;
    }, animationDuration);

    panel.dataset.animationTimer = String(timer);
  });
};

const closeItem = (item: HTMLDetailsElement): void => {
  const panel = getPanel(item);

  if (!panel || item.dataset.accordionState === "closed") {
    return;
  }

  clearPanelAnimation(item);

  item.dataset.accordionState = "closed";

  panel.style.height = `${panel.scrollHeight}px`;
  panel.style.overflow = "hidden";
  panel.style.transition = "";

  panel.offsetHeight;

  requestAnimationFrame(() => {
    panel.style.transition = `height ${animationDuration}ms ease`;
    panel.style.height = "0px";

    const timer = window.setTimeout(() => {
      if (item.dataset.accordionState === "closed") {
        item.open = false;
        panel.style.height = "";
        panel.style.overflow = "";
        panel.style.transition = "";
      }

      delete panel.dataset.animationTimer;
    }, animationDuration);

    panel.dataset.animationTimer = String(timer);
  });
};

accordions.forEach((accordion) => {
  const items = Array.from(
    accordion.querySelectorAll<HTMLDetailsElement>("[data-accordion-item]"),
  );

  items.forEach((item) => {
    const summary = item.querySelector<HTMLElement>(
      "[data-accordion-summary]",
    );

    summary?.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();

      const shouldOpen = item.dataset.accordionState !== "open";

      items.forEach((otherItem) => {
        if (otherItem !== item) {
          closeItem(otherItem);
        }
      });

      if (shouldOpen) {
        openItem(item);
      } else {
        closeItem(item);
      }
    });
  });
});