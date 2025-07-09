import type { ScopeTypeType } from "@cursorless/common";
import React from "react";
import { DynamicTOC } from "../../../components/DynamicTOC";
import { ScopeVisualizer } from "../../../components/ScopeVisualizer";
import { ScrollToHashId } from "../../../components/ScrollToHashId";

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
