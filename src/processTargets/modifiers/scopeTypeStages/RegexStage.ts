import { Position, Range, TextEditor } from "vscode";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import ScopeTypeTarget from "../../targets/ScopeTypeTarget";

type RegexModifier = NonWhitespaceSequenceModifier | UrlModifier;

class RegexStage implements ModifierStage {
  constructor(
    private modifier: RegexModifier,
    private regex: RegExp,
    private name?: string
  ) {}

  run(context: ProcessedTargetsContext, target: Target): ScopeTypeTarget[] {
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(target);
    }
    return [this.getSingleTarget(target)];
  }

  private getEveryTarget(target: Target): ScopeTypeTarget[] {
    const { contentRange, editor } = target;
    const start = target.hasExplicitRange
      ? contentRange.start
      : editor.document.lineAt(contentRange.start).range.start;
    const end = target.hasExplicitRange
      ? contentRange.end
      : editor.document.lineAt(contentRange.end).range.end;
    const targets: ScopeTypeTarget[] = [];

    for (let i = start.line; i <= end.line; ++i) {
      this.getMatchesForLine(editor, i).forEach((range) => {
        // Regex match and selection intersects
        if (
          range.end.isAfterOrEqual(start) &&
          range.start.isBeforeOrEqual(end)
        ) {
          targets.push(this.getTargetFromRange(target, range));
        }
      });
    }

    if (targets.length === 0) {
      if (targets.length === 0) {
        throw new Error(
          `Couldn't find containing ${this.modifier.scopeType.type}`
        );
      }
    }

    return targets;
  }

  private getSingleTarget(target: Target): ScopeTypeTarget {
    const { editor } = target;
    const start = this.getMatchForPos(editor, target.contentRange.start).start;
    const end = this.getMatchForPos(editor, target.contentRange.end).end;
    const contentRange = new Range(start, end);
    return this.getTargetFromRange(target, contentRange);
  }

  private getTargetFromRange(
    target: Target,
    contentRange: Range
  ): ScopeTypeTarget {
    return new ScopeTypeTarget({
      scopeTypeType: this.modifier.scopeType.type,
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange,
    });
  }

  private getMatchForPos(editor: TextEditor, position: Position) {
    const match = this.getMatchesForLine(editor, position.line).find((range) =>
      range.contains(position)
    );
    if (match == null) {
      if (this.name) {
        throw new Error(`Couldn't find containing ${this.name}`);
      } else {
        throw new Error(`Cannot find sequence defined by regex: ${this.regex}`);
      }
    }
    return match;
  }

  private getMatchesForLine(editor: TextEditor, lineNum: number) {
    const line = editor.document.lineAt(lineNum);
    const result = [...line.text.matchAll(this.regex)].map(
      (match) =>
        new Range(
          lineNum,
          match.index!,
          lineNum,
          match.index! + match[0].length
        )
    );
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

export type NonWhitespaceSequenceModifier = (
  | ContainingScopeModifier
  | EveryScopeModifier
) & {
  scopeType: { type: "nonWhitespaceSequence" };
};

export class NonWhitespaceSequenceStage extends RegexStage {
  constructor(modifier: NonWhitespaceSequenceModifier) {
    super(modifier, /\S+/g, "Non whitespace sequence");
  }
}

// taken from https://regexr.com/3e6m0
const URL_REGEX =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

export type UrlModifier = (ContainingScopeModifier | EveryScopeModifier) & {
  scopeType: { type: "url" };
};

export class UrlStage extends RegexStage {
  constructor(modifier: UrlModifier) {
    super(modifier, URL_REGEX, "URL");
  }
}
