import {
  ActionDescriptor,
  CommandComplete,
  DestinationDescriptor,
  InsertionMode,
  LineNumberMark,
  Modifier,
  PartialMark,
  PartialPrimitiveTargetDescriptor,
  PartialRangeType,
  PartialTargetDescriptor,
  RelativeScopeModifier,
  ScopeType,
} from "@cursorless/common";
import { RecursiveArray, flattenDeep } from "lodash";
import { NoSpokenFormError } from "./NoSpokenFormError";
import { actions } from "./defaultSpokenForms/actions";
import { characterToSpokenForm } from "./defaultSpokenForms/characters";
import { connectives } from "./defaultSpokenForms/connectives";
import {
  hatColorToSpokenForm,
  hatShapeToSpokenForm,
  marks,
  lineDirections,
} from "./defaultSpokenForms/marks";
import {
  surroundingPairDelimitersToSpokenForm,
  modifiers,
  modifiersExtra,
  surroundingPairNameToSpokenForm,
  surroundingPairForceDirections,
  scopeSpokenForms,
} from "./defaultSpokenForms/modifiers";
import {
  insertionSnippetToSpokenForm,
  wrapperSnippetToSpokenForm,
} from "./defaultSpokenForms/snippets";
import {
  numberToSpokenForm,
  ordinalToSpokenForm,
} from "./defaultSpokenForms/numbers";

export interface SpokenFormSuccess {
  type: "success";
  value: string;
}

export interface SpokenFormError {
  type: "error";
  reason: string;
}

export type SpokenForm = SpokenFormSuccess | SpokenFormError;

/**
 * Given a command, generates its spoken form.
 * @param command The command to generate a spoken form for
 * @returns The spoken form of the command, or null if the command has no spoken
 * form
 */
export function generateSpokenForm(command: CommandComplete): SpokenForm {
  try {
    const components = generateSpokenFormComponents(command.action);
    return { type: "success", value: flattenDeep(components).join(" ") };
  } catch (e) {
    if (e instanceof NoSpokenFormError) {
      return { type: "error", reason: e.reason };
    }

    throw e;
  }
}

function generateSpokenFormComponents(
  action: ActionDescriptor,
): RecursiveArray<string> {
  switch (action.name) {
    case "editNew":
    case "getText":
    case "replace":
    case "executeCommand":
      throw new NoSpokenFormError(`Action '${action.name}'`);

    case "replaceWithTarget":
    case "moveToTarget":
      return [
        actions[action.name],
        targetToSpokenForm(action.source),
        destinationToSpokenForm(action.destination),
      ];

    case "swapTargets":
      return [
        actions[action.name],
        targetToSpokenForm(action.target1),
        connectives.swapConnective,
        targetToSpokenForm(action.target2),
      ];

    case "callAsFunction":
      if (action.argument != null) {
        throw new NoSpokenFormError(`Action '${action.name}' with argument`);
      }
      return [
        actions[action.name],
        targetToSpokenForm(action.callee),
        // targetToSpokenForm(action.argument),
      ];

    case "wrapWithPairedDelimiter":
    case "rewrapWithPairedDelimiter":
      return [
        surroundingPairDelimitersToSpokenForm(action.left, action.right),
        actions[action.name],
        targetToSpokenForm(action.target),
      ];

    case "pasteFromClipboard":
      return [
        actions[action.name],
        destinationToSpokenForm(action.destination),
      ];

    case "insertSnippet":
      return [
        actions[action.name],
        insertionSnippetToSpokenForm(action.snippetDescription),
        destinationToSpokenForm(action.destination),
      ];

    case "generateSnippet":
      if (action.snippetName != null) {
        throw new NoSpokenFormError(`${action.name}.snippetName`);
      }
      return [actions[action.name], targetToSpokenForm(action.target)];

    case "wrapWithSnippet":
      return [
        wrapperSnippetToSpokenForm(action.snippetDescription),
        actions[action.name],
        targetToSpokenForm(action.target),
      ];

    case "highlight": {
      if (action.highlightId != null) {
        throw new NoSpokenFormError(`${action.name}.highlightId`);
      }
      return [actions[action.name], targetToSpokenForm(action.target)];
    }

    default: {
      return [actions[action.name], targetToSpokenForm(action.target)];
    }
  }
}

function targetToSpokenForm(
  target: PartialTargetDescriptor,
): RecursiveArray<string> {
  switch (target.type) {
    case "list":
      if (target.elements.length < 2) {
        throw new NoSpokenFormError("List target with < 2 elements");
      }

      return target.elements.map((element, i) =>
        i === 0
          ? targetToSpokenForm(element)
          : [connectives.listConnective, targetToSpokenForm(element)],
      );

    case "range": {
      const anchor = targetToSpokenForm(target.anchor);
      const active = targetToSpokenForm(target.active);
      const connective = getRangeConnective(
        target.excludeAnchor,
        target.excludeActive,
        target.rangeType,
      );
      return [anchor, connective, active];
    }

    case "primitive":
      return primitiveTargetToSpokenForm(target);

    case "implicit":
      return [];
  }
}

function destinationToSpokenForm(
  destination: DestinationDescriptor,
): RecursiveArray<string> {
  switch (destination.type) {
    case "list":
      if (destination.destinations.length < 2) {
        throw new NoSpokenFormError("List destination with < 2 elements");
      }

      return destination.destinations.map((destination, i) =>
        i === 0
          ? destinationToSpokenForm(destination)
          : [connectives.listConnective, destinationToSpokenForm(destination)],
      );

    case "primitive":
      return [
        insertionModeToSpokenForm(destination.insertionMode),
        targetToSpokenForm(destination.target),
      ];

    case "implicit":
      return [];
  }
}

function getRangeConnective(
  excludeAnchor: boolean,
  excludeActive: boolean,
  type?: PartialRangeType,
): string {
  const prefix = type === "vertical" ? `${connectives.verticalRange} ` : "";
  if (excludeAnchor && excludeActive) {
    return prefix + connectives.rangeExclusive;
  }
  if (excludeAnchor) {
    throw new NoSpokenFormError("Range exclude anchor");
  }
  if (excludeActive) {
    return prefix + connectives.rangeExcludingEnd;
  }
  if (type === "vertical") {
    // "slice", but could have been "slice past"
    return connectives.verticalRange;
  }
  return connectives.rangeInclusive;
}

function insertionModeToSpokenForm(insertionMode: InsertionMode): string {
  switch (insertionMode) {
    case "to":
      return connectives.sourceDestinationConnective;
    case "before":
      return connectives.before;
    case "after":
      return connectives.after;
  }
}

function primitiveTargetToSpokenForm(
  target: PartialPrimitiveTargetDescriptor,
): RecursiveArray<string> {
  const components: RecursiveArray<string> = [];
  if (target.modifiers != null) {
    components.push(target.modifiers.map(modifierToSpokenForm));
  }
  if (target.mark != null) {
    components.push(markToSpokenForm(target.mark));
  }
  return components;
}

function modifierToSpokenForm(modifier: Modifier): RecursiveArray<string> {
  switch (modifier.type) {
    case "cascading":
    case "modifyIfUntyped":
      throw new NoSpokenFormError(`Modifier '${modifier.type}'`);

    case "containingScope":
      return [scopeTypeToSpokenForm(modifier.scopeType)];

    case "everyScope":
      return [modifiers.everyScope, scopeTypeToSpokenForm(modifier.scopeType)];

    case "extendThroughStartOf":
    case "extendThroughEndOf": {
      const type = modifiers[modifier.type];
      return modifier.modifiers != null
        ? [type, modifier.modifiers.map(modifierToSpokenForm)]
        : [type];
    }

    case "relativeScope":
      return modifier.offset === 0
        ? relativeScopeInclusiveToSpokenForm(modifier)
        : relativeScopeExclusiveToSpokenForm(modifier);

    case "ordinalScope": {
      const scope = scopeTypeToSpokenForm(modifier.scopeType);

      if (modifier.length === 1) {
        if (modifier.start === -1) {
          return [modifiersExtra.last, scope];
        }
        if (modifier.start === 0) {
          return [modifiersExtra.first, scope];
        }
        if (modifier.start < 0) {
          return [
            ordinalToSpokenForm(Math.abs(modifier.start)),
            modifiersExtra.last,
            scope,
          ];
        }
        return [ordinalToSpokenForm(modifier.start + 1), scope];
      }

      const number = numberToSpokenForm(modifier.length);

      if (modifier.start === 0) {
        return [modifiersExtra.first, number, pluralize(scope)];
      }
      if (modifier.start === -modifier.length) {
        return [modifiersExtra.last, number, pluralize(scope)];
      }

      throw new NoSpokenFormError(
        `'${modifier.type}' with count > 1 and offset away from start / end`,
      );
    }

    case "range": {
      if (
        modifier.anchor.type === "ordinalScope" &&
        modifier.active.type === "ordinalScope" &&
        modifier.anchor.length === 1 &&
        modifier.active.length === 1 &&
        modifier.anchor.scopeType.type === modifier.active.scopeType.type
      ) {
        const anchor =
          modifier.anchor.start === -1
            ? modifiersExtra.last
            : ordinalToSpokenForm(modifier.anchor.start + 1);
        const active = modifierToSpokenForm(modifier.active);
        const connective = getRangeConnective(
          modifier.excludeAnchor,
          modifier.excludeActive,
        );
        return [anchor, connective, active];
      }

      // Throw actual Error here because we're not sure we ever want to support
      // a spoken form for these; we may deprecate this construct entirely
      throw Error(`Modifier '${modifier.type}' is not fully implemented`);
    }

    default:
      return [modifiers[modifier.type]];
  }
}

function relativeScopeInclusiveToSpokenForm(
  modifier: RelativeScopeModifier,
): RecursiveArray<string> {
  const scope = scopeTypeToSpokenForm(modifier.scopeType);

  if (modifier.length === 1) {
    const direction =
      modifier.direction === "forward"
        ? connectives.forward
        : connectives.backward;

    // token forward/backward
    return [scope, direction];
  }

  const length = numberToSpokenForm(modifier.length);
  const scopePlural = pluralize(scope);

  // two tokens
  // This could also have been "two tokens forward"; there is no way to disambiguate.
  if (modifier.direction === "forward") {
    return [length, scopePlural];
  }

  // two tokens backward
  return [length, scopePlural, connectives.backward];
}

function relativeScopeExclusiveToSpokenForm(
  modifier: RelativeScopeModifier,
): RecursiveArray<string> {
  const scope = scopeTypeToSpokenForm(modifier.scopeType);
  const direction =
    modifier.direction === "forward" ? connectives.next : connectives.previous;

  if (modifier.offset === 1) {
    const number = numberToSpokenForm(modifier.length);

    if (modifier.length === 1) {
      // next/previous token
      return [direction, scope];
    }

    const scopePlural = pluralize(scope);

    // next/previous two tokens
    return [direction, number, scopePlural];
  }

  if (modifier.length === 1) {
    const ordinal = ordinalToSpokenForm(modifier.offset);
    // second next/previous token
    return [ordinal, direction, scope];
  }

  throw new NoSpokenFormError(
    `${modifier.type} modifier with offset > 1 and length > 1`,
  );
}

function scopeTypeToSpokenForm(scopeType: ScopeType): string {
  switch (scopeType.type) {
    case "oneOf":
    case "customRegex":
    case "switchStatementSubject":
    case "string":
      throw new NoSpokenFormError(`Scope type '${scopeType.type}'`);
    case "surroundingPair": {
      const pair = surroundingPairNameToSpokenForm(scopeType.delimiter);
      if (scopeType.forceDirection != null) {
        const direction =
          scopeType.forceDirection === "left"
            ? surroundingPairForceDirections.left
            : surroundingPairForceDirections.right;
        return `${direction} ${pair}`;
      }
      return pair;
    }

    default:
      return scopeSpokenForms[scopeType.type];
  }
}

function markToSpokenForm(mark: PartialMark): RecursiveArray<string> {
  switch (mark.type) {
    case "decoratedSymbol": {
      const [color, shape] = mark.symbolColor.split("-");
      const components: string[] = [];
      if (color !== "default") {
        components.push(hatColorToSpokenForm(color));
      }
      if (shape != null) {
        components.push(hatShapeToSpokenForm(shape));
      }
      components.push(characterToSpokenForm(mark.character));
      return components;
    }

    case "lineNumber": {
      return lineNumberToParts(mark);
    }

    case "range": {
      if (
        mark.anchor.type === "lineNumber" &&
        mark.active.type === "lineNumber"
      ) {
        const [typeAnchor, numberAnchor] = lineNumberToParts(mark.anchor);
        const [typeActive, numberActive] = lineNumberToParts(mark.active);
        if (typeAnchor === typeActive) {
          const connective = getRangeConnective(
            mark.excludeAnchor,
            mark.excludeActive,
          );
          // Row five past seven
          return [typeAnchor, numberAnchor, connective, numberActive];
        }
      }
      // Throw actual Error here because we're not sure we ever want to support
      // a spoken form for these; we may deprecate this construct entirely
      throw Error(`Mark '${mark.type}' is not fully implemented`);
    }
    case "explicit":
      throw new NoSpokenFormError(`Mark '${mark.type}'`);

    default:
      return [marks[mark.type]];
  }
}

function lineNumberToParts(mark: LineNumberMark): [string, string] {
  switch (mark.lineNumberType) {
    case "absolute":
      throw new NoSpokenFormError("Absolute line numbers");
    case "modulo100": {
      // row/ five
      return [
        lineDirections.modulo100,
        numberToSpokenForm(mark.lineNumber + 1),
      ];
    }
    case "relative": {
      // up/down five
      return [
        mark.lineNumber < 0
          ? lineDirections.relativeUp
          : lineDirections.relativeDown,
        numberToSpokenForm(Math.abs(mark.lineNumber)),
      ];
    }
  }
}

function pluralize(name: string): string {
  return `${name}s`;
}
