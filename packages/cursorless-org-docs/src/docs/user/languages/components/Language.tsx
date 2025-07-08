import React from "react";
import { DynamicTOC } from "../../../components/DynamicTOC";
import { ScopeVisualizer } from "../../../components/ScopeVisualizer";
import { ScrollToHash } from "../../../components/ScrollToHash";

interface Props {
  languageId: string;
}

export function Language({ languageId }: Props) {
  return (
    <>
      <DynamicTOC />
      <ScrollToHash />

      <ScopeVisualizer languageId={languageId} />
    </>
  );
}
