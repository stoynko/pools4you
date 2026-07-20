const DROPDOWN_SELECTOR = "[data-language-dropdown]";
const BUTTON_SELECTOR = "[data-language-dropdown-button]";
const MENU_SELECTOR = "[data-language-dropdown-menu]";

function getDropdownElements(dropdown: HTMLElement): {
  button: HTMLButtonElement;
  menu: HTMLElement;
} | null {
  const button =
    dropdown.querySelector<HTMLButtonElement>(BUTTON_SELECTOR);

  const menu =
    dropdown.querySelector<HTMLElement>(MENU_SELECTOR);

  if (!button || !menu) {
    return null;
  }

  return {
    button,
    menu,
  };
}

function closeDropdown(
  button: HTMLButtonElement,
  menu: HTMLElement,
): void {
  menu.classList.add("hidden");
  button.setAttribute("aria-expanded", "false");
}

function openDropdown(
  button: HTMLButtonElement,
  menu: HTMLElement,
): void {
  menu.classList.remove("hidden");
  button.setAttribute("aria-expanded", "true");
}

function closeOtherDropdowns(
  activeDropdown: HTMLElement,
): void {
  document
    .querySelectorAll<HTMLElement>(DROPDOWN_SELECTOR)
    .forEach((dropdown) => {
      if (dropdown === activeDropdown) {
        return;
      }

      const elements = getDropdownElements(dropdown);

      if (!elements) {
        return;
      }

      closeDropdown(elements.button, elements.menu);
    });
}

function initializeDropdown(dropdown: HTMLElement): void {
  if (dropdown.dataset.languageDropdownInitialized === "true") {
    return;
  }

  const elements = getDropdownElements(dropdown);

  if (!elements) {
    return;
  }

  dropdown.dataset.languageDropdownInitialized = "true";

  const { button, menu } = elements;

  button.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen =
      button.getAttribute("aria-expanded") === "true";

    closeOtherDropdowns(dropdown);

    if (isOpen) {
      closeDropdown(button, menu);
      return;
    }

    openDropdown(button, menu);
  });
}

function closeDropdownsOutsideTarget(
  target: EventTarget | null,
): void {
  if (!(target instanceof Element)) {
    return;
  }

  document
    .querySelectorAll<HTMLElement>(DROPDOWN_SELECTOR)
    .forEach((dropdown) => {
      if (dropdown.contains(target)) {
        return;
      }

      const elements = getDropdownElements(dropdown);

      if (!elements) {
        return;
      }

      closeDropdown(elements.button, elements.menu);
    });
}

function closeAllDropdowns({
  restoreFocus = false,
}: {
  restoreFocus?: boolean;
} = {}): void {
  document
    .querySelectorAll<HTMLElement>(DROPDOWN_SELECTOR)
    .forEach((dropdown) => {
      const elements = getDropdownElements(dropdown);

      if (!elements) {
        return;
      }

      const wasOpen =
        elements.button.getAttribute("aria-expanded") === "true";

      closeDropdown(elements.button, elements.menu);

      if (restoreFocus && wasOpen) {
        elements.button.focus();
      }
    });
}

let globalListenersInitialized = false;

function initializeGlobalListeners(): void {
  if (globalListenersInitialized) {
    return;
  }

  globalListenersInitialized = true;

  document.addEventListener("click", (event) => {
    closeDropdownsOutsideTarget(event.target);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeAllDropdowns({
      restoreFocus: true,
    });
  });
}

export function initLanguageDropdowns(): void {
  document
    .querySelectorAll<HTMLElement>(DROPDOWN_SELECTOR)
    .forEach(initializeDropdown);

  initializeGlobalListeners();
}