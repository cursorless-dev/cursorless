import type { TextEditor, TextLine } from "@cursorless/common";
import { Range, type SurroundingPairScopeType } from "@cursorless/common";
import type { Target } from "../../../typings/target.types";
import type { ModifierStageFactory } from "../../ModifierStageFactory";
import { PlainTarget } from "../../targets";
import { fitRangeToLineContent } from "../scopeHandlers";

/**
 * Get the iteration scope range for item scope.
 * Try to find non-string surrounding scope with a fallback to line content.
 * @param context The stage process context
 * @param target The stage target
 * @returns The stage iteration scope and optional surrounding pair boundaries
 */
export function getIterationScope(
  modifierStageFactory: ModifierStageFactory,
  target: Target,
): { range: Range; boundary?: [Range, Range] } {
  let surroundingTarget = getBoundarySurroundingPair(
    modifierStageFactory,
    target,
  );

  // Iteration is necessary in case of in valid surrounding targets (nested strings, content range adjacent to delimiter)
  while (surroundingTarget != null) {
    if (
      useInteriorOfSurroundingTarget(
        modifierStageFactory,
        target,
        surroundingTarget,
      )
    ) {
      return {
        range: surroundingTarget.getInterior()![0].contentRange,
        boundary: getBoundary(surroundingTarget),
      };
    }

    surroundingTarget = getParentSurroundingPair(
      modifierStageFactory,
      target.editor,
      surroundingTarget,
    );
  }

  // We have not found a surrounding pair. Use the line.
  return {
    range: fitRangeToLineContent(target.editor, target.contentRange),
  };
}

function useInteriorOfSurroundingTarget(
  modifierStageFactory: ModifierStageFactory,
  target: Target,
  surroundingTarget: Target,
): boolean {
  const { contentRange } = target;

  if (contentRange.isEmpty) {
    const [left, right] = getBoundary(surroundingTarget);
    const pos = contentRange.start;
    // Content range is outside adjacent to pair
    if (pos.isEqual(left.start) || pos.isEqual(right.end)) {
      return false;
    }
    const line = target.editor.document.lineAt(pos);
    // Content range is just inside of opening/left delimiter
    if (
      pos.isEqual(left.end) &&
      characterIsWhitespaceOrMissing(line, pos.character)
    ) {
      return false;
    }
    // Content range is just inside of closing/right delimiter
    if (
      pos.isEqual(right.start) &&
      characterIsWhitespaceOrMissing(line, pos.character - 1)
    ) {
      return false;
    }
  } else {
    // Content range is equal to surrounding range
    if (contentRange.isRangeEqual(surroundingTarget.contentRange)) {
      return false;
    }

    // Content range is equal to one of the boundaries of the surrounding range
    const [left, right] = getBoundary(surroundingTarget);
    if (contentRange.isRangeEqual(left) || contentRange.isRangeEqual(right)) {
      return false;
    }
  }

  // We don't look for items inside strings.
  // A non-string surrounding pair that is inside a surrounding string is fine.
  const surroundingStringTarget = getStringSurroundingPair(
    modifierStageFactory,
    surroundingTarget,
  );
  if (
    surroundingStringTarget != null &&
    surroundingTarget.contentRange.start.isBeforeOrEqual(
      surroundingStringTarget.contentRange.start,
    )
  ) {
    return false;
  }

  return true;
}

function getBoundary(surroundingTarget: Target): [Range, Range] {
  return surroundingTarget.getBoundary()!.map((t) => t.contentRange) as [
    Range,
    Range,
  ];
}

function characterIsWhitespaceOrMissing(
  line: TextLine,
  index: number,
): boolean {
  return (
    index < line.range.start.character ||
    index >= line.range.end.character ||
    line.text[index].trim() === ""
  );
}

function getParentSurroundingPair(
  modifierStageFactory: ModifierStageFactory,
  editor: TextEditor,
  target: Target,
) {
  const startOffset = editor.document.offsetAt(target.contentRange.start);
  // Can't have a parent; already at start of document
  if (startOffset === 0) {
    return undefined;
  }
  // Step out of this pair and see if we have a parent
  const position = editor.document.positionAt(startOffset - 1);
  return getBoundarySurroundingPair(
    modifierStageFactory,
    new PlainTarget({
      editor,
      contentRange: new Range(position, position),
      isReversed: false,
    }),
  );
}

function getBoundarySurroundingPair(
  modifierStageFactory: ModifierStageFactory,
  target: Target,
): Target | undefined {
  return getSurroundingPair(modifierStageFactory, target, {
    type: "surroundingPair",
    delimiter: "collectionBoundary",
    requireStrongContainment: true,
  });
}

function getStringSurroundingPair(
  modifierStageFactory: ModifierStageFactory,
  target: Target,
): Target | undefined {
  return getSurroundingPair(modifierStageFactory, target, {
    type: "surroundingPair",
    delimiter: "string",
    requireStrongContainment: true,
  });
}

function getSurroundingPair(
  modifierStageFactory: ModifierStageFactory,
  target: Target,
  scopeType: SurroundingPairScopeType,
): Target | undefined {
  const pairStage = modifierStageFactory.create({
    type: "containingScope",
    scopeType,
  });
  const targets = (() => {
    try {
      return pairStage.run(target);
    } catch (_error) {
      return [];
    }
  })();
  if (targets.length > 1) {
    throw Error("Expected only one surrounding pair target");
  }
  return targets[0];
}
