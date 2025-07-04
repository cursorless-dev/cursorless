import React from "react";
import { ScopeSupport } from "./ScopeSupport";
import { ScopeVisualizer } from "./ScopeVisualizer";

interface Props {
  languageId: string;
}

export function Language({ languageId }: Props) {
  // TODO: find a better place for the scope visualizer
  return (
    <>
      <ScopeVisualizer languageId={languageId} />
      <ScopeSupport languageId={languageId} />
    </>
  );
}
