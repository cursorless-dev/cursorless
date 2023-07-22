import {
  ActionDescriptor,
  AmbiguousSpokenFormError,
  Command,
  CommandComplete,
  CommandV5,
  DestinationDescriptor,
  InsertionMode,
  LineNumberMark,
  Modifier,
  NoSpokenFormError,
  PartialMark,
  PartialPrimitiveTargetDescriptor,
  PartialPrimitiveTargetDescriptorV5,
  PartialRangeTargetDescriptorV5,
  PartialRangeType,
  PartialTargetDescriptor,
  PartialTargetDescriptorV5,
  RelativeScopeModifier,
  ScopeType,
  actionToSpokenForm,
  characterToSpokenForm,
  connectives,
  hatColorToSpokenForm,
  hatShapeToSpokenForm,
  insertSnippetToSpokenForm,
  lineDirections,
  markTypeToSpokenForm,
  modifierTypeToSpokenForm,
  modifiers,
  modifiersExtra,
  numberToSpokenForm,
  ordinalToSpokenForm,
  scopeToSpokenForm,
  surroundingPairDelimitersToSpokenForm,
  surroundingPairForceDirections,
  surroundingPairToSpokenForm,
  wrapSnippetToSpokenForm,
} from "@cursorless/common";
import { RecursiveArray, flattenDeep } from "lodash";
import { canonicalizeAndValidateCommand } from "./canonicalizeAndValidateCommand";
import { upgradeV0ToV1 } from "./upgradeV0ToV1";
import { upgradeV1ToV2 } from "./upgradeV1ToV2";
import { upgradeV2ToV3 } from "./upgradeV2ToV3";
import { upgradeV3ToV4 } from "./upgradeV3ToV4";
import { upgradeV4ToV5 } from "./upgradeV4ToV5";

/**
 * Temporarily here to support spoken form tests for current(v5) Talon side grammar
 * TODO: remove
 */
export function canonicalizeSpokenFormTestCommand(
  command: Command,
): Required<CommandV5> | null {
  while (command.version < 5) {
    switch (command.version) {
      case 0:
        command = upgradeV0ToV1(command);
        break;
      case 1:
        command = upgradeV1ToV2(command);
        break;
      case 2:
        command = upgradeV2ToV3(command);
        break;
      case 3:
        command = upgradeV3ToV4(command);
        break;
      case 4:
        command = upgradeV4ToV5(command);
        break;
    }
  }

  if (command.version !== 5) {
    return null;
  }

  const canonicalCommand: Required<CommandV5> = {
    version: 5,
    spokenForm: "",
    action: {
      name: command.action.name,
      args: command.action.args ?? [],
    },
    targets: command.targets.map(canonicalizeTargetsV5),
    usePrePhraseSnapshot: true,
  };

  const commandLatest = canonicalizeAndValidateCommand(canonicalCommand);
  const spokenForm = generateSpokenForm(commandLatest);

  if (spokenForm == null) {
    return null;
  }

  canonicalCommand.spokenForm = spokenForm;

  return canonicalCommand;
}

function canonicalizeTargetsV5(
  target: PartialTargetDescriptorV5,
): PartialTargetDescriptorV5 {
  switch (target.type) {
    case "list":
      return {
        type: target.type,
        elements: target.elements.map(
          canonicalizeTargetsV5,
        ) as PartialPrimitiveTargetDescriptorV5[],
      };
    case "range": {
      const result: PartialRangeTargetDescriptorV5 = {
        type: target.type,
        anchor: canonicalizeTargetsV5(
          target.anchor,
        ) as PartialPrimitiveTargetDescriptorV5,
        active: canonicalizeTargetsV5(
          target.active,
        ) as PartialPrimitiveTargetDescriptorV5,
        excludeAnchor: target.excludeAnchor,
        excludeActive: target.excludeActive,
      };
      if (target.rangeType != null) {
        result.rangeType === target.rangeType;
      }
      return result;
    }

    case "primitive": {
      const result: PartialTargetDescriptorV5 = {
        type: "primitive",
      };
      if (target.modifiers != null) {
        result.modifiers = target.modifiers;
      }
      if (target.mark != null) {
        result.mark = target.mark;
      }
      return result;
    }
    case "implicit":
      return target;
  }
}

function generateSpokenForm(command: CommandComplete): string | null {
  try {
    const components = generateSpokenFormComponents(command.action);
    return flattenDeep(components).join(" ");
  } catch (e) {
    if (
      e instanceof NoSpokenFormError ||
      e instanceof AmbiguousSpokenFormError
    ) {
      return null;
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
        actionToSpokenForm(action.name),
        targetToSpokenForm(action.source),
        destinationToSpokenForm(action.destination),
      ];

    case "swapTargets":
      return [
        actionToSpokenForm(action.name),
        targetToSpokenForm(action.target1),
        connectives.swapConnective,
        targetToSpokenForm(action.target2),
      ];

    case "callAsFunction":
      if (action.argument != null) {
        throw new NoSpokenFormError(`Action '${action.name}' with argument`);
      }
      return [
        actionToSpokenForm(action.name),
        targetToSpokenForm(action.callee),
        // targetToSpokenForm(action.argument),
      ];

    case "wrapWithPairedDelimiter":
    case "rewrapWithPairedDelimiter":
      return [
        surroundingPairDelimitersToSpokenForm(action.left, action.right),
        actionToSpokenForm(action.name),
        targetToSpokenForm(action.target),
      ];

    case "pasteFromClipboard":
      return [
        actionToSpokenForm(action.name),
        destinationToSpokenForm(action.destination),
      ];

    case "insertSnippet":
      return [
        actionToSpokenForm(action.name),
        insertSnippetToSpokenForm(action.snippetDescription),
        destinationToSpokenForm(action.destination),
      ];

    case "generateSnippet":
      if (action.snippetName != null) {
        throw new NoSpokenFormError(`${action.name}.snippetName`);
      }
      return [
        actionToSpokenForm(action.name),
        targetToSpokenForm(action.target),
      ];

    case "wrapWithSnippet":
      return [
        wrapSnippetToSpokenForm(action.snippetDescription),
        actionToSpokenForm(action.name),
        targetToSpokenForm(action.target),
      ];

    case "highlight": {
      if (action.highlightId != null) {
        throw new NoSpokenFormError(`${action.name}.highlightId`);
      }
      return [
        actionToSpokenForm(action.name),
        targetToSpokenForm(action.target),
      ];
    }

    default: {
      return [
        actionToSpokenForm(action.name),
        targetToSpokenForm(action.target),
      ];
    }
  }
}

function targetToSpokenForm(
  target: PartialTargetDescriptor,
): RecursiveArray<string> {
  switch (target.type) {
    case "list":
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
      return destination.destinations.map((destination, i) =>
        i === 0
          ? destinationToSpokenForm(destination)
          : [connectives.listConnective, destinationToSpokenForm(destination)],
      );

    case "primitive": {
      const insertionMode = insertionModeToSpokenForm(
        destination.insertionMode,
      );
      const target = targetToSpokenForm(destination.target);
      return [insertionMode, target];
    }

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
  return prefix + connectives.rangeInclusive;
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
    case "everyScope": {
      const scopeType = scopeTypeToSpokenForm(modifier.scopeType);
      return [modifiers.everyScope!, scopeType];
    }

    case "extendThroughStartOf":
    case "extendThroughEndOf": {
      const type = modifierTypeToSpokenForm(modifier.type);
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

      throw Error(`Modifier '${modifier.type}' is not fully implemented`);
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
          modifier.excludeAnchor ?? false,
          modifier.excludeActive ?? false,
        );
        return [anchor, connective, active];
      }

      throw Error(`Modifier '${modifier.type}' is not fully implemented`);
    }

    default:
      return [modifierTypeToSpokenForm(modifier.type)];
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

  throw Error(`Modifier '${modifier.type}' is not fully implemented`);
}

function scopeTypeToSpokenForm(scopeType: ScopeType): string {
  switch (scopeType.type) {
    case "oneOf":
    case "customRegex":
      throw new NoSpokenFormError(`Scope type '${scopeType.type}'`);
    case "string":
      throw new AmbiguousSpokenFormError(`Scope type '${scopeType.type}'`);
    case "surroundingPair": {
      const pair = surroundingPairToSpokenForm(scopeType.delimiter);
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
      return scopeToSpokenForm(scopeType.type);
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
            mark.excludeAnchor ?? false,
            mark.excludeActive ?? false,
          );
          // Row five past seven
          return [typeAnchor, numberAnchor, connective, numberActive];
        }
      }

      throw Error(`Mark '${mark.type}' is not fully implemented`);
    }

    default:
      return [markTypeToSpokenForm(mark.type)];
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
