import { languageScopeSupport } from "@cursorless/common";
import React from "react";

interface Props {
  languageId: string;
}

export default function Language({ languageId }: Props) {
  console.log(languageScopeSupport);
  return <div>language: {languageId}</div>;
}
