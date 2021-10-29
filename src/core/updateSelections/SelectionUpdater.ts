import { pullAll, some } from "lodash";
import {
  workspace,
  TextDocument,
  TextDocumentChangeEvent,
  Disposable,
  TextDocumentContentChangeEvent,
} from "vscode";
import { Edit, Graph } from "../../typings/Types";
import {
  ExtendedTextDocumentChangeEvent,
  FullSelectionInfo,
} from "../../typings/updateSelections";
import { getDefault } from "../../util/map";
import { updateRangeInfos } from "./updateRangeInfos";

export class SelectionUpdater {
  private selectionInfos: Map<string, FullSelectionInfo[]> = new Map();
  private replaceEdits: Map<string, Edit[]> = new Map();
  private disposable!: Disposable;

  constructor(graph: Graph) {
    this.listenForDocumentChanges();
  }

  private getDocumentSelectionInfos(document: TextDocument) {
    return getDefault(this.selectionInfos, document.uri.toString(), () => []);
  }

  private getDocumentReplaceEdits(document: TextDocument) {
    return getDefault(this.replaceEdits, document.uri.toString(), () => []);
  }

  registerSelectionInfos(
    document: TextDocument,
    selectionInfos: FullSelectionInfo[]
  ): () => void {
    const currentSelectionInfos = this.getDocumentSelectionInfos(document);

    currentSelectionInfos.push(...selectionInfos);

    return () => pullAll(currentSelectionInfos, selectionInfos);
  }

  registerReplaceEdits(
    document: TextDocument,
    replaceEdits: Edit[]
  ): () => void {
    const currentReplaceEdits = this.getDocumentReplaceEdits(document);

    currentReplaceEdits.push(...replaceEdits);

    return () => pullAll(currentReplaceEdits, replaceEdits);
  }

  private listenForDocumentChanges() {
    this.disposable = workspace.onDidChangeTextDocument(
      (event: TextDocumentChangeEvent) => {
        const documentReplaceEdits = this.getDocumentReplaceEdits(
          event.document
        );

        const isReplace = (change: TextDocumentContentChangeEvent) =>
          some(
            documentReplaceEdits,
            (replaceEdit) =>
              replaceEdit.range.isEqual(change.range) &&
              replaceEdit.text === change.text
          );

        const documentSelectionInfos = this.getDocumentSelectionInfos(
          event.document
        );

        const extendedEvent: ExtendedTextDocumentChangeEvent = {
          ...event,
          contentChanges: event.contentChanges.map((change) =>
            isReplace(change)
              ? {
                  ...change,
                  isReplace: true,
                }
              : change
          ),
        };

        updateRangeInfos(extendedEvent, documentSelectionInfos);
      }
    );
  }

  dispose() {
    this.disposable.dispose();
  }
}
