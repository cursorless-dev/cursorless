import type { Props } from "@theme/Root";
import React, { useEffect } from "react";

function syncBootstrapTheme() {
  const root = document.documentElement;
  const theme = root.dataset.theme;

  if (theme == null) {
    delete root.dataset.bsTheme;
    return;
  }

  root.dataset.bsTheme = theme;
}

export default function Root({ children }: Props): React.ReactNode {
  useEffect(() => {
    syncBootstrapTheme();

    const observer = new MutationObserver(syncBootstrapTheme);
    observer.observe(document.documentElement, {
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return children;
}
