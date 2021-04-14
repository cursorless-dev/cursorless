import { Selection } from "vscode";
import NavigationMap from "./NavigationMap";
import {
  CursorMark,
  InferenceContext,
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
  preferredPositions: (Position | null)[]
): Target[] {
  if (targets.length === 0) {
    return [];
  }
  const firstTarget = inferSingleTarget(
    context,
    targets[0],
    null,
    preferredPositions[0]
  );
  return [firstTarget].concat(
    targets
      .slice(1)
      .map((target, index) =>
        inferSingleTarget(
          context,
          target,
          firstTarget,
          preferredPositions[index]
        )
      )
  );
}

export function inferSingleTarget(
  context: InferenceContext,
  target: PartialTarget,
  prototypeTarget: Target | null,
  preferredPosition: Position | null
): Target {
  const topLevelPrototypes = prototypeTarget === null ? [] : [prototypeTarget];
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
        preferredPosition
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
                preferredPosition
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
        preferredPosition
      );
  }
}

export function getPrimitivePosition(
  context: InferenceContext,
  inferredMark: Mark,
  inferredTransformation: Transformation,
  prototypeTargets: Target[],
  preferredPosition: Position | null
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
  preferredPosition: Position | null,
  inheritMark = false
): PrimitiveTarget {
  const mark =
    target.mark ??
    (inheritMark ? extractAttributeFromList(prototypeTargets, "mark") : null) ??
    CURSOR_MARK;

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
      preferredPosition
    );

  return {
    type: target.type,
    mark,
    selectionType,
    position,
    transformation,
  };
}

export function inferSingleNonListTarget(
  context: InferenceContext,
  target: PartialPrimitiveTarget | PartialRangeTarget,
  prototypeTargets: Target[],
  preferredPosition: Position | null
): PrimitiveTarget | RangeTarget {
  switch (target.type) {
    case "primitive":
      return inferSinglePrimitiveTarget(
        context,
        target,
        prototypeTargets,
        preferredPosition
      );
    case "range":
      const start = inferRangeStartTarget(
        context,
        target.start,
        target.end,
        prototypeTargets
      );
      return {
        type: "range",
        start,
        end: inferSinglePrimitiveTarget(
          context,
          target.end,
          ([start] as Target[]).concat(prototypeTargets),
          null,
          true
        ),
      };
  }
}

function inferRangeStartSelectionType(
  context: InferenceContext,
  target: PartialPrimitiveTarget,
  endTarget: PartialPrimitiveTarget,
  prototypeTargets: Target[],
  inferredMark: Mark
): SelectionType {
  if (target.selectionType != null) {
    return target.selectionType;
  }

  if (
    endTarget.position !== "start" &&
    endTarget.position !== "end" &&
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
  if (target.transformation != null) {
    return target.transformation;
  }

  if (
    endTarget.position !== "start" &&
    endTarget.position !== "end" &&
    endTarget.transformation != null &&
    target.mark == null &&
    endTarget.transformation.type === "containingSymbolDefinition"
  ) {
    return endTarget.transformation;
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
  prototypeTargets: Target[]
): PrimitiveTarget {
  const mark = target.mark ?? CURSOR_MARK;

  const selectionType = inferRangeStartSelectionType(
    context,
    target,
    endTarget,
    prototypeTargets,
    mark
  );

  const position: Position = target.position ?? "contents";

  const transformation = inferRangeStartTransformation(
    target,
    endTarget,
    prototypeTargets
  );

  return {
    type: target.type,
    mark,
    selectionType,
    position,
    transformation,
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
