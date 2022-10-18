import { Range, TextEditor } from "vscode";
import { Target } from "../../../typings/target.types";
import NestedScopeHandler from "./NestedScopeHandler";
import { ScopeHandler, TargetScope } from "./scopeHandler.types";

export default abstract class BaseRegexScopeHandler extends NestedScopeHandler {
  constructor(parentScopeHandler: ScopeHandler) {
    super(parentScopeHandler);
  }

  protected abstract getRegex(editor: TextEditor, domain: Range): RegExp;

  protected abstract constructTarget(
    isReversed: boolean,
    editor: TextEditor,
    contentRange: Range
  ): Target;

  protected isPreferredOver(
    _editor: TextEditor,
    _scope1: TargetScope,
    _scope2: TargetScope
  ): boolean | undefined {
    return undefined;
  }

  protected getScopesInParentScope({
    editor,
    domain,
  }: TargetScope): TargetScope[] {
    return this.getMatchesInRange(editor, domain).map((range) => {
      const scope: TargetScope = {
        editor,
        domain: range,
        getTarget: (isReversed) =>
          this.constructTarget(isReversed, editor, range),
      };

      scope.isPreferredOver = (other) =>
        this.isPreferredOver(editor, scope, other as TargetScope);

      return scope;
    });
  }

  private getMatchesInRange(editor: TextEditor, range: Range): Range[] {
    const offset = editor.document.offsetAt(range.start);
    const text = editor.document.getText(range);

    return [...text.matchAll(this.getRegex(editor, range))].map(
      (match) =>
        new Range(
          editor.document.positionAt(offset + match.index!),
          editor.document.positionAt(offset + match.index! + match[0].length)
        )
    );
  }
}
