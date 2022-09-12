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

export class RegexStageBase implements ModifierStage {
  constructor(
    private modifier: ContainingScopeModifier | EveryScopeModifier,
    protected regex: RegExp,
    private textRange?: Range
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
    const textRange =
      this.textRange ??
      new Range(
        editor.document.lineAt(contentRange.start).range.start,
        editor.document.lineAt(contentRange.end).range.end
      );

    const targets = this.getMatchesForRange(editor, textRange)
      .filter(
        (contentRange) =>
          contentRange.end.isAfterOrEqual(start) &&
          contentRange.start.isBeforeOrEqual(end)
      )
      .map((contentRange) => this.getTargetFromRange(target, contentRange));

    if (targets.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return targets;
  }

  private getSingleTarget(target: Target): Target {
    const { editor, contentRange } = target;
    const start = this.getMatchForPos(editor, contentRange.start).start;
    const end = this.getMatchForPos(editor, contentRange.end).end;
    return this.getTargetFromRange(target, new Range(start, end));
  }

  private getTargetFromRange(target: Target, contentRange: Range): Target {
    return new TokenTarget({
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange,
    });
  }

  private getMatchForPos(editor: TextEditor, position: Position) {
    const textRange =
      this.textRange ?? editor.document.lineAt(position.line).range;
    const match = this.getMatchesForRange(editor, textRange).find(
      (contentRange) => contentRange.contains(position)
    );
    if (match == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }
    return match;
  }

  private getMatchesForRange(editor: TextEditor, range: Range) {
    const offset = editor.document.offsetAt(range.start);
    const text = editor.document.getText(range);
    const result = [...text.matchAll(this.regex)].map(
      (match) =>
        new Range(
          editor.document.positionAt(offset + match.index!),
          editor.document.positionAt(offset + match.index! + match[0].length)
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
      if (error instanceof NoContainingScopeError) {
        throw Error(`Couldn't find custom regex: ${this.regex}`);
      }
      throw error;
    }
  }
}
