export type RevealContext = {
  immediate: boolean;
  entry?: IntersectionObserverEntry;
};

type RevealCallback = (
  element: HTMLElement,
  context: RevealContext,
) => void;

export type RevealOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  onReveal?: RevealCallback;
  onHide?: RevealCallback;
};

type RevealRegistration = {
  once: boolean;
  revealed: boolean;
  onReveal?: RevealCallback;
  onHide?: RevealCallback;
};

type ObserverGroup = {
  observer: IntersectionObserver;
  registrations: Map<HTMLElement, RevealRegistration>;
};

const DEFAULT_THRESHOLD = 0.15;
const DEFAULT_ROOT_MARGIN = "0px 0px -8% 0px";
const DEFAULT_ONCE = true;

const REDUCED_MOTION_QUERY =
  "(prefers-reduced-motion: reduce)";

class RevealController {
  private readonly observerGroups =
    new Map<string, ObserverGroup>();

  observe(
    element: HTMLElement,
    options: RevealOptions = {},
  ): () => void {
    const threshold =
      options.threshold ?? DEFAULT_THRESHOLD;

    const rootMargin =
      options.rootMargin ?? DEFAULT_ROOT_MARGIN;

    const once =
      options.once ?? DEFAULT_ONCE;

    if (this.shouldRevealImmediately()) {
      this.revealImmediately(
        element,
        options.onReveal,
      );

      return () => {};
    }

    const group = this.getObserverGroup(
      threshold,
      rootMargin,
    );

    group.registrations.set(element, {
      once,
      revealed: false,
      onReveal: options.onReveal,
      onHide: options.onHide,
    });

    group.observer.observe(element);

    return () => {
      this.unregisterElement(
        group,
        element,
        threshold,
        rootMargin,
      );
    };
  }

  private getObserverGroup(
    threshold: number,
    rootMargin: string,
  ): ObserverGroup {
    const key = this.createObserverKey(
      threshold,
      rootMargin,
    );

    const existingGroup =
      this.observerGroups.get(key);

    if (existingGroup) {
      return existingGroup;
    }

    const registrations =
      new Map<HTMLElement, RevealRegistration>();

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const element =
            entry.target as HTMLElement;

          const registration =
            registrations.get(element);

          if (!registration) {
            continue;
          }

          const isVisible =
            entry.isIntersecting &&
            entry.intersectionRatio >= threshold;

          if (isVisible) {
            this.handleReveal(
              observer,
              registrations,
              element,
              registration,
              entry,
            );

            continue;
          }

          this.handleHide(
            element,
            registration,
            entry,
          );
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    const group: ObserverGroup = {
      observer,
      registrations,
    };

    this.observerGroups.set(key, group);

    return group;
  }

  private handleReveal(
    observer: IntersectionObserver,
    registrations: Map<
      HTMLElement,
      RevealRegistration
    >,
    element: HTMLElement,
    registration: RevealRegistration,
    entry: IntersectionObserverEntry,
  ): void {
    if (registration.revealed) {
      return;
    }

    registration.revealed = true;

    registration.onReveal?.(element, {
      immediate: false,
      entry,
    });

    if (!registration.once) {
      return;
    }

    observer.unobserve(element);
    registrations.delete(element);
  }

  private handleHide(
    element: HTMLElement,
    registration: RevealRegistration,
    entry: IntersectionObserverEntry,
  ): void {
    if (
      registration.once ||
      !registration.revealed
    ) {
      return;
    }

    registration.revealed = false;

    registration.onHide?.(element, {
      immediate: false,
      entry,
    });
  }

  private revealImmediately(
    element: HTMLElement,
    onReveal?: RevealCallback,
  ): void {
    onReveal?.(element, {
      immediate: true,
    });
  }

  private shouldRevealImmediately(): boolean {
    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window)
    ) {
      return true;
    }

    return window
      .matchMedia(REDUCED_MOTION_QUERY)
      .matches;
  }

  private unregisterElement(
    group: ObserverGroup,
    element: HTMLElement,
    threshold: number,
    rootMargin: string,
  ): void {
    group.observer.unobserve(element);
    group.registrations.delete(element);

    if (group.registrations.size > 0) {
      return;
    }

    group.observer.disconnect();

    const key = this.createObserverKey(
      threshold,
      rootMargin,
    );

    this.observerGroups.delete(key);
  }

  private createObserverKey(
    threshold: number,
    rootMargin: string,
  ): string {
    return `${threshold}|${rootMargin}`;
  }
}

export const revealController =
  new RevealController();