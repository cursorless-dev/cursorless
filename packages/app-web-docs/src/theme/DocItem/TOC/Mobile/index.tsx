import { ThemeClassNames } from "@docusaurus/theme-common";
import OriginalDocItemTOCMobile from "@theme-original/DocItem/TOC/Mobile";
import TOCCollapsible from "@theme/TOCCollapsible";
import React from "react";
import { useDynamicTOC } from "../../../../docs/components/DynamicTOCContext";
import styles from "./styles.module.css";

// oxlint-disable-next-line import/no-default-export
export default function DocItemTOCMobile() {
  const { dynamicTOC } = useDynamicTOC();

  if (dynamicTOC == null) {
    return <OriginalDocItemTOCMobile />;
  }

  return (
    <TOCCollapsible
      toc={dynamicTOC.items}
      minHeadingLevel={dynamicTOC.minHeadingLevel}
      maxHeadingLevel={dynamicTOC.maxHeadingLevel}
      className={`${ThemeClassNames.docs.docTocMobile} ${styles["toc-mobile"]}`}
    />
  );
}
