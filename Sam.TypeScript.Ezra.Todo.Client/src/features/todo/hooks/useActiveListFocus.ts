import { useEffect } from 'react';

// Moves focus to first item in list on master-detail focus change.
export function useActiveListFocus(activeListId: number | null) {
  useEffect(() => {
    if (activeListId !== null) {
      // Use requestAnimationFrame to ensure the DOM has updated before focusing the element.
      const frameId = requestAnimationFrame(() => {
        // Find the active list section based on the aria-expanded attribute we set
        const activeSection = document.querySelector(`section[aria-expanded="true"]`) as HTMLElement;
        if (activeSection) {
          // TODO: Consider if there are other html elements we should add here.
          const firstFocusable = activeSection.querySelector<HTMLElement>(
            'button, input, [href], [tabindex]:not([tabindex="-1"])',
          );

          if (firstFocusable) {
            firstFocusable.focus();
          }
        }
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [activeListId]);
}
