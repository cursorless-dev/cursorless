import type { ScopeTypeType } from "@cursorless/common";
import React from "react";
import { DynamicTOC } from "../../../components/DynamicTOC";
import { ScopeSupport } from "../../../components/ScopeSupport";
import { ScrollToHash } from "../../../components/ScrollToHash";

interface Props {
  scopeTypeType: ScopeTypeType;
}

export function Scopes({ scopeTypeType }: Props) {
  return (
    <>
      <DynamicTOC />
      <ScrollToHash />

      <ScopeSupport scopeTypeType={scopeTypeType} />
    </>
  );
}
