import type { ScopeTypeType } from "@cursorless/common";
import React from "react";
import { DynamicTOC } from "../../../components/DynamicTOC";
import { ScopeVisualizer } from "../../../components/ScopeVisualizer";
import { ScrollToHash } from "../../../components/ScrollToHash";

interface Props {
  scopeTypeType: ScopeTypeType;
}

export function Scopes({ scopeTypeType }: Props) {
  return (
    <>
      <DynamicTOC />
      <ScrollToHash />

      <ScopeVisualizer scopeTypeType={scopeTypeType} />
    </>
  );
}
