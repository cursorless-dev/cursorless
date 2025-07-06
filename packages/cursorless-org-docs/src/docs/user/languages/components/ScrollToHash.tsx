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
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element != null) {
          element.scrollIntoView();
        }
      }, 100);
    }
  }, []);

  return null;
}
