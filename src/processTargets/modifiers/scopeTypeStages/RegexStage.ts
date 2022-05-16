import { Position, Range, TextEditor } from "vscode";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
  ScopeTypeTarget,
  Target,
} from "../../../typings/target.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { getTokenContext } from "./TokenStage";

class RegexStage implements ModifierStage {
  constructor(
    private modifier: ContainingScopeModifier | EveryScopeModifier,
    private regex: RegExp,
    private name?: string
  ) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget {
    const { editor } = target;
    const start = this.getMatch(editor, target.contentRange.start).start;
    const end = this.getMatch(editor, target.contentRange.end).end;
    const contentRange = new Range(start, end);
    return {
      scopeType: this.modifier.scopeType,
      editor,
      isReversed: target.isReversed,
      contentRange,
      ...getTokenContext(target.editor, contentRange),
    };
  }

  getMatch(editor: TextEditor, position: Position) {
    const line = editor.document.lineAt(position);
    const result = [...line.text.matchAll(this.regex)]
      .map(
        (match) =>
          new Range(
            position.line,
            match.index!,
            position.line,
            match.index! + match[0].length
          )
      )
      .find((range) => range.contains(position));
    if (result == null) {
      if (this.name) {
        throw new Error(`Couldn't find containing ${this.name}`);
      } else {
        throw new Error(`Cannot find sequence defined by regex: ${this.regex}`);
      }
    }
    return result;
  }
}

export class NonWhitespaceSequenceStage extends RegexStage {
  constructor(modifier: ContainingScopeModifier | EveryScopeModifier) {
    super(modifier, /\S+/g, "Non whitespace sequence");
  }
}

// taken from https://regexr.com/3e6m0
const URL_REGEX =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

export class UrlStage extends RegexStage {
  constructor(modifier: ContainingScopeModifier | EveryScopeModifier) {
    super(modifier, URL_REGEX, "URL");
  }
}
