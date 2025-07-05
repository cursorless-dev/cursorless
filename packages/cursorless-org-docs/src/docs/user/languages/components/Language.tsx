import React from "react";
import { ScopeSupport } from "./ScopeSupport";
import { ScopeVisualizer } from "./ScopeVisualizer";

interface Props {
  languageId: string;
}

export function Language({ languageId }: Props) {
  return (
    <>
      <h2>Scopes</h2>
      <ScopeVisualizer languageId={languageId} />
      <ScopeSupport languageId={languageId} />
    </>
  );
}
