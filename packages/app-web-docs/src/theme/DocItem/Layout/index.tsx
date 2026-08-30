import OriginalDocItemLayout from "@theme-original/DocItem/Layout";
import React from "react";
import type { ComponentProps } from "react";
import { DynamicTOCProvider } from "../../../docs/components/DynamicTOCContext";

// oxlint-disable-next-line import/no-default-export
export default function DocItemLayout(
  props: ComponentProps<typeof OriginalDocItemLayout>,
) {
  return (
    <DynamicTOCProvider>
      {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
      <OriginalDocItemLayout {...props} />
    </DynamicTOCProvider>
  );
}
