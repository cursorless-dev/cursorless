import type {
  ScopeType,
  SimpleScopeTypeType,
  TextEditor,
} from "@cursorless/common";
import { Position, ScopeSupport, isEmptyIterable } from "@cursorless/common";
import type { ScopeHandlerFactory } from "../processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import type { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";

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
    const scopeHandler = this.scopeHandlerFactory.maybeCreate(
      scopeType,
      languageId,
    );

    if (scopeHandler == null) {
      return ScopeSupport.unsupported;
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
    const scopeHandler = this.scopeHandlerFactory.maybeCreate(
      scopeType,
      languageId,
    );

    if (scopeHandler == null) {
      return ScopeSupport.unsupported;
    }

    const iterationScopeHandler = this.scopeHandlerFactory.maybeCreate(
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
