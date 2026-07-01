import { createPaginationController } from "../utilities/pagination";

function initSupplierFilterPagination(root: HTMLElement): void {
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("[data-supplier-card]"),
  );

  const chips = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-supplier-filter]"),
  );

  const emptyMessage = root.querySelector<HTMLElement>("[data-supplier-empty]");

  const paginationItems = root.querySelector<HTMLElement>(
    "[data-pagination-items]",
  );

  const pagePrompt =
    root.getAttribute("data-page-prompt") ?? "Enter page number from 1 to";

  const itemsPerPage = Number(root.getAttribute("data-items-per-page") ?? 4);

  if (!paginationItems) {
    return;
  }

  let selectedCategory = "all";
  let currentPage = 1;

  function getFilteredCards(): HTMLElement[] {
    return cards.filter((card) => {
      const categoryKeys =
        card.getAttribute("data-category-keys")?.split(" ") ?? [];

      return (
        selectedCategory === "all" || categoryKeys.includes(selectedCategory)
      );
    });
  }

  function renderCards(): void {
    const filteredCards = getFilteredCards();

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    cards.forEach((card) => {
      card.hidden = true;
    });

    filteredCards.forEach((card, index) => {
      card.hidden = index < startIndex || index >= endIndex;
    });

    if (emptyMessage) {
      emptyMessage.hidden = filteredCards.length > 0;
    }
  }

  const pagination = createPaginationController({
    root: paginationItems,
    totalItems: getFilteredCards().length,
    itemsPerPage,
    pagePrompt,
    buttonClassName: "pagination__button",
    ellipsisClassName: "pagination__ellipsis",
    activeClassName: "is-active",
    onPageChange: (page) => {
      currentPage = page;
      renderCards();
    },
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedCategory = chip.getAttribute("data-supplier-filter") ?? "all";
      currentPage = 1;

      chips.forEach((currentChip) => {
        const isSelected = currentChip === chip;

        currentChip.classList.toggle("is-active", isSelected);
        currentChip.setAttribute("aria-pressed", String(isSelected));
      });

      const filteredCards = getFilteredCards();

      pagination.setTotalItems(filteredCards.length);
      pagination.setPage(1);

      renderCards();
    });
  });

  renderCards();
  pagination.render();
}

export function initSupplierFilterPaginations(): void {
  const roots = document.querySelectorAll<HTMLElement>(
    "[data-supplier-filter-root]",
  );

  roots.forEach((root) => {
    initSupplierFilterPagination(root);
  });
}
