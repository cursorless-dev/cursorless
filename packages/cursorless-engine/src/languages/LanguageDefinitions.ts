import {
  Disposable,
  FileSystem,
  Notifier,
  Range,
  TextDocument,
  getCursorlessRepoRoot,
} from "@cursorless/common";
import { join } from "path";
import { SyntaxNode } from "web-tree-sitter";
import { TreeSitter } from "../typings/TreeSitter";
import { ide } from "../singletons/ide.singleton";
import { LanguageDefinition } from "./LanguageDefinition";

/**
 * Sentinel value to indicate that a language doesn't have
 * a new-style query definition file
 */
const LANGUAGE_UNDEFINED = Symbol("LANGUAGE_UNDEFINED");

/**
 * Keeps a map from language ids to  {@link LanguageDefinition} instances,
 * constructing them as necessary
 */
export class LanguageDefinitions {
  private notifier: Notifier = new Notifier();

  /**
   * Maps from language id to {@link LanguageDefinition} or
   * {@link LANGUAGE_UNDEFINED} if language doesn't have new-style definitions.
   * We use a sentinel value instead of undefined so that we can distinguish
   * between a situation where we haven't yet checked whether a language has a
   * new-style query definition and a situation where we've checked and found
   * that it doesn't.  The former case is represented by `undefined` (due to the
   * semantics of {@link Map.get}), while the latter is represented by the
   * sentinel value.
   */
  private languageDefinitions: Map<
    string,
    LanguageDefinition | typeof LANGUAGE_UNDEFINED
  > = new Map();
  private queryDir: string;
  private disposables: Disposable[] = [];
  private openDocuments = new Set<{languageId: string}>();

  constructor(
    private fileSystem: FileSystem,
    private treeSitter: TreeSitter,
  ) {
    ide().onDidOpenTextDocument((document) => {
      this.openLanguage(document.languageId);
      this.openDocuments.add(document);
    });
    ide().onDidCloseTextDocument((document) => {
      this.openDocuments.delete(document);
    });

    // Use the repo root as the root for development mode, so that we can
    // we can make hot-reloading work for the queries
    this.queryDir = join(
      ide().runMode === "development"
        ? getCursorlessRepoRoot()
        : ide().assetsRoot,
      "queries",
    );

    if (ide().runMode === "development") {
      this.disposables.push(
        fileSystem.watchDir(this.queryDir, () => {
          this.languageDefinitions.clear();
          this.notifier.notifyListeners();
        }),
      );
    }
  }

  async openLanguage(languageId: string): Promise<void> {
    let definition =
    await LanguageDefinition.create(this.treeSitter, this.fileSystem, "queries", languageId) ??
    LANGUAGE_UNDEFINED;

    this.languageDefinitions.set(languageId, definition);
  }

  async reloadLanguageDefinitions(): Promise<void> {
    this.languageDefinitions.clear();
    const openLanguages = new Set<string>;
    for (let document of this.openDocuments) {
      if (!openLanguages.has(document.languageId)){
        openLanguages.add(document.languageId);
        await this.openLanguage(document.languageId);
      }
    }
    this.notifier.notifyListeners();
  }

  /**
   * Get a language definition for the given language id, if the language
   * has a new-style query definition, or return undefined if the language doesn't
   *
   * @param languageId The language id for which to get a language definition
   * @returns A language definition for the given language id, or undefined if
   * the given language id doesn't have a new-style query definition
   */
  get(languageId: string): LanguageDefinition | undefined {
    let definition = this.languageDefinitions.get(languageId);

    if (definition == null) {
      throw new Error(
        "Expected language definition entry missing for languageId " +
        languageId);
    }

    return definition === LANGUAGE_UNDEFINED ? undefined : definition;
  }

  /**
   * @deprecated Only for use in legacy containing scope stage
   */
  public getNodeAtLocation(document: TextDocument, range: Range): SyntaxNode {
    return this.treeSitter.getNodeAtLocation(document, range);
  }

  onDidChangeDefinition = this.notifier.registerListener;

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
