import {
  NoContainingScopeError,
  Position,
  Range,
  TextEditor,
} from "@cursorless/common";
import { ContainingScopeModifier, EveryScopeModifier } from "@cursorless/common";
import { Target } from "../../../typings/target.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { ModifierStage } from "../../PipelineStages.types";
import { TokenTarget } from "../../targets";

class RegexStageBase implements ModifierStage {
  constructor(
    private modifier: ContainingScopeModifier | EveryScopeModifier,
    protected regex: RegExp,
  ) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(target);
    }
    return [this.getSingleTarget(target)];
  }

  private getEveryTarget(target: Target): Target[] {
    const { editor, contentRange } = target;

    const searchRange = new Range(
      this.expandRangeForSearch(target.editor, contentRange.start).start,
      this.expandRangeForSearch(target.editor, contentRange.end).end,
    );

    const matches = this.getMatchesInRange(editor, searchRange);
    const targets = (
      target.hasExplicitRange
        ? matches.filter((match) => match.intersection(contentRange) != null)
        : matches
    ).map((contentRange) =>
      this.rangeToTarget(target.isReversed, target.editor, contentRange),
    );

    if (targets.length === 0) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }

    return targets;
  }

  private getSingleTarget(target: Target): Target {
    const { editor, isReversed, contentRange } = target;

    return this.rangeToTarget(
      isReversed,
      editor,
      this.getMatchContainingPosition(editor, contentRange.start).union(
        this.getMatchContainingPosition(editor, contentRange.end),
      ),
    );
  }

  private getMatchContainingPosition(editor: TextEditor, position: Position): Range {
    const textRange = this.expandRangeForSearch(editor, position);
    const match = this.getMatchesInRange(editor, textRange).find((contentRange) =>
      contentRange.contains(position),
    );
    if (match == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }
    return match;
  }

  /**
   * Constructs a range from {@link position} within which to search for
   * instances of {@link regex}.  By default we expand to containing line, as
   * all our regexes today operate within a line, but deriving modifier stages
   * can override this to properly handle multiline regexes.
   * @param editor The editor containing {@link position}
   * @param position The position from which to expand for searching
   * @returns A range within which to search for instances of {@link regex}
   */
  protected expandRangeForSearch(editor: TextEditor, position: Position): Range {
    return editor.document.lineAt(position.line).range;
  }

  private getMatchesInRange(editor: TextEditor, range: Range): Range[] {
    const offset = editor.document.offsetAt(range.start);
    const text = editor.document.getText(range);
    const result = [...text.matchAll(this.regex)].map(
      (match) =>
        new Range(
          editor.document.positionAt(offset + match.index!),
          editor.document.positionAt(offset + match.index! + match[0].length),
        ),
    );
    if (result == null) {
      throw new NoContainingScopeError(this.modifier.scopeType.type);
    }
    return result;
  }

  private rangeToTarget(
    isReversed: boolean,
    editor: TextEditor,
    contentRange: Range,
  ): Target {
    return new TokenTarget({
      editor,
      isReversed,
      contentRange,
    });
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

export type CustomRegexModifier = (ContainingScopeModifier | EveryScopeModifier) & {
  scopeType: { type: "customRegex" };
};

export class CustomRegexStage extends RegexStageBase {
  constructor(modifier: CustomRegexModifier) {
    super(modifier, new RegExp(modifier.scopeType.regex, "gu"));
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
