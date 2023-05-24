import {
  Direction,
  Modifier,
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
import { OutOfRangeError } from "./targetSequenceUtils";
import { ContainingTokenIfUntypedEmptyStage } from "./ConditionalModifierStages";

export default class InstanceStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private modifier: Modifier,
  ) {}

  run(inputTarget: Target): Target[] {
    const target = new ContainingTokenIfUntypedEmptyStage(
      this.modifierStageFactory,
    ).run(inputTarget)[0];

    switch (this.modifier.type) {
      case "relativeScope":
        return this.handleRelativeScope(target, this.modifier);
      case "everyScope":
        return this.handleEveryScope(target);
      default:
        throw Error(`${this.modifier.type} instance scope not supported`);
    }
  }

  private handleEveryScope(target: Target): Target[] {
    const { editor } = target;

    return Array.from(
      this.getTargetIterable(target, editor, editor.document.range, "forward"),
    );
  }

  private handleRelativeScope(
    target: Target,
    { direction, offset, length }: RelativeScopeModifier,
  ): Target[] {
    const { editor } = target;

    const iterable = this.getTargetIterable(
      target,
      editor,
      direction === "forward"
        ? new Range(target.contentRange.start, editor.document.range.end)
        : new Range(editor.document.range.start, target.contentRange.end),
      direction,
    );

    // Skip the first `offset` targets
    Array.from(itake(offset, iterable));

    // Take the next `length` targets
    const targets = Array.from(itake(length, iterable));

    if (targets.length < length) {
      throw new OutOfRangeError();
    }

    return targets;
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
