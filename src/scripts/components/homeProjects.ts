const BOOK_SELECTOR =
  "[data-home-projects-book]";

const CARD_SELECTOR =
  "[data-home-project-card]";

const CTA_SELECTOR =
  ".home-project-card__cta";

type ProjectCard = HTMLElement;

/*
 * Card state
 */

function setCardState(
  card: ProjectCard,
  isActive: boolean,
): void {
  card.classList.toggle(
    "is-active",
    isActive,
  );

  card.classList.remove(
    "is-flipped",
  );

  card.setAttribute(
    "aria-current",
    String(isActive),
  );

  card.setAttribute(
    "aria-expanded",
    String(isActive),
  );
}

function activateCard(
  cards: ProjectCard[],
  card: ProjectCard,
): void {
  const current = cards.find(
    (item) =>
      item.classList.contains(
        "is-active",
      ),
  );

  if (current === card) {
    card.classList.toggle(
      "is-flipped",
    );

    return;
  }

  cards.forEach((item) =>
    setCardState(
      item,
      item === card,
    ),
  );
}

/*
 * Project book
 */

function initializeProjectBook(
  book: HTMLElement,
): void {
  if (
    book.dataset.homeProjectsInitialized ===
    "true"
  ) {
    return;
  }

  const cards = Array.from(
    book.querySelectorAll<ProjectCard>(
      CARD_SELECTOR,
    ),
  );

  if (cards.length === 0) {
    return;
  }

  book.dataset.homeProjectsInitialized =
    "true";

  book.addEventListener(
    "click",
    (event) => {
      const target = event.target;

      if (
        !(target instanceof Element) ||
        target.closest(CTA_SELECTOR)
      ) {
        return;
      }

      const card =
        target.closest<ProjectCard>(
          CARD_SELECTOR,
        );

      if (
        !card ||
        !book.contains(card)
      ) {
        return;
      }

      activateCard(
        cards,
        card,
      );
    },
  );

  book.addEventListener(
    "keydown",
    (event) => {
      const activeIndex =
        cards.findIndex((card) =>
          card.classList.contains(
            "is-active",
          ),
        );

      if (activeIndex < 0) {
        return;
      }

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();

        cards[
          activeIndex
        ]?.classList.toggle(
          "is-flipped",
        );

        return;
      }

      const previousKeys = [
        "ArrowLeft",
        "ArrowUp",
      ];

      const nextKeys = [
        "ArrowRight",
        "ArrowDown",
      ];

      if (
        !previousKeys.includes(
          event.key,
        ) &&
        !nextKeys.includes(
          event.key,
        )
      ) {
        return;
      }

      event.preventDefault();

      const direction =
        nextKeys.includes(event.key)
          ? 1
          : -1;

      const nextIndex =
        (
          activeIndex +
          direction +
          cards.length
        ) %
        cards.length;

      const nextCard =
        cards[nextIndex];

      if (nextCard) {
        activateCard(
          cards,
          nextCard,
        );
      }
    },
  );
}

/*
 * Home projects initialization
 */

export function initHomeProjects(): void {
  document
    .querySelectorAll<HTMLElement>(
      BOOK_SELECTOR,
    )
    .forEach(
      initializeProjectBook,
    );
}