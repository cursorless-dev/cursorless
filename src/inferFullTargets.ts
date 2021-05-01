import { Selection } from "vscode";
import NavigationMap from "./NavigationMap";
import {
  ActionPreferences,
  CursorMark,
  InferenceContext,
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
  Transformation,
} from "./Types";

export function inferFullTargets(
  context: InferenceContext,
  targets: PartialTarget[],
  actionPreferences: ActionPreferences[]
): Target[] {
  if (targets.length === 0) {
    return [];
  }
  const firstTarget = inferSingleTarget(
    context,
    targets[0],
    null,
    actionPreferences[0]
  );
  return [firstTarget].concat(
    targets
      .slice(1)
      .map((target, index) =>
        inferSingleTarget(
          context,
          target,
          firstTarget,
          actionPreferences[index]
        )
      )
  );
}

export function inferSingleTarget(
  context: InferenceContext,
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
        context,
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
                context,
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
        context,
        target,
        topLevelPrototypes,
        actionPreferences
      );
  }
}

export function getPrimitivePosition(
  context: InferenceContext,
  inferredMark: Mark,
  inferredTransformation: Transformation,
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

  if (
    inferredMark.type === "cursor" &&
    context.selectionContents.some(
      (selectionValue) => selectionValue.length !== 0
    )
  ) {
    return "contents";
  }

  if (inferredTransformation.type !== "identity") {
    return "contents";
  }

  if (preferredPosition != null) {
    return preferredPosition;
  }

  return "contents";
}

export function getPrimitiveSelectionType(
  context: InferenceContext,
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

  if (context.isPaste) {
    return getContentSelectionType([context.clipboardContents!]);
  }

  if (inferredMark.type === "cursor") {
    return getContentSelectionType(context.selectionContents);
  }

  return "token";
}

export function getPrimitiveInsideOutsideType(
  prototypeTargets: Target[],
  preferredInsideOutsideType: InsideOutsideType | undefined
): InsideOutsideType {
  const prototypeInsideOutsideType = extractAttributeFromList(
    prototypeTargets,
    "insideOutsideType"
  );

  if (prototypeInsideOutsideType != null) {
    return prototypeInsideOutsideType;
  }

  if (preferredInsideOutsideType != null) {
    return preferredInsideOutsideType;
  }

  return null;
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

export function inferSinglePrimitiveTarget(
  context: InferenceContext,
  target: PartialPrimitiveTarget,
  prototypeTargets: Target[],
  actionPreferences: ActionPreferences
): PrimitiveTarget {
  const mark = target.mark ?? CURSOR_MARK;

  const selectionType =
    target.selectionType ??
    getPrimitiveSelectionType(context, mark, prototypeTargets);

  const transformation = target.transformation ??
    extractAttributeFromList(prototypeTargets, "transformation") ?? {
      type: "identity",
    };

  const position: Position =
    target.position ??
    getPrimitivePosition(
      context,
      mark,
      transformation,
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
    transformation,
    insideOutsideType,
  };
}

export function inferSingleNonListTarget(
  context: InferenceContext,
  target: PartialPrimitiveTarget | PartialRangeTarget,
  prototypeTargets: Target[],
  actionPreferences: ActionPreferences
): PrimitiveTarget | RangeTarget {
  switch (target.type) {
    case "primitive":
      return inferSinglePrimitiveTarget(
        context,
        target,
        prototypeTargets,
        actionPreferences
      );
    case "range":
      const start = inferRangeStartTarget(
        context,
        target.start,
        target.end,
        prototypeTargets,
        actionPreferences
      );
      return {
        type: "range",
        start,
        end: inferRangeEndTarget(
          context,
          target.end,
          start,
          prototypeTargets,
          actionPreferences
        ),
      };
  }
}

function inferRangeStartSelectionType(
  context: InferenceContext,
  endTarget: PartialPrimitiveTarget,
  prototypeTargets: Target[],
  inferredMark: Mark
): SelectionType {
  if (
    endTarget.position !== "before" &&
    endTarget.position !== "after" &&
    endTarget.selectionType != null
  ) {
    return endTarget.selectionType;
  }

  return getPrimitiveSelectionType(context, inferredMark, prototypeTargets);
}

function inferRangeStartTransformation(
  target: PartialPrimitiveTarget,
  endTarget: PartialPrimitiveTarget,
  prototypeTargets: Target[]
): Transformation {
  if (
    endTarget.position !== "before" &&
    endTarget.position !== "after" &&
    endTarget.transformation != null &&
    target.mark == null &&
    endTarget.transformation.type === "containingScope"
  ) {
    return endTarget.transformation;
  }

  return (
    extractAttributeFromList(prototypeTargets, "transformation") ?? {
      type: "identity",
    }
  );
}

function inferRangeEndTransformation(
  startTarget: PartialPrimitiveTarget,
  prototypeTargets: Target[]
): Transformation {
  if (
    startTarget.transformation != null &&
    startTarget.transformation.type === "containingScope"
  ) {
    return startTarget.transformation;
  }

  return (
    extractAttributeFromList(prototypeTargets, "transformation") ?? {
      type: "identity",
    }
  );
}

function inferRangeStartTarget(
  context: InferenceContext,
  target: PartialPrimitiveTarget,
  endTarget: PartialPrimitiveTarget,
  prototypeTargets: Target[],
  actionPreferences: ActionPreferences
): PrimitiveTarget {
  const mark = target.mark ?? CURSOR_MARK;

  const selectionType =
    target.selectionType ??
    inferRangeStartSelectionType(context, endTarget, prototypeTargets, mark);

  const position: Position = target.position ?? "contents";

  const transformation =
    target.transformation ??
    inferRangeStartTransformation(target, endTarget, prototypeTargets);

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
    transformation,
    insideOutsideType,
  };
}

export function inferRangeEndTarget(
  context: InferenceContext,
  target: PartialPrimitiveTarget,
  startTarget: PartialPrimitiveTarget,
  prototypeTargets: Target[],
  actionPreferences: ActionPreferences
): PrimitiveTarget {
  const prototypeTargetsIncludingStartTarget = ([
    startTarget,
  ] as Target[]).concat(prototypeTargets);

  const mark =
    target.mark ??
    extractAttributeFromList(prototypeTargetsIncludingStartTarget, "mark") ??
    CURSOR_MARK;

  const selectionType =
    target.selectionType ??
    getPrimitiveSelectionType(
      context,
      mark,
      prototypeTargetsIncludingStartTarget
    );

  // Note that we don't use prototypeTargetsIncludingStartTarget here because
  // we don't want to blindly inherit transformation from startTarget.  In
  // particular, we only want to inherit symbolType
  const transformation =
    target.transformation ??
    inferRangeEndTransformation(startTarget, prototypeTargets);

  const position: Position =
    target.position ??
    getPrimitivePosition(
      context,
      mark,
      transformation,
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
    transformation,
    insideOutsideType,
  };
}

function getContentSelectionType(contents: string[]): SelectionType {
  if (contents.every((string) => string.endsWith("\n"))) {
    if (contents.every((string) => string.startsWith("\n"))) {
      return "block";
    }
    return "line";
  }
  return "token";
}
