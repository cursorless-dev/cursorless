import type {
  ScopeType,
  SimpleScopeTypeType,
  TextEditor,
} from "@cursorless/common";
import { Position, isEmptyIterable } from "@cursorless/common";
import type { LegacyLanguageId } from "../languages/LegacyLanguageId";
import { languageMatchers } from "../languages/getNodeMatcher";
import type { ScopeHandlerFactory } from "../processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import type { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { ScopeSupport } from "../api/ScopeProvider";

/**
 * Determines the level of support for a given scope type in a given editor.
 * This is primarily determined by the language id of the editor, though some
 * scopes are supported in all languages.
 */
export class ScopeSupportChecker {
  constructor(private scopeHandlerFactory: ScopeHandlerFactory) {
    this.getScopeSupport = this.getScopeSupport.bind(this);
    this.getIterationScopeSupport = this.getIterationScopeSupport.bind(this);
  }

  /**
   * Determine the level of support for {@link scopeType} in {@link editor}, as
   * determined by its language id.
   * @param editor The editor to check
   * @param scopeType The scope type to check
   * @returns The level of support for {@link scopeType} in {@link editor}
   */
  getScopeSupport(editor: TextEditor, scopeType: ScopeType): ScopeSupport {
    const { languageId } = editor.document;
    const scopeHandler = this.scopeHandlerFactory.create(scopeType, languageId);

    if (scopeHandler == null) {
      return getLegacyScopeSupport(languageId, scopeType);
    }

    return editorContainsScope(editor, scopeHandler)
      ? ScopeSupport.supportedAndPresentInEditor
      : ScopeSupport.supportedButNotPresentInEditor;
  }

  /**
   * Determine the level of support for the iteration scope of {@link scopeType}
   * in {@link editor}, as determined by its language id.
   * @param editor The editor to check
   * @param scopeType The scope type to check
   * @returns The level of support for the iteration scope of {@link scopeType}
   * in {@link editor}
   */
  getIterationScopeSupport(
    editor: TextEditor,
    scopeType: ScopeType,
  ): ScopeSupport {
    const { languageId } = editor.document;
    const scopeHandler = this.scopeHandlerFactory.create(scopeType, languageId);

    if (scopeHandler == null) {
      return getLegacyScopeSupport(languageId, scopeType);
    }

    const iterationScopeHandler = this.scopeHandlerFactory.create(
      scopeHandler.iterationScopeType,
      languageId,
    );

    if (iterationScopeHandler == null) {
      return ScopeSupport.unsupported;
    }

    return editorContainsScope(editor, iterationScopeHandler)
      ? ScopeSupport.supportedAndPresentInEditor
      : ScopeSupport.supportedButNotPresentInEditor;
  }
}

function editorContainsScope(
  editor: TextEditor,
  scopeHandler: ScopeHandler,
): boolean {
  return !isEmptyIterable(
    scopeHandler.generateScopes(editor, new Position(0, 0), "forward"),
  );
}

function getLegacyScopeSupport(
  languageId: string,
  scopeType: ScopeType,
): ScopeSupport {
  switch (scopeType.type) {
    case "boundedNonWhitespaceSequence":
    case "surroundingPair":
      return ScopeSupport.supportedLegacy;
    case "notebookCell":
      // FIXME: What to do here
      return ScopeSupport.unsupported;
    default:
      if (
        languageMatchers[languageId as LegacyLanguageId]?.[
          scopeType.type as SimpleScopeTypeType
        ] != null
      ) {
        return ScopeSupport.supportedLegacy;
      }

      return ScopeSupport.unsupported;
  }
}
