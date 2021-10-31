import { pull, some } from "lodash";
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
  FullRangeInfo,
} from "../../typings/updateSelections";
import { getDefault } from "../../util/map";
import { updateRangeInfos } from "./updateRangeInfos";

export class RangeUpdater {
  private rangeInfos: Map<string, FullRangeInfo[][]> = new Map();
  private replaceEdits: Map<string, Edit[][]> = new Map();
  private disposable!: Disposable;

  constructor(graph: Graph) {
    this.listenForDocumentChanges();
  }

  private getDocumentRangeInfos(document: TextDocument) {
    return getDefault(this.rangeInfos, document.uri.toString(), () => []);
  }

  private getDocumentReplaceEdits(document: TextDocument) {
    return getDefault(this.replaceEdits, document.uri.toString(), () => []);
  }

  /**
   * Registers a list of range infos to be kept up to date.  It is ok to
   * add to this list after registering it; any items in the list at the time of
   * a document change will be kept up to date.  Please be sure to call the
   * returned deregister function when you no longer need the ranges
   * updated.
   * @param document The document containing the ranges
   * @param rangeInfos The ranges to keep up to date; it is ok to add to this list after the fact
   * @returns A function that can be used to deregister the list
   */
  registerRangeInfos(
    document: TextDocument,
    rangeInfos: FullRangeInfo[]
  ): () => void {
    const currentRangeInfos = this.getDocumentRangeInfos(document);

    currentRangeInfos.push(rangeInfos);

    return () => pull(currentRangeInfos, rangeInfos);
  }

  registerReplaceEdits(
    document: TextDocument,
    replaceEdits: Edit[]
  ): () => void {
    const currentReplaceEdits = this.getDocumentReplaceEdits(document);

    currentReplaceEdits.push(replaceEdits);

    return () => pull(currentReplaceEdits, replaceEdits);
  }

  private *documentRangeInfoGenerator(document: TextDocument) {
    const documentRangeInfos = this.getDocumentRangeInfos(document);

    for (const rangeInfos of documentRangeInfos) {
      for (const rangeInfo of rangeInfos) {
        yield rangeInfo;
      }
    }
  }

  private isReplace(
    document: TextDocument,
    change: TextDocumentContentChangeEvent
  ) {
    const documentReplaceEdits = this.getDocumentReplaceEdits(document);

    for (const replaceEdits of documentReplaceEdits) {
      for (const replaceEdit of replaceEdits) {
        if (
          replaceEdit.range.isEqual(change.range) &&
          replaceEdit.text === change.text
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private listenForDocumentChanges() {
    this.disposable = workspace.onDidChangeTextDocument(
      (event: TextDocumentChangeEvent) => {
        const extendedEvent: ExtendedTextDocumentChangeEvent = {
          ...event,
          contentChanges: event.contentChanges.map((change) =>
            this.isReplace(event.document, change)
              ? {
                  ...change,
                  isReplace: true,
                }
              : change
          ),
        };

        updateRangeInfos(
          extendedEvent,
          this.documentRangeInfoGenerator(event.document)
        );
      }
    );
  }

  dispose() {
    this.disposable.dispose();
  }
}
