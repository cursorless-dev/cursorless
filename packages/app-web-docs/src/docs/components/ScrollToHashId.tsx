import { useLocation } from "@docusaurus/router";
import { useEffect } from "react";

/**
 * Scrolls to the element with the ID matching the current hash in the URL.
 * This is needed when a hash ID is provided in the initial load to scroll to a heading rendered by a react component.
 */
export function ScrollToHashId() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const delay = 100;

      const scrollToId = (attemptsLeft: number) => {
        const element = document.getElementById(id);

        if (element != null) {
          if (isElementAtTop(element)) {
            return;
          }
          element.scrollIntoView();
        }

        if (attemptsLeft > 1) {
          setTimeout(() => scrollToId(attemptsLeft - 1), delay);
        }
      };

      setTimeout(() => scrollToId(5), delay);
    }
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps, react/exhaustive-effect-dependencies
  }, []);

  return null;
}

function isElementAtTop(el: HTMLElement, tolerance = 10) {
  const rect = el.getBoundingClientRect();
  // 68px is the offset for the navbar
  return Math.abs(rect.top - 68) <= tolerance;
}
