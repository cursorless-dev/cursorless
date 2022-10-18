import { Range, TextEditor } from "vscode";
import { Target } from "../../../typings/target.types";
import NestedScopeHandler from "./NestedScopeHandler";
import { ScopeHandler, TargetScope } from "./scopeHandler.types";

export default abstract class SimpleRegexScopeHandler extends NestedScopeHandler {
  constructor(parentScopeHandler: ScopeHandler, private regex: RegExp) {
    super(parentScopeHandler);
  }

  protected abstract constructTarget(
    isReversed: boolean,
    editor: TextEditor,
    contentRange: Range
  ): Target;

  protected getScopesInParentScope({
    editor,
    domain,
  }: TargetScope): TargetScope[] {
    return this.getMatchesInRange(editor, domain).map((range) => ({
      editor,
      domain: range,
      getTarget: (isReversed) =>
        this.constructTarget(isReversed, editor, range),
    }));
  }

  private getMatchesInRange(editor: TextEditor, range: Range): Range[] {
    const offset = editor.document.offsetAt(range.start);
    const text = editor.document.getText(range);

    return [...text.matchAll(this.regex)].map(
      (match) =>
        new Range(
          editor.document.positionAt(offset + match.index!),
          editor.document.positionAt(offset + match.index! + match[0].length)
        )
    );
  }
}
