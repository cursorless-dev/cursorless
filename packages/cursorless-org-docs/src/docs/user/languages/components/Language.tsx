import React from "react";
import { ScopeSupport } from "./ScopeSupport";

interface Props {
  languageId: string;
}

export function Language({ languageId }: Props) {
  return <ScopeSupport languageId={languageId} />;
}
