import {
  ActionPreferences,
  CursorMark,
  CursorMarkToken,
  InsideOutsideType,
  Mark,
  PartialPrimitiveTarget,
  PartialRangeTarget,
  PartialTarget,
  Position,
  PrimitiveTarget,
  RangeTarget,
  SelectionType,
  Target,
  Modifier,
} from "./Types";

export function inferFullTargets(
  targets: PartialTarget[],
  actionPreferences: ActionPreferences[]
): Target[] {
  if (targets.length === 0) {
    return [];
  }
  const firstTarget = inferSingleTarget(
    targets[0],
    null,
    actionPreferences[0]
  );
  return [firstTarget].concat(
    targets
      .slice(1)
      .map((target, index) =>
        inferSingleTarget(
          target,
          firstTarget,
          actionPreferences[index]
        )
      )
  );
}

export function inferSingleTarget(
  target: PartialTarget,
  prototypeTarget: Target | null,
  actionPreferences: ActionPreferences
): Target {
  const topLevelPrototypes = prototypeTarget == null ? [] : [prototypeTarget];
  switch (target.type) {
    case "list":
      if (target.elements.length === 0) {
        return {
          ...target,
          elements: [],
        };
      }
      const firstElement = inferSingleNonListTarget(
        target.elements[0],
        topLevelPrototypes,
        actionPreferences
      );
      return {
        ...target,
        elements: [firstElement].concat(
          target.elements
            .slice(1)
            .map((element) =>
              inferSingleNonListTarget(
                element,
                ([firstElement] as Target[]).concat(topLevelPrototypes),
                actionPreferences
              )
            )
        ),
      };
    case "primitive":
    case "range":
      return inferSingleNonListTarget(
        target,
        topLevelPrototypes,
        actionPreferences
      );
  }
}

export function getPrimitivePosition(
  inferredMark: Mark,
  inferredModifier: Modifier,
  prototypeTargets: Target[],
  preferredPosition: Position | undefined
): Position {
  const prototypePosition = extractAttributeFromList(
    prototypeTargets,
    "position"
  );

  if (prototypePosition != null) {
    return prototypePosition;
  }

  if (inferredModifier.type !== "identity") {
    return "contents";
  }

  if (preferredPosition != null) {
    return preferredPosition;
  }

  return "contents";
}

export function getPrimitiveSelectionType(
  inferredMark: Mark,
  prototypeTargets: Target[]
): SelectionType {
  const prototypeSelectionType = extractAttributeFromList(
    prototypeTargets,
    "selectionType"
  );

  if (prototypeSelectionType != null) {
    return prototypeSelectionType;
  }

  return "token";
}

export function getPrimitiveInsideOutsideType(
  prototypeTargets: Target[],
  preferredInsideOutsideType: InsideOutsideType
): InsideOutsideType {
  const prototypeInsideOutsideType = extractAttributeFromList(
    prototypeTargets,
    "insideOutsideType"
  );

  if (prototypeInsideOutsideType != null) {
    return prototypeInsideOutsideType;
  }

  return preferredInsideOutsideType;
}

function extractAttributeFromList<T extends keyof PrimitiveTarget>(
  targets: Target[],
  attributeName: T
): PrimitiveTarget[T] | null {
  return targets
    .map((target) => extractAttribute(target, attributeName))
    .filter((x) => x != null)[0];
}

function extractAttribute<T extends keyof PrimitiveTarget>(
  target: Target,
  attributeName: T
): PrimitiveTarget[T] | null {
  switch (target.type) {
    case "primitive":
      return target[attributeName];
    case "range":
      return target.start[attributeName];
    case "list":
      if (target.elements.length === 0) {
        return null;
      }
      return extractAttribute(target.elements[0], attributeName);
  }
}

const CURSOR_MARK: CursorMark = {
  type: "cursor",
};

const CURSOR_MARK_TOKEN: CursorMarkToken = {
  type: "cursorToken",
};

export function inferSinglePrimitiveTarget(
  target: PartialPrimitiveTarget,
  prototypeTargets: Target[],
  actionPreferences: ActionPreferences
): PrimitiveTarget {
  prototypeTargets = hasContent(target) ? [] : prototypeTargets;

  const mark =
    target.mark ??
    (target.selectionType === "token" ? CURSOR_MARK_TOKEN : CURSOR_MARK);

  const selectionType =
    target.selectionType ??
    getPrimitiveSelectionType(mark, prototypeTargets);

  const modifier = target.modifier ??
    extractAttributeFromList(prototypeTargets, "modifier") ?? {
      type: "identity",
    };

  const position: Position =
    target.position ??
    getPrimitivePosition(
      mark,
      modifier,
      prototypeTargets,
      actionPreferences.position
    );

  const insideOutsideType =
    target.insideOutsideType ??
    getPrimitiveInsideOutsideType(
      prototypeTargets,
      actionPreferences.insideOutsideType
    );

  return {
    type: target.type,
    mark,
    selectionType,
    position,
    modifier,
    insideOutsideType,
  };
}

export function inferSingleNonListTarget(
  target: PartialPrimitiveTarget | PartialRangeTarget,
  prototypeTargets: Target[],
  actionPreferences: ActionPreferences
): PrimitiveTarget | RangeTarget {
  switch (target.type) {
    case "primitive":
      return inferSinglePrimitiveTarget(
        target,
        prototypeTargets,
        actionPreferences
      );
    case "range":
      const start = inferRangeStartTarget(
        target.start,
        target.end,
        prototypeTargets,
        actionPreferences
      );
      return {
        type: "range",
        excludeStart: target.excludeStart ?? false,
        excludeEnd: target.excludeEnd ?? false,
        start,
        end: inferRangeEndTarget(
          target.end,
          start,
          prototypeTargets,
          actionPreferences
        ),
      };
  }
}

function inferRangeStartSelectionType(
  prototypeTargets: Target[],
  inferredMark: Mark
): SelectionType {
  return getPrimitiveSelectionType(inferredMark, prototypeTargets);
}

function inferRangeStartModifier(
  target: PartialPrimitiveTarget,
  prototypeTargets: Target[]
): Modifier {
  return (
    extractAttributeFromList(prototypeTargets, "modifier") ?? {
      type: "identity",
    }
  );
}

function inferRangeEndModifier(
  startTarget: PartialPrimitiveTarget,
  prototypeTargets: Target[]
): Modifier {
  if (
    startTarget.modifier != null &&
    startTarget.modifier.type === "containingScope"
  ) {
    return startTarget.modifier;
  }

  return (
    extractAttributeFromList(prototypeTargets, "modifier") ?? {
      type: "identity",
    }
  );
}

function inferRangeStartTarget(
  target: PartialPrimitiveTarget,
  endTarget: PartialPrimitiveTarget,
  prototypeTargets: Target[],
  actionPreferences: ActionPreferences
): PrimitiveTarget {
  const mark = target.mark ?? CURSOR_MARK;
  prototypeTargets = hasContent(target) ? [] : prototypeTargets;

  const selectionType =
    target.selectionType ??
    inferRangeStartSelectionType(prototypeTargets, mark);

  const position: Position = target.position ?? "contents";

  const modifier =
    target.modifier ?? inferRangeStartModifier(target, prototypeTargets);

  const insideOutsideType =
    target.insideOutsideType ??
    getPrimitiveInsideOutsideType(
      prototypeTargets,
      actionPreferences.insideOutsideType
    );

  return {
    type: target.type,
    mark,
    selectionType,
    position,
    modifier,
    insideOutsideType,
  };
}

export function inferRangeEndTarget(
  target: PartialPrimitiveTarget,
  startTarget: PrimitiveTarget,
  prototypeTargets: Target[],
  actionPreferences: ActionPreferences
): PrimitiveTarget {
  const possiblePrototypeTargetsIncludingStartTarget = (
    [startTarget] as Target[]
  ).concat(prototypeTargets);
  const prototypeTargetsIncludingStartTarget = hasContent(target)
    ? []
    : possiblePrototypeTargetsIncludingStartTarget;

  const mark =
    target.mark ??
    extractAttributeFromList(
      possiblePrototypeTargetsIncludingStartTarget,
      "mark"
    ) ??
    CURSOR_MARK;

  const selectionType =
    target.selectionType ??
    getPrimitiveSelectionType(
      mark,
      prototypeTargetsIncludingStartTarget
    );

  // Note that we don't use prototypeTargetsIncludingStartTarget here because
  // we don't want to blindly inherit modifier from startTarget.  In
  // particular, we only want to inherit symbolType
  const modifier =
    target.modifier ?? inferRangeEndModifier(startTarget, prototypeTargets);

  const position: Position =
    target.position ??
    getPrimitivePosition(
      mark,
      modifier,
      prototypeTargets,
      actionPreferences.position
    );

  const insideOutsideType =
    target.insideOutsideType ??
    getPrimitiveInsideOutsideType(
      prototypeTargets,
      actionPreferences.insideOutsideType
    );

  return {
    type: target.type,
    mark,
    selectionType,
    position,
    modifier,
    insideOutsideType,
  };
}

// function getContentSelectionType(contents: string[]): SelectionType {
//   if (contents.every((string) => string.endsWith("\n"))) {
//     if (contents.every((string) => string.startsWith("\n"))) {
//       return "paragraph";
//     }
//     return "line";
//   }
//   return "token";
// }

/**
 * Determine whether the target has content, so that we shouldn't do inference
 * @param target The target to inspect
 * @returns A boolean indicating whether the target has content
 */
function hasContent(target: PartialPrimitiveTarget) {
  return (
    target.selectionType != null ||
    target.modifier != null ||
    target.insideOutsideType != null
  );
}
