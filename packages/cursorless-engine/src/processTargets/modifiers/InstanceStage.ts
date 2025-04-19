import type {
  Direction,
  Modifier,
  OrdinalScopeModifier,
  RelativeScopeModifier,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { Range } from "@cursorless/common";
import { flatmap, ifilter, imap, itake } from "itertools";
import { escapeRegExp } from "lodash-es";
import type { StoredTargetMap } from "../..";
import type { Target } from "../../typings/target.types";
import { generateMatchesInRange } from "../../util/getMatchesInRange";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";
import { PlainTarget } from "../targets";
import { ContainingTokenIfUntypedEmptyStage } from "./ConditionalModifierStages";
import { OutOfRangeError } from "./listUtils";

export class InstanceStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private storedTargets: StoredTargetMap,
    private modifier: Modifier,
  ) {}

  run(inputTarget: Target, options: ModifierStateOptions): Target[] {
    // If the target is untyped and empty, we want to target the containing
    // token. This handles the case where they just say "instance" with an empty
    // selection, eg "take every instance".
    const target = new ContainingTokenIfUntypedEmptyStage(
      this.modifierStageFactory,
    ).run(inputTarget, options)[0];

    switch (this.modifier.type) {
      case "everyScope":
        return this.handleEveryScope(target, options);
      case "ordinalScope":
        return this.handleOrdinalScope(target, options, this.modifier);
      case "relativeScope":
        return this.handleRelativeScope(target, options, this.modifier);
      default:
        throw Error(`${this.modifier.type} instance scope not supported`);
    }
  }

  private handleEveryScope(
    target: Target,
    options: ModifierStateOptions,
  ): Target[] {
    return Array.from(
      flatmap(this.getEveryRanges(target), ([editor, searchRange]) =>
        this.getTargetIterable(target, options, editor, searchRange, "forward"),
      ),
    );
  }

  private handleOrdinalScope(
    target: Target,
    options: ModifierStateOptions,
    { start, length, scopeType }: OrdinalScopeModifier,
  ): Target[] {
    return this.getEveryRanges(target).flatMap(([editor, searchRange]) =>
      takeFromOffset(
        scopeType,
        this.getTargetIterable(
          target,
          options,
          editor,
          searchRange,
          start >= 0 ? "forward" : "backward",
        ),
        start >= 0 ? start : -(length + start),
        length,
      ),
    );
  }

  private handleRelativeScope(
    target: Target,
    options: ModifierStateOptions,
    { direction, offset, length, scopeType }: RelativeScopeModifier,
  ): Target[] {
    const referenceTargets = this.storedTargets.get("instanceReference") ?? [
      target,
    ];

    return referenceTargets.flatMap((referenceTarget) => {
      const { editor } = referenceTarget;
      const iterationRange =
        direction === "forward"
          ? new Range(
              offset === 0
                ? referenceTarget.contentRange.start
                : referenceTarget.contentRange.end,
              editor.document.range.end,
            )
          : new Range(
              editor.document.range.start,
              offset === 0
                ? referenceTarget.contentRange.end
                : referenceTarget.contentRange.start,
            );

      return takeFromOffset(
        scopeType,
        this.getTargetIterable(
          target,
          options,
          editor,
          iterationRange,
          direction,
        ),
        offset === 0 ? 0 : offset - 1,
        length,
      );
    });
  }

  private getEveryRanges({
    editor: targetEditor,
  }: Target): readonly (readonly [TextEditor, Range])[] {
    return (
      this.storedTargets
        .get("instanceReference")
        ?.map(({ editor, contentRange }) => [editor, contentRange] as const) ??
      ([[targetEditor, targetEditor.document.range]] as const)
    );
  }

  private getTargetIterable(
    target: Target,
    options: ModifierStateOptions,
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
          textualType: "character",
        }),
    );

    const filterScopeType = getFilterScopeType(target);

    if (filterScopeType != null) {
      // If the target is a line, token or word, we want to filter out any
      // instances of the text that are not also a line, token or word.  For
      // those that are, we want to return the target as a line, token or word
      // target.  For example, if the user says "take every instance air", we
      // won't return matches where we find the text of the "air" token as part
      // of a larger token.
      const containingScopeModifier = this.modifierStageFactory.create({
        type: "containingScope",
        scopeType: filterScopeType,
      });

      return ifilter(
        imap(iterable, (target) => {
          try {
            // Just try to expand to the containing scope. If it fails or is not
            // equal to the target, we know the match is not a line, token or
            // word.
            const containingScope = containingScopeModifier.run(
              target,
              options,
            );

            if (
              containingScope.length === 1 &&
              containingScope[0].contentRange.isRangeEqual(target.contentRange)
            ) {
              return containingScope[0];
            }

            return null;
          } catch (_err) {
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
  switch (target.textualType) {
    case "line":
    case "token":
    case "word":
      return { type: target.textualType };
    default:
      return null;
  }
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
  scopeType: ScopeType,
  iterable: Iterable<T>,
  offset: number,
  count: number,
): T[] {
  // Skip the first `offset` targets
  Array.from(itake(offset, iterable));

  // Take the next `length` targets
  const items = Array.from(itake(count, iterable));

  if (items.length < count) {
    throw new OutOfRangeError(scopeType, offset + count - 1);
  }

  return items;
}
