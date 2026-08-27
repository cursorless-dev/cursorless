import React from "react";
import type { ScopeTypeType } from "@cursorless/lib-common";
import { DynamicTOC } from "./DynamicTOC";
import { ScopeVisualizer } from "./ScopeVisualizer";
import { ScrollToHashId } from "./ScrollToHashId";

interface Props {
  scopeTypeType: ScopeTypeType;
}

export function Scopes({ scopeTypeType }: Props) {
  return (
    <>
      <DynamicTOC />
      <ScrollToHashId />

      <ScopeVisualizer scopeTypeType={scopeTypeType} />
    </>
  );
}
