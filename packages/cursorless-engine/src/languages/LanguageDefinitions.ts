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

  constructor(
    private fileSystem: FileSystem,
    private treeSitter: TreeSitter,
  ) {
    ide().onDidOpenTextDocument((document) => {
      this.loadLanguage(document.languageId);
    });
    ide().onDidChangeVisibleTextEditors((editors) => {
      editors.forEach(({ document }) => this.loadLanguage(document.languageId));
    });

    // Use the repo root as the root for development mode, so that
    // we can make hot-reloading work for the queries
    this.queryDir =
      ide().runMode === "development"
        ? join(getCursorlessRepoRoot(), "queries")
        : "queries";

    if (ide().runMode === "development") {
      this.disposables.push(
        fileSystem.watchDir(this.queryDir, () => {
          this.reloadLanguageDefinitions();
        }),
      );
    }
  }

  public async init(): Promise<void> {
    await this.loadAllLanguages();
  }

  private async loadAllLanguages(): Promise<void> {
    const languageIds = ide().visibleTextEditors.map(
      ({ document }) => document.languageId,
    );

    await Promise.all(
      languageIds.map((languageId) => this.loadLanguage(languageId)),
    );
  }

  public async loadLanguage(languageId: string): Promise<void> {
    if (this.languageDefinitions.has(languageId)) {
      return;
    }

    const definition =
      (await LanguageDefinition.create(
        this.treeSitter,
        this.fileSystem,
        this.queryDir,
        languageId,
      )) ?? LANGUAGE_UNDEFINED;

    this.languageDefinitions.set(languageId, definition);
  }

  private async reloadLanguageDefinitions(): Promise<void> {
    const languageIds = Array.from(this.languageDefinitions.keys());
    this.languageDefinitions.clear();
    await Promise.all(
      languageIds.map((languageId) => this.loadLanguage(languageId)),
    );
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
    const definition = this.languageDefinitions.get(languageId);

    if (definition == null) {
      throw new Error(
        "Expected language definition entry is missing for languageId " +
          languageId,
      );
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
