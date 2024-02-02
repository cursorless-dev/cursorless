import * as semver from "semver";
import { version } from "vscode";
import { TextDocument } from "vscode";
import { getNotebookFromCellDocumentLegacy } from "./notebookLegacy";
import { getNotebookFromCellDocumentCurrent } from "./notebookCurrent";

export function isVscodeLegacyNotebookVersion() {
  return semver.lt(version, "1.68.0");
}

/**
 * Given a document corresponding to a single cell, retrieve the notebook
 * document for the entire notebook
 * @param document The document corresponding to the given cell
 * @returns The notebook document corresponding to the notebook containing the
 * given cell
 */
export function getNotebookFromCellDocument(document: TextDocument) {
  if (isVscodeLegacyNotebookVersion()) {
    return getNotebookFromCellDocumentLegacy(document);
  } else {
    return getNotebookFromCellDocumentCurrent(document);
  }
}
