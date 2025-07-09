import { useEffect } from "react";
import { useLocation } from "@docusaurus/router";

/**
 * Scrolls to the element with the ID matching the current hash in the URL.
 * This is needed when a hash ID is provided in the initial load to scroll to a heading rendered by a react component.
 */
export function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const delay = 100;
      let attemptsLeft = 5;

      const scrollToId = () => {
        const element = document.getElementById(id);

        if (element != null) {
          if (isElementAtTop(element)) {
            return;
          }
          element.scrollIntoView();
        }

        attemptsLeft--;

        if (attemptsLeft > 0) {
          setTimeout(scrollToId, delay);
        }
      };

      setTimeout(scrollToId, delay);
    }
  }, []);

  return null;
}

function isElementAtTop(el: HTMLElement, tolerance = 10) {
  const rect = el.getBoundingClientRect();
  // 68px is the offset for the navbar
  return Math.abs(rect.top - 68) <= tolerance;
}
