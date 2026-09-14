export const SECTION_HEADER_REVEAL_TIMING = {
  titleDuration: 800,
  dividerDelay: 800,
  dividerDuration: 400,
  descriptionDelay: 1350,
  descriptionDuration: 750,
} as const;

export function applySectionHeaderRevealTiming(
  element: HTMLElement,
): void {
  element.style.setProperty(
    "--section-header-title-duration",
    `${SECTION_HEADER_REVEAL_TIMING.titleDuration}ms`,
  );

  element.style.setProperty(
    "--section-header-divider-delay",
    `${SECTION_HEADER_REVEAL_TIMING.dividerDelay}ms`,
  );

  element.style.setProperty(
    "--section-header-divider-duration",
    `${SECTION_HEADER_REVEAL_TIMING.dividerDuration}ms`,
  );

  element.style.setProperty(
    "--section-header-description-delay",
    `${SECTION_HEADER_REVEAL_TIMING.descriptionDelay}ms`,
  );

  element.style.setProperty(
    "--section-header-description-duration",
    `${SECTION_HEADER_REVEAL_TIMING.descriptionDuration}ms`,
  );
}