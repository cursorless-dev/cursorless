import { flow, flowRight, zip } from "lodash";
import { Position, Range } from "vscode";
import {
  PrimitiveTargetDescriptor,
  RangeTargetDescriptor,
  Target,
  TargetDescriptor,
} from "../typings/target.types";
import { ProcessedTargetsContext } from "../typings/Types";
import { ensureSingleEditor } from "../util/targetUtils";
import uniqDeep from "../util/uniqDeep";
import getMarkStage from "./getMarkStage";
import getModifierStage from "./getModifierStage";
import BaseTarget from "./targets/BaseTarget";
import WeakTarget from "./targets/WeakTarget";

/**
 * Converts the abstract target descriptions provided by the user to a concrete
 * representation usable by actions. Conceptually, the input will be something
 * like "the function call argument containing the cursor" and the output will be something
 * like "line 3, characters 5 through 10".
 * @param context Captures the environment needed to convert the abstract target
 *    description given by the user to a concrete representation usable by
 *    actions
 * @param targets The abstract target representations provided by the user
 * @returns A list of lists of typed selections, one list per input target. Each
 * typed selection includes the selection, as well the uri of the document
 * containing it, and potentially rich context information such as how to remove
 * the target
 */
export default function (
  context: ProcessedTargetsContext,
  targets: TargetDescriptor[]
): Target[][] {
  return targets.map((target) => uniqDeep(processTarget(context, target)));
}

function processTarget(
  context: ProcessedTargetsContext,
  target: TargetDescriptor
): Target[] {
  switch (target.type) {
    case "list":
      return target.elements.flatMap((element) =>
        processTarget(context, element)
      );
    case "range":
      return processRangeTarget(context, target);
    case "primitive":
      return processPrimitiveTarget(context, target);
  }
}

function processRangeTarget(
  context: ProcessedTargetsContext,
  targetDesc: RangeTargetDescriptor
): Target[] {
  const anchorTargets = processPrimitiveTarget(context, targetDesc.anchor);
  const activeTargets = processPrimitiveTarget(context, targetDesc.active);

  return zip(anchorTargets, activeTargets).flatMap(
    ([anchorTarget, activeTarget]) => {
      if (anchorTarget == null || activeTarget == null) {
        throw new Error("anchorTargets and activeTargets lengths don't match");
      }

      if (anchorTarget.editor !== activeTarget.editor) {
        throw new Error(
          "anchorTarget and activeTarget must be in same document"
        );
      }

      switch (targetDesc.rangeType) {
        case "continuous":
          return [
            processContinuousRangeTarget(
              anchorTarget,
              activeTarget,
              targetDesc.excludeAnchor,
              targetDesc.excludeActive
            ),
          ];
        case "vertical":
          return processVerticalRangeTarget(
            anchorTarget,
            activeTarget,
            targetDesc.excludeAnchor,
            targetDesc.excludeActive
          );
      }
    }
  );
}

function processContinuousRangeTarget(
  anchorTarget: Target,
  activeTarget: Target,
  excludeAnchor: boolean,
  excludeActive: boolean
): Target {
  const { document } = ensureSingleEditor([anchorTarget, activeTarget]);
  const isForward = calcIsForward(anchorTarget, activeTarget);
  const startTarget = isForward ? anchorTarget : activeTarget;
  const endTarget = isForward ? activeTarget : anchorTarget;
  const excludeStart = isForward ? excludeAnchor : excludeActive;
  const excludeEnd = isForward ? excludeActive : excludeAnchor;

  const contentStart = (() => {
    if (excludeStart) {
      if (startTarget.isLine) {
        return new Position(startTarget.contentRange.end.line + 1, 0);
      }
      return startTarget.contentRange.end;
    }
    return startTarget.contentRange.start;
  })();
  const contentEnd = (() => {
    if (excludeEnd) {
      if (endTarget.isLine) {
        return document.lineAt(endTarget.contentRange.start.line - 1).range.end;
      }
      return endTarget.contentRange.start;
    }
    return endTarget.contentRange.end;
  })();
  const contentRange = new Range(contentStart, contentEnd);

  const removalRange = (() => {
    if (startTarget.removalRange == null && endTarget.removalRange == null) {
      return undefined;
    }
    const startRange = startTarget.removalRange ?? startTarget.contentRange;
    const endRange = endTarget.removalRange ?? endTarget.contentRange;
    return new Range(
      excludeStart ? startRange.end : startRange.start,
      excludeEnd ? endRange.start : endRange.end
    );
  })();

  const leadingDelimiter = (() => {
    if (excludeStart) {
      if (startTarget.isLine) {
        return {
          range: new Range(contentRange.start, startTarget.contentRange.end),
        };
      }
      return startTarget.trailingDelimiter;
    }
    return startTarget.leadingDelimiter;
  })();
  const trailingDelimiter = (() => {
    if (excludeEnd) {
      if (endTarget.isLine) {
        return {
          range: new Range(
            contentRange.end,
            endTarget.leadingDelimiter!.range.end
          ),
          highlight: new Range(
            contentRange.end,
            endTarget.contentRange.start.translate({ lineDelta: -1 })
          ),
        };
      }
      return endTarget.leadingDelimiter;
    }
    return endTarget.trailingDelimiter;
  })();

  // If both objects are of the same type create a new object of the same
  const startConstructor = Object.getPrototypeOf(startTarget).constructor;
  const endConstructor = Object.getPrototypeOf(endTarget).constructor;
  const constructor =
    startConstructor === endConstructor ? startConstructor : BaseTarget;

  return new constructor({
    editor: activeTarget.editor,
    isReversed: !isForward,
    delimiter: anchorTarget.delimiter,
    contentRange,
    removalRange,
    leadingDelimiter,
    trailingDelimiter,
  });
}

export function targetsToContinuousTarget(
  anchorTarget: Target,
  activeTarget: Target
): Target {
  return processContinuousRangeTarget(anchorTarget, activeTarget, false, false);
}

function processVerticalRangeTarget(
  anchorTarget: Target,
  activeTarget: Target,
  excludeAnchor: boolean,
  excludeActive: boolean
): Target[] {
  const isForward = calcIsForward(anchorTarget, activeTarget);
  const delta = isForward ? 1 : -1;

  const anchorPosition = isForward
    ? anchorTarget.contentRange.end
    : anchorTarget.contentRange.start;
  const anchorLine = anchorPosition.line + (excludeAnchor ? delta : 0);
  const activePosition = isForward
    ? activeTarget.contentRange.end
    : activeTarget.contentRange.start;
  const activeLine = activePosition.line - (excludeActive ? delta : 0);

  const results: Target[] = [];
  for (let i = anchorLine; true; i += delta) {
    const contentRange = new Range(
      i,
      anchorTarget.contentRange.start.character,
      i,
      anchorTarget.contentRange.end.character
    );
    results.push(
      new WeakTarget({
        editor: anchorTarget.editor,
        isReversed: anchorTarget.isReversed,
        position: anchorTarget.position,
        contentRange,
      })
    );
    if (i === activeLine) {
      return results;
    }
  }
}

/**
 * This function implements the modifier pipeline that is at the core of Cursorless target processing.
 * It proceeds as follows:
 *
 * 1. It begins by getting the output from the {@link markStage} (eg "air", "this", etc).
 * This output is a list of zero or more targets.
 * 2. It then constructs a pipeline from the modifiers on the {@link targetDescriptor}
 * 3. It then runs each pipeline stage in turn, feeding the first stage with
 * the list of targets output from the {@link markStage}.  For each pipeline
 * stage, it passes the targets from the previous stage to the pipeline stage
 * one by one.  For each target, the stage will output a list of zero or more output
 * targets.  It then concatenates all of these lists into the list of targets
 * that will be passed to the next pipeline stage.
 *
 * @param context The context that captures the state of the environment used
 * by each stage to process its input targets
 * @param targetDescriptor The description of the target, consisting of a mark
 * and zero or more modifiers
 * @returns The output of running the modifier pipeline on the output from the mark
 */
function processPrimitiveTarget(
  context: ProcessedTargetsContext,
  targetDescriptor: PrimitiveTargetDescriptor
): Target[] {
  // First, get the targets output by the mark
  const markStage = getMarkStage(targetDescriptor.mark);
  const markOutputTargets = markStage.run(context);

  /**
   * The modifier pipeline that will be applied to construct our final targets
   */
  const modifierStages = [
    // Reverse target modifiers because they are returned in reverse order from
    // the api, to match the order in which they are spoken.  Slice is needed
    // to create a copy or the modifiers will be in wrong order in the test
    // recorder.
    ...targetDescriptor.modifiers.slice().reverse().map(getModifierStage),
    ...context.finalStages,
  ];

  /**
   * Intermediate variable to store the output of the current pipeline stage.
   * We initialise it to start with the outputs from the mark.
   */
  let currentTargets = markOutputTargets;

  // Then we apply each stage in sequence, letting each stage see the targets
  // one-by-one and concatenating the results before passing them on to the
  // next stage.
  modifierStages.forEach((stage) => {
    currentTargets = currentTargets.flatMap((target) =>
      stage.run(context, target)
    );
  });

  // Then return the output from the final stage
  return currentTargets;
}

function calcIsForward(anchor: Target, active: Target) {
  return anchor.contentRange.start.isBeforeOrEqual(active.contentRange.start);
}
