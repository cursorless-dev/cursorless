import { ThemeClassNames } from "@docusaurus/theme-common";
import OriginalDocItemTOCDesktop from "@theme-original/DocItem/TOC/Desktop";
import TOC from "@theme/TOC";
import React from "react";
import { useDynamicTOC } from "../../../../docs/components/DynamicTOCContext";

// oxlint-disable-next-line import/no-default-export
export default function DocItemTOCDesktop() {
  const { dynamicTOC } = useDynamicTOC();

  if (dynamicTOC == null) {
    return <OriginalDocItemTOCDesktop />;
  }

  return (
    // oxlint-disable-next-line react/jsx-pascal-case
    <TOC
      toc={dynamicTOC.items}
      minHeadingLevel={dynamicTOC.minHeadingLevel}
      maxHeadingLevel={dynamicTOC.maxHeadingLevel}
      className={ThemeClassNames.docs.docTocDesktop}
    />
  );
}
