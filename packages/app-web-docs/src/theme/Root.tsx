import type { Props } from "@theme/Root";
import React, { useEffect } from "react";

function syncBootstrapTheme() {
  const root = document.documentElement;
  const theme = root.getAttribute("data-theme");

  if (theme == null) {
    root.removeAttribute("data-bs-theme");
    return;
  }

  root.setAttribute("data-bs-theme", theme);
}

export default function Root({ children }: Props): React.JSX.Element {
  useEffect(() => {
    syncBootstrapTheme();

    const observer = new MutationObserver(syncBootstrapTheme);
    observer.observe(document.documentElement, {
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
