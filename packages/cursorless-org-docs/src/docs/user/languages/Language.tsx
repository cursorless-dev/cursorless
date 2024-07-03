import React from "react";
import ScopeSupport from "./ScopeSupport";

interface Props {
  languageId: string;
}

export default function Language({ languageId }: Props) {
  return <ScopeSupport languageId={languageId} />;
}
