import { pull } from "lodash";
import {
  workspace,
  TextDocument,
  TextDocumentChangeEvent,
  Disposable,
  TextDocumentContentChangeEvent,
} from "vscode";
import { Edit } from "../../typings/Types";
import {
  ExtendedTextDocumentChangeEvent,
  FullRangeInfo,
} from "../../typings/updateSelections";
import { getDefault } from "../../util/map";
import { updateRangeInfos } from "./updateRangeInfos";

export class RangeUpdater {
  private rangeInfoLists: Map<string, FullRangeInfo[][]> = new Map();
  private replaceEditLists: Map<string, Edit[][]> = new Map();
  private disposable!: Disposable;

  constructor() {
    this.listenForDocumentChanges();
  }

  private getDocumentRangeInfoLists(document: TextDocument) {
    return getDefault(this.rangeInfoLists, document.uri.toString(), () => []);
  }

  private getDocumentReplaceEditLists(document: TextDocument) {
    return getDefault(this.replaceEditLists, document.uri.toString(), () => []);
  }

  /**
   * Registers a list of range infos to be kept up to date.  It is ok to
   * add to this list after registering it; any items in the list at the time of
   * a document change will be kept up to date.  Please be sure to call the
   * returned deregister function when you no longer need the ranges
   * updated.
   * @param document The document containing the ranges
   * @param rangeInfoList The ranges to keep up to date; it is ok to add to this list after the fact
   * @returns A function that can be used to deregister the list
   */
  registerRangeInfoList(
    document: TextDocument,
    rangeInfoList: FullRangeInfo[],
  ): () => void {
    const documentRangeInfoLists = this.getDocumentRangeInfoLists(document);

    documentRangeInfoLists.push(rangeInfoList);

    return () => pull(documentRangeInfoLists, rangeInfoList);
  }

  /**
   * Registers a list of edits to treat as replace edits. These edits are
   * insertions that will not shift an empty selection to the right. Call this
   * function before applying your edits to the document
   *
   * Note that if you make two edits at the same location with the same text,
   * it is not possible to mark only one of them as replace edit.
   *
   * It is ok to add to this list after registering it; any items in the list
   * at the time of a document change will be treated as replace edits.  Please
   * be sure to call the returned deregister function after you have waited for
   * your edits to be applied.
   * @param document The document containing the ranges
   * @param replaceEditList A list of edits to treat as replace edits; it is ok to add to this list after the fact
   * @returns A function that can be used to deregister the list
   */
  registerReplaceEditList(
    document: TextDocument,
    replaceEditList: Edit[],
  ): () => void {
    const documentReplaceEditLists = this.getDocumentReplaceEditLists(document);

    documentReplaceEditLists.push(replaceEditList);

    return () => pull(documentReplaceEditLists, replaceEditList);
  }

  private *documentRangeInfoGenerator(document: TextDocument) {
    const documentRangeInfoLists = this.getDocumentRangeInfoLists(document);

    for (const rangeInfoLists of documentRangeInfoLists) {
      for (const rangeInfo of rangeInfoLists) {
        yield rangeInfo;
      }
    }
  }

  private listenForDocumentChanges() {
    this.disposable = workspace.onDidChangeTextDocument(
      (event: TextDocumentChangeEvent) => {
        const documentReplaceEditLists = this.getDocumentReplaceEditLists(
          event.document,
        );

        const extendedEvent: ExtendedTextDocumentChangeEvent = {
          ...event,
          contentChanges: event.contentChanges.map((change) =>
            isReplace(documentReplaceEditLists, change)
              ? {
                  ...change,
                  isReplace: true,
                }
              : change,
          ),
        };

        updateRangeInfos(
          extendedEvent,
          this.documentRangeInfoGenerator(event.document),
        );
      },
    );
  }

  dispose() {
    this.disposable.dispose();
  }
}

function isReplace(
  documentReplaceEditLists: Edit[][],
  change: TextDocumentContentChangeEvent,
) {
  for (const replaceEditLists of documentReplaceEditLists) {
    for (const replaceEdit of replaceEditLists) {
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
