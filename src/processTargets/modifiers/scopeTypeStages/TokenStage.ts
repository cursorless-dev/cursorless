import { Range, TextEditor } from "vscode";
import { Target } from "../../../typings/target.types";
import {
  ContainingScopeModifier,
  EveryScopeModifier,
} from "../../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../../typings/Types";
import { getTokensInRange, PartialToken } from "../../../util/getTokensInRange";
import { ModifierStage } from "../../PipelineStages.types";
import { TokenTarget } from "../../targets";

export default class implements ModifierStage {
  constructor(private modifier: ContainingScopeModifier | EveryScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): TokenTarget[] {
    if (this.modifier.type === "everyScope") {
      return this.getEveryTarget(context, target);
    }
    return [this.getSingleTarget(target)];
  }

  private getEveryTarget(
    context: ProcessedTargetsContext,
    target: Target
  ): TokenTarget[] {
    const { contentRange, editor } = target;
    const start = target.hasExplicitRange
      ? contentRange.start
      : editor.document.lineAt(contentRange.start).range.start;
    const end = target.hasExplicitRange
      ? contentRange.end
      : editor.document.lineAt(contentRange.end).range.end;
    const range = new Range(start, end);

    const targets = getTokensInRange(editor, range).map(({ range }) =>
      this.getTargetFromRange(target, range)
    );

    if (targets.length === 0) {
      throw new Error(
        `Couldn't find containing ${this.modifier.scopeType.type}`
      );
    }

    return targets;
  }

  private getSingleTarget(target: Target): TokenTarget {
    return this.getTargetFromRange(target, target.contentRange);
  }

  private getTargetFromRange(target: Target, range: Range): TokenTarget {
    const contentRange = getTokenRangeForSelection(target.editor, range);
    return new TokenTarget({
      editor: target.editor,
      isReversed: target.isReversed,
      contentRange,
    });
  }
}

/**
 * Given a selection returns a new range which contains the tokens
 * intersecting the given selection. Uses heuristics to tie break when the
 * given selection is empty and abuts 2 adjacent tokens
 * @param selection Selection to operate on
 * @returns Modified range
 */
export function getTokenRangeForSelection(
  editor: TextEditor,
  range: Range
): Range {
  let tokens = getTokenIntersectionsForSelection(editor, range);
  // Use single token for overlapping or adjacent range
  if (range.isEmpty) {
    // If multiple matches sort and take the first
    tokens.sort(({ token: a }, { token: b }) => {
      // First sort on alphanumeric
      const aIsAlphaNum = isAlphaNum(a.text);
      const bIsAlphaNum = isAlphaNum(b.text);
      if (aIsAlphaNum && !bIsAlphaNum) {
        return -1;
      }
      if (bIsAlphaNum && !aIsAlphaNum) {
        return 1;
      }
      // Second sort on length
      const lengthDiff = b.text.length - a.text.length;
      if (lengthDiff !== 0) {
        return lengthDiff;
      }
      // Lastly sort on start position. ie leftmost
      return a.offsets.start - b.offsets.start;
    });
    tokens = tokens.slice(0, 1);
  }
  // Use tokens for overlapping ranges
  else {
    tokens = tokens.filter((token) => !token.intersection.isEmpty);
    tokens.sort((a, b) => a.token.offsets.start - b.token.offsets.start);
  }
  if (tokens.length < 1) {
    throw new Error("Couldn't find token in selection");
  }
  const start = tokens[0].token.range.start;
  const end = tokens[tokens.length - 1].token.range.end;
  return new Range(start, end);
}

/**
 * Returns tokens that intersect with the selection that may be relevant for
 * expanding the selection to its containing token.
 * @param selection The selection
 * @returns All tokens that intersect with the selection and are on the same line as the start or endpoint of the selection
 */
export function getTokenIntersectionsForSelection(
  editor: TextEditor,
  range: Range
) {
  const tokens = getRelevantTokens(editor, range);

  const tokenIntersections: { token: PartialToken; intersection: Range }[] = [];

  tokens.forEach((token) => {
    const intersection = token.range.intersection(range);
    if (intersection != null) {
      tokenIntersections.push({ token, intersection });
    }
  });

  return tokenIntersections;
}

/**
 * Given a selection, finds all tokens that we might use to expand the
 * selection.  Just looks at tokens on the same line as the start and end of the
 * selection, because we assume that a token cannot span multiple lines.
 * @param selection The selection we care about
 * @returns A list of tokens that we might expand to
 */
function getRelevantTokens(editor: TextEditor, range: Range) {
  const startLine = range.start.line;
  const endLine = range.end.line;

  const tokens = getTokensInRange(
    editor,
    editor.document.lineAt(startLine).range
  );

  if (endLine !== startLine) {
    tokens.push(
      ...getTokensInRange(editor, editor.document.lineAt(endLine).range)
    );
  }

  return tokens;
}

function isAlphaNum(text: string) {
  return /^\w+$/.test(text);
}
