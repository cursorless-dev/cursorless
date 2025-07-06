import React from "react";
import { DynamicTOC } from "./DynamicTOC";
import { ScopeSupport } from "./ScopeSupport";
import { ScrollToHash } from "./ScrollToHash";

interface Props {
  languageId: string;
}

export function Language({ languageId }: Props) {
  return (
    <>
      <DynamicTOC />
      <ScrollToHash />

      <ScopeSupport languageId={languageId} />
    </>
  );
}
