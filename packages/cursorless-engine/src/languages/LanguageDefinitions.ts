import { TreeSitter } from "..";
import { LanguageDefinition } from "./LanguageDefinition";
import { LanguageId } from "./constants";

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

  constructor(private treeSitter: TreeSitter) {}

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
      definition =
        LanguageDefinition.create(this.treeSitter, languageId as LanguageId) ??
        LANGUAGE_UNDEFINED;

      this.languageDefinitions.set(languageId, definition);
    }

    return definition === LANGUAGE_UNDEFINED ? undefined : definition;
  }
}
