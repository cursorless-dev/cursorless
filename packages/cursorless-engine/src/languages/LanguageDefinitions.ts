import {
  Disposable,
  Notifier,
  Range,
  TextDocument,
  isTesting,
  showError,
  type IDE,
  type RawTreeSitterQueryProvider,
  type Listener,
} from "@cursorless/common";
import { toString } from "lodash-es";
import { SyntaxNode } from "web-tree-sitter";
import { ide } from "../singletons/ide.singleton";
import { TreeSitter } from "../typings/TreeSitter";
import { LanguageDefinition } from "./LanguageDefinition";

/**
 * Sentinel value to indicate that a language doesn't have
 * a new-style query definition file
 */
const LANGUAGE_UNDEFINED = Symbol("LANGUAGE_UNDEFINED");

export interface LanguageDefinitions {
  onDidChangeDefinition: (listener: Listener) => Disposable;

  loadLanguage(languageId: string): Promise<void>;

  /**
   * Get a language definition for the given language id, if the language
   * has a new-style query definition, or return undefined if the language doesn't
   *
   * @param languageId The language id for which to get a language definition
   * @returns A language definition for the given language id, or undefined if
   * the given language id doesn't have a new-style query definition
   */
  get(languageId: string): LanguageDefinition | undefined;

  /**
   * @deprecated Only for use in legacy containing scope stage
   */
  getNodeAtLocation(
    document: TextDocument,
    range: Range,
  ): SyntaxNode | undefined;
}

/**
 * Keeps a map from language ids to  {@link LanguageDefinition} instances,
 * constructing them as necessary
 */
export class LanguageDefinitionsImpl
  implements LanguageDefinitions, Disposable
{
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
  private disposables: Disposable[] = [];

  private constructor(
    private ide: IDE,
    private treeSitter: TreeSitter,
    private treeSitterQueryProvider: RawTreeSitterQueryProvider,
  ) {
    ide.onDidOpenTextDocument((document) => {
      this.loadLanguage(document.languageId);
    });
    ide.onDidChangeVisibleTextEditors((editors) => {
      editors.forEach(({ document }) => this.loadLanguage(document.languageId));
    });

    this.disposables.push(
      treeSitterQueryProvider.onChanges(() => this.reloadLanguageDefinitions()),
    );
  }

  public static async create(
    ide: IDE,
    treeSitter: TreeSitter,
    treeSitterQueryProvider: RawTreeSitterQueryProvider,
  ) {
    const instance = new LanguageDefinitionsImpl(
      ide,
      treeSitter,
      treeSitterQueryProvider,
    );

    await instance.loadAllLanguages();

    return instance;
  }

  private async loadAllLanguages(): Promise<void> {
    const languageIds = ide().visibleTextEditors.map(
      ({ document }) => document.languageId,
    );

    try {
      await Promise.all(
        languageIds.map((languageId) => this.loadLanguage(languageId)),
      );
    } catch (err) {
      showError(
        ide().messages,
        "Failed to load language definitions",
        toString(err),
      );
      if (isTesting()) {
        throw err;
      }
    }
  }

  public async loadLanguage(languageId: string): Promise<void> {
    if (this.languageDefinitions.has(languageId)) {
      return;
    }

    const definition =
      (await LanguageDefinition.create(
        this.ide,
        this.treeSitterQueryProvider,
        this.treeSitter,
        languageId,
      )) ?? LANGUAGE_UNDEFINED;

    this.languageDefinitions.set(languageId, definition);
  }

  private async reloadLanguageDefinitions(): Promise<void> {
    this.languageDefinitions.clear();
    await this.loadAllLanguages();
    this.notifier.notifyListeners();
  }

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

  public getNodeAtLocation(document: TextDocument, range: Range): SyntaxNode {
    return this.treeSitter.getNodeAtLocation(document, range);
  }

  onDidChangeDefinition = this.notifier.registerListener;

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
