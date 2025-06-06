import React from "react";
import { ShikiComponentList } from "@cursorless/test-case-component";

interface Props {
  languageId: string;
}

export function DisplayComponent({ languageId }: Props) {
  return (
    <>
      <ShikiComponentList language={languageId} />
    </>
  );
}
