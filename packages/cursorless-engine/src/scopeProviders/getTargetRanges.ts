import {
  NoContainingScopeError,
  TargetRanges,
  toCharacterRange,
  toLineRange,
} from "@cursorless/common";
import { Target } from "../typings/target.types";

export async function getTargetRanges(target: Target): Promise<TargetRanges> {
  const interior = await (async () => {
    try {
      const targets = await Promise.all(
        (await target.getInteriorStrict()).map(getTargetRanges),
      );
      return targets;
    } catch (error) {
      if (error instanceof NoContainingScopeError) {
        return undefined;
      }
      throw error;
    }
  })();

  const boundary = await (async () => {
    try {
      const targets = await Promise.all(
        target.getBoundaryStrict().map(getTargetRanges),
      );
      return targets;
    } catch (error) {
      if (error instanceof NoContainingScopeError) {
        return undefined;
      }
      throw error;
    }
  })();

  return {
    contentRange: target.contentRange,
    removalRange: await target.getRemovalRange(),
    removalHighlightRange: target.isLine
      ? toLineRange(await target.getRemovalHighlightRange())
      : toCharacterRange(await target.getRemovalHighlightRange()),
    leadingDelimiter: await getOptionalTarget(
      target.getLeadingDelimiterTarget(),
    ),
    trailingDelimiter: await getOptionalTarget(
      target.getTrailingDelimiterTarget(),
    ),
    interior,
    boundary,
    insertionDelimiter: target.insertionDelimiter,
  };
}

function getOptionalTarget(target: Target | undefined) {
  return target != null ? getTargetRanges(target) : undefined;
}
