import {
  Direction,
  Modifier,
  OrdinalScopeModifier,
  Range,
  RelativeScopeModifier,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { ifilter, imap, itake } from "itertools";
import { escapeRegExp } from "lodash";
import type { Target } from "../../typings/target.types";
import { generateMatchesInRange } from "../../util/getMatchesInRange";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { PlainTarget } from "../targets";
import { ContainingTokenIfUntypedEmptyStage } from "./ConditionalModifierStages";
import { OutOfRangeError } from "./targetSequenceUtils";

export default class InstanceStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: Modifier,
  ) {}

  run(inputTarget: Target): Target[] {
    // If the target is untyped and empty, we want to target the containing
    // token. This handles the case where they just say "instance" with an empty
    // selection, eg "take every instance".
    const target = new ContainingTokenIfUntypedEmptyStage(
      this.modifierStageFactory,
    ).run(inputTarget)[0];

    switch (this.modifier.type) {
      case "everyScope":
        return this.handleEveryScope(target);
      case "ordinalScope":
        return this.handleOrdinalScope(target, this.modifier);
      case "relativeScope":
        return this.handleRelativeScope(target, this.modifier);
      default:
        throw Error(`${this.modifier.type} instance scope not supported`);
    }
  }

  private handleEveryScope(target: Target): Target[] {
    const { editor } = target;

    return Array.from(
      this.getTargetIterable(
        target,
        editor,
        this.getEveryRange(editor),
        "forward",
      ),
    );
  }

  private handleOrdinalScope(
    target: Target,
    { start, length }: OrdinalScopeModifier,
  ): Target[] {
    const { editor } = target;

    return takeFromOffset(
      this.getTargetIterable(
        target,
        editor,
        this.getEveryRange(editor),
        start >= 0 ? "forward" : "backward",
      ),
      start >= 0 ? start : -(length + start),
      length,
    );
  }

  private handleRelativeScope(
    target: Target,
    { direction, offset, length }: RelativeScopeModifier,
  ): Target[] {
    const { editor } = target;

    const iterationRange =
      direction === "forward"
        ? new Range(target.contentRange.start, editor.document.range.end)
        : new Range(editor.document.range.start, target.contentRange.end);

    return takeFromOffset(
      this.getTargetIterable(target, editor, iterationRange, direction),
      offset,
      length,
    );
  }

  private getEveryRange(editor: TextEditor): Range {
    return editor.document.range;
  }

  private getTargetIterable(
    target: Target,
    editor: TextEditor,
    searchRange: Range,
    direction: Direction,
  ): Iterable<Target> {
    const iterable = imap(
      generateMatchesInRange(
        new RegExp(escapeRegExp(target.contentText), "g"),
        editor,
        searchRange,
        direction,
      ),
      (range) =>
        new PlainTarget({
          contentRange: range,
          editor,
          isReversed: false,
          isToken: false,
        }),
    );

    const filterScopeType = getFilterScopeType(target);

    if (filterScopeType != null) {
      const containingScopeModifier = this.modifierStageFactory.create({
        type: "containingScope",
        scopeType: filterScopeType,
      });

      return ifilter(
        imap(iterable, (target) => {
          try {
            const containingScope = containingScopeModifier.run(target);

            if (
              containingScope.length === 1 &&
              containingScope[0].contentRange.isRangeEqual(target.contentRange)
            ) {
              return containingScope[0];
            }

            return null;
          } catch (err) {
            return null;
          }
        }),
        (target): target is Target => target != null,
      ) as Iterable<Target>;
    }

    return iterable;
  }
}

function getFilterScopeType(target: Target): ScopeType | null {
  if (target.isLine) {
    return { type: "line" };
  }

  if (target.isToken) {
    return { type: "token" };
  }

  return null;
}

/**
 * Take `length` items from `iterable` starting at `offset`, throwing an error
 * if there are not enough items.
 *
 * @param iterable The iterable to take from
 * @param offset How many items to skip
 * @param count How many items to take
 * @returns An array of length `length` containing the items from `iterable`
 * starting at `offset`
 */
function takeFromOffset<T>(
  iterable: Iterable<T>,
  offset: number,
  count: number,
): T[] {
  // Skip the first `offset` targets
  Array.from(itake(offset, iterable));

  // Take the next `length` targets
  const items = Array.from(itake(count, iterable));

  if (items.length < count) {
    throw new OutOfRangeError();
  }

  return items;
}
