import { flatten, pull, pullAll, some } from "lodash";
import {
  workspace,
  TextDocument,
  TextDocumentChangeEvent,
  Disposable,
} from "vscode";
import { Edit } from "../../typings/Types";
import {
  ExtendedTextDocumentContentChangeEvent,
  FullSelectionInfo,
} from "../../typings/updateSelections";
import { getDefault } from "../../util/map";
import { updateRangeInfos } from "./updateRangeInfos";

export class SelectionUpdater {
  private selectionInfos: Map<TextDocument, FullSelectionInfo[][]> = new Map();
  private replaceEdits: Map<TextDocument, Edit[][]> = new Map();
  private disposable!: Disposable;

  constructor() {
    this.listenForDocumentChanges();
  }

  private getDocumentSelectionInfoMatrix(document: TextDocument) {
    return getDefault(this.selectionInfos, document, () => []);
  }

  private getDocumentReplaceEditMatrix(document: TextDocument) {
    return getDefault(this.replaceEdits, document, () => []);
  }

  registerSelectionInfos(
    document: TextDocument,
    selectionInfoMatrix: FullSelectionInfo[][]
  ): () => void {
    const currentSelectionInfoMatrix =
      this.getDocumentSelectionInfoMatrix(document);

    currentSelectionInfoMatrix.push(...selectionInfoMatrix);

    return () => pullAll(currentSelectionInfoMatrix, selectionInfoMatrix);
  }

  registerReplaceEdits(
    document: TextDocument,
    replaceEdits: Edit[]
  ): () => void {
    const currentReplaceEditMatrix =
      this.getDocumentReplaceEditMatrix(document);

    currentReplaceEditMatrix.push(replaceEdits);

    return () => pull(currentReplaceEditMatrix, replaceEdits);
  }

  private listenForDocumentChanges() {
    this.disposable = workspace.onDidChangeTextDocument(
      (event: TextDocumentChangeEvent) => {
        const documentReplaceEditMatrix = this.getDocumentReplaceEditMatrix(
          event.document
        );

        const documentSelectionInfoMatrix = this.getDocumentSelectionInfoMatrix(
          event.document
        );

        event.contentChanges.forEach((change) => {
          if (
            some(documentReplaceEditMatrix, (replaceEditList) =>
              some(
                replaceEditList,
                (replaceEdit) =>
                  replaceEdit.range.isEqual(change.range) &&
                  replaceEdit.text === change.text
              )
            )
          ) {
            (change as ExtendedTextDocumentContentChangeEvent).isReplace = true;
          }
        });

        updateRangeInfos(event, flatten(documentSelectionInfoMatrix));
      }
    );
  }

  dispose() {
    this.disposable.dispose();
  }
}
