import { Position, Range, TextEditor } from "vscode";
import { NoContainingScopeError } from "../../../errors";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { TokenTarget } from "../../targets";

class RegexStageBase implements ModifierStage {
  constructor(
    private modifier: ContainingScopeModifier | EveryScopeModifier,
    protected regex: RegExp
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(target);
    }
    return [this.getSingleTarget(target)];
  }

  private getEveryTarget(target: Target): Target[] {
    const { contentRange, editor } = target;
    const start = target.hasExplicitRange
      ? contentRange.start
      : editor.document.lineAt(contentRange.start).range.start;
    const end = target.hasExplicitRange
      ? contentRange.end
      : editor.document.lineAt(contentRange.end).range.end;
    const targets: Target[] = [];

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
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return targets;
  }

  private getSingleTarget(target: Target): Target {
    const { editor } = target;
    const start = this.getMatchForPos(editor, target.contentRange.start).start;
    const end = this.getMatchForPos(editor, target.contentRange.end).end;
    const contentRange = new Range(start, end);
    return this.getTargetFromRange(target, contentRange);
  }

  private getTargetFromRange(target: Target, contentRange: Range): Target {
    return new TokenTarget({
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
      throw new NoContainingScopeError(this.modifier.scopeType.type);
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
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }
    return result;
  }
}

export class NonWhitespaceSequenceStage extends RegexStageBase {
  constructor(modifier: ContainingScopeModifier | EveryScopeModifier) {
    super(modifier, /\S+/g);
  }
}

// taken from https://regexr.com/3e6m0
const URL_REGEX =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

export class UrlStage extends RegexStageBase {
  constructor(modifier: ContainingScopeModifier | EveryScopeModifier) {
    super(modifier, URL_REGEX);
  }
}

export type CustomRegexModifier = (
  | ContainingScopeModifier
  | EveryScopeModifier
) & {
  scopeType: { type: "customRegex" };
};

export class CustomRegexStage extends RegexStageBase {
  constructor(modifier: CustomRegexModifier) {
    super(modifier, new RegExp(modifier.scopeType.regex, "g"));
  }
  run(context: ProcessedTargetsContext, target: Target): Target[] {
    try {
      return super.run(context, target);
    } catch (error) {
      console.error(`Couldn't find custom regex: ${this.regex}`);
      throw error;
    }
  }
}
