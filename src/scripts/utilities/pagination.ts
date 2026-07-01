export type PaginationItem = number | "ellipsis";

type PaginationControllerOptions = {
  root: HTMLElement;
  totalItems: number;
  itemsPerPage: number;
  pagePrompt: string;
  buttonClassName: string;
  ellipsisClassName: string;
  activeClassName: string;
  onPageChange: (page: number) => void;
};

export type PaginationController = {
  getCurrentPage: () => number;
  getTotalPages: () => number;
  setTotalItems: (totalItems: number) => void;
  setPage: (page: number) => void;
  render: () => void;
};

function getPaginationRange(
  activePage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (activePage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (activePage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    activePage - 1,
    activePage,
    activePage + 1,
    "ellipsis",
    totalPages,
  ];
}

export function createPaginationController(
  options: PaginationControllerOptions,
): PaginationController {
  let totalItems = options.totalItems;
  let currentPage = 1;

  function getTotalPages(): number {
    return Math.ceil(totalItems / options.itemsPerPage);
  }

  function normalizePage(page: number): number {
    const totalPages = getTotalPages();

    if (totalPages <= 0) {
      return 1;
    }

    return Math.min(Math.max(page, 1), totalPages);
  }

  function render(): void {
    const totalPages = getTotalPages();

    options.root.innerHTML = "";

    if (totalPages <= 1) {
      options.root.parentElement?.setAttribute("hidden", "");
      return;
    }

    options.root.parentElement?.removeAttribute("hidden");

    currentPage = normalizePage(currentPage);

    const pageItems = getPaginationRange(currentPage, totalPages);

    pageItems.forEach((item) => {
      if (item === "ellipsis") {
        const button = document.createElement("button");

        button.type = "button";
        button.className = options.ellipsisClassName;
        button.textContent = "...";
        button.setAttribute("aria-label", "Go to page");

        button.addEventListener("click", () => {
          const input = window.prompt(`${options.pagePrompt} ${totalPages}`);

          if (!input) {
            return;
          }

          const requestedPage = Number(input);

          if (
            !Number.isInteger(requestedPage) ||
            requestedPage < 1 ||
            requestedPage > totalPages
          ) {
            return;
          }

          setPage(requestedPage);
        });

        options.root.appendChild(button);
        return;
      }

      const pageNumber = item;
      const button = document.createElement("button");

      button.type = "button";
      button.className = options.buttonClassName;
      button.textContent = String(pageNumber);
      button.dataset.page = String(pageNumber);
      button.setAttribute("aria-label", `Go to page ${pageNumber}`);

      if (pageNumber === currentPage) {
        button.classList.add(options.activeClassName);
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", () => {
        setPage(pageNumber);
      });

      options.root.appendChild(button);
    });
  }

  function setTotalItems(nextTotalItems: number): void {
    totalItems = nextTotalItems;
    currentPage = normalizePage(currentPage);
    render();
  }

  function setPage(page: number): void {
    currentPage = normalizePage(page);
    options.onPageChange(currentPage);
    render();
  }

  return {
    getCurrentPage: () => currentPage,
    getTotalPages,
    setTotalItems,
    setPage,
    render,
  };
}
