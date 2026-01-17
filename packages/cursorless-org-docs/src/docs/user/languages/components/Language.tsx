import React from "react";
import { DynamicTOC } from "../../../components/DynamicTOC";
import { ScopeVisualizer } from "../../../components/ScopeVisualizer";
import { ScrollToHashId } from "../../../components/ScrollToHashId";

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
