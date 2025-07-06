import React from "react";
import DynamicTOC from "./DynamicTOC";
import { ScopeSupport } from "./ScopeSupport";

interface Props {
  languageId: string;
}

export function Language({ languageId }: Props) {
  return (
    <>
      <DynamicTOC />

      <ScopeSupport languageId={languageId} />
    </>
  );
}
