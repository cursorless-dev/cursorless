import * as semver from "semver";
import * as vscode from "vscode";

/**
 * FIXME: On newer vscode versions some Tree sitter parser throws memory errors
 * https://github.com/cursorless-dev/cursorless/issues/2879
 */
const isVersionProblematic = semver.gte(vscode.version, "1.98.0");

export function shouldSkipRecordedTest(name: string): boolean {
  return isVersionProblematic && name.startsWith("recorded/languages/latex/");
}

export function shouldSkipScopeTest(languageId: string): boolean {
  return isVersionProblematic && languageId === "latex";
}
