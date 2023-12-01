import * as semver from "semver";
import { version } from "vscode";
import { TextDocument } from "vscode";
import { getNotebookFromCellDocumentLegacy } from "./notebookLegacy";
import { getNotebookFromCellDocumentCurrent } from "./notebookCurrent";

export function isVscodeLegacyNotebookVersion() {
  return semver.lt(version, "1.68.0");
}

export function getNotebookFromCellDocument(document: TextDocument) {
  if (isVscodeLegacyNotebookVersion()) {
    return getNotebookFromCellDocumentLegacy(document);
  } else {
    return getNotebookFromCellDocumentCurrent(document);
  }
}
