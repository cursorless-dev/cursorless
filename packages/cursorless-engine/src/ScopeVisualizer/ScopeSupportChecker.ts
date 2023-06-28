import {
  Position,
  ScopeType,
  TextEditor,
  isEmptyIterable,
} from "@cursorless/common";
import { LegacyLanguageId } from "../languages/LegacyLanguageId";
import { languageMatchers } from "../languages/getNodeMatcher";
import { ScopeHandlerFactory } from "../processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { ScopeSupport } from "../CursorlessEngineApi";

export class ScopeSupportChecker {
  constructor(private scopeHandlerFactory: ScopeHandlerFactory) {
    this.getScopeSupport = this.getScopeSupport.bind(this);
    this.getIterationScopeSupport = this.getIterationScopeSupport.bind(this);
  }

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
    case "nonWhitespaceSequence":
    case "boundedNonWhitespaceSequence":
    case "url":
    case "surroundingPair":
    case "customRegex":
      return ScopeSupport.supportedLegacy;
    case "notebookCell":
    case "oneOf":
      // FIXME: What to do here
      return ScopeSupport.unsupported;
    default:
      if (
        languageMatchers[languageId as LegacyLanguageId]?.[scopeType.type] !=
        null
      ) {
        return ScopeSupport.supportedLegacy;
      }

      return ScopeSupport.unsupported;
  }
}
