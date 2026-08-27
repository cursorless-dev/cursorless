import React from "react";
import { DynamicTOC } from "./DynamicTOC";
import { ScopeVisualizer } from "./ScopeVisualizer";
import { ScrollToHashId } from "./ScrollToHashId";

interface Props {
  languageId: string;
}

export function Language({ languageId }: Props) {
  return (
    <>
      <DynamicTOC />
      <ScrollToHashId />

      <ScopeVisualizer languageId={languageId} />
    </>
  );
}
