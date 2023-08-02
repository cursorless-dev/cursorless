/* eslint-disable @typescript-eslint/naming-convention */

import { InsertSnippetArg, WrapWithSnippetArg } from "@cursorless/common";
import { NoSpokenFormError } from "../NoSpokenFormError";

const insertionSnippets: Record<string, string> = {
  ifStatement: "if",
  ifElseStatement: "if else",
  tryCatchStatement: "try",
  functionDeclaration: "funk",
  link: "link",
};

const wrapperSnippets: Record<string, string> = {
  "ifElseStatement.alternative": "else",
  "functionDeclaration.body": "funk",
  "ifElseStatement.consequence": "if else",
  "ifStatement.consequence": "if",
  "tryCatchStatement.body": "try",
  "link.text": "link",
};

export function insertionSnippetToSpokenForm(
  snippetDescription: InsertSnippetArg,
): string {
  if (snippetDescription.type === "custom") {
    throw new NoSpokenFormError("Custom insertion snippet");
  }
  const result = insertionSnippets[snippetDescription.name];
  if (result == null) {
    throw new NoSpokenFormError(
      `Named insertion snippet '${snippetDescription.name}'`,
    );
  }
  if (snippetDescription.substitutions != null) {
    const values = Object.values(snippetDescription.substitutions);
    return `${result} ${values.join(" ")}`;
  }
  return result;
}

export function wrapperSnippetToSpokenForm(
  snippetDescription: WrapWithSnippetArg,
): string {
  if (snippetDescription.type === "custom") {
    throw new NoSpokenFormError("Custom wrap with snippet");
  }
  const name = `${snippetDescription.name}.${snippetDescription.variableName}`;
  const result = wrapperSnippets[name];
  if (result == null) {
    throw new NoSpokenFormError(`Named wrap with snippet '${name}'`);
  }
  return result;
}
