/* eslint-disable @typescript-eslint/naming-convention */
import { InsertSnippetArg, NoSpokenFormError, WrapWithSnippetArg } from "..";

const insertSnippets: Record<string, string> = {
  ifStatement: "if",
  ifElseStatement: "if else",
  tryCatchStatement: "try",
  functionDeclaration: "funk",
  link: "link",
};

const wrapSnippets: Record<string, string> = {
  "ifElseStatement.alternative": "else",
  "functionDeclaration.body": "funk",
  "ifElseStatement.consequence": "if else",
  "ifStatement.consequence": "if",
  "tryCatchStatement.body": "try",
  "link.text": "link",
};

export function insertSnippetToSpokenForm(
  snippetDescription: InsertSnippetArg,
): string {
  if (snippetDescription.type === "custom") {
    throw new NoSpokenFormError("Custom insertion snippet");
  }
  const result = insertSnippets[snippetDescription.name];
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

export function wrapSnippetToSpokenForm(
  snippetDescription: WrapWithSnippetArg,
): string {
  if (snippetDescription.type === "custom") {
    throw new NoSpokenFormError("Custom wrap with snippet");
  }
  const name = `${snippetDescription.name}.${snippetDescription.variableName}`;
  const result = wrapSnippets[name];
  if (result == null) {
    throw new NoSpokenFormError(`Named wrap with snippet '${name}'`);
  }
  return result;
}
