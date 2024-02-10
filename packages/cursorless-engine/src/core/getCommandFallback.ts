import {
  CommandComplete,
  CommandServerApi,
  DestinationDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";

import { Fallback } from "../api/CursorlessEngineApi";

export function getCommandFallback(
  commandServerApi: CommandServerApi | null,
  command: CommandComplete,
): Fallback | null {
  if (commandServerApi == null) {
    return null;
  }

  const focusedElement = commandServerApi?.getFocusedElementType();

  if (focusedElement === "textEditor") {
    return null;
  }

  const action = command.action;

  switch (action.name) {
    case "replace":
      return destinationIsSelection(action.destination) &&
        Array.isArray(action.replaceWith)
        ? {
            action: "insert",
            scope: getScopeFromDestination(action.destination),
            text: action.replaceWith.join("\n"),
          }
        : null;

    case "replaceWithTarget":
    case "moveToTarget":
      // if (action.destination.type === "implicit") {
      // }
      return null;

    case "callAsFunction":
      return null;
    // return action.argument.type === "implicit" &&
    //   targetIsSelection(action.callee)
    //   ? { action: action.name }
    //   : null;

    case "wrapWithPairedDelimiter":
    case "rewrapWithPairedDelimiter":
      return targetIsSelection(action.target)
        ? {
            action: action.name,
            scope: getScopeFromTarget(action.target),
            left: action.left,
            right: action.right,
          }
        : null;

    case "pasteFromClipboard":
      return destinationIsSelection(action.destination)
        ? {
            action: action.name,
            scope: getScopeFromDestination(action.destination),
          }
        : null;

    case "swapTargets":
    case "editNew":
    case "insertSnippet":
    case "generateSnippet":
    case "wrapWithSnippet":
      return null;

    default:
      return targetIsSelection(action.target)
        ? { action: action.name, scope: getScopeFromTarget(action.target) }
        : null;
  }
}

function destinationIsSelection(destination: DestinationDescriptor): boolean {
  if (destination.type === "implicit") {
    return true;
  }
  if (destination.type === "primitive") {
    return (
      destination.insertionMode === "to" &&
      targetIsSelection(destination.target)
    );
  }
  return false;
}

function targetIsSelection(target: PartialTargetDescriptor): boolean {
  if (target.type === "implicit") {
    return true;
  }
  if (target.type === "primitive") {
    return target.mark == null || target.mark.type === "cursor";
  }
  return false;
}

function getScopeFromDestination(
  destination: DestinationDescriptor,
): string | null {
  if (destination.type === "primitive") {
    return getScopeFromTarget(destination.target);
  }
  return null;
}

function getScopeFromTarget(target: PartialTargetDescriptor): string | null {
  if (target.type === "primitive") {
    if (target.modifiers != null && target.modifiers.length > 0) {
      const modifier = target.modifiers[0];

      switch (modifier.type) {
        case "containingScope":
          return `containing.${modifier.scopeType.type}`;
        case "extendThroughStartOf":
        case "extendThroughEndOf":
          if (modifier.modifiers == null) {
            return `${modifier.type}.line`;
          }
      }

      throw Error(
        `Unknown Cursorless fallback modifier type: ${modifier.type}`,
      );
    }

    if (target.mark?.type === "cursor") {
      return target.mark.type;
    }
  }
  return null;
}

// function targetIsSelection(target: PartialTargetDescriptor|DestinationDescriptor): boolean {

// }

// function getTarget(action: ActionDescriptor): PartialTargetDescriptor|DestinationDescriptor {
//   switch (action.name) {
//     // case "editNew":
//     // case "getText":
//     // case "replace":
//     // case "executeCommand":
//     // case "private.getTargets":
//     // case "private.setKeyboardTarget":

//     case "replaceWithTarget":
//     case "moveToTarget":
//       return   action.destination

//     case "swapTargets":
//       return [
//         actions[action.name],
//         this.handleTarget(action.target1),
//         connectives.swapConnective,
//         this.handleTarget(action.target2),
//       ];

//     case "callAsFunction":
//       if (action.argument.type === "implicit") {
//         return [actions[action.name], this.handleTarget(action.callee)];
//       }
//       return [
//         actions[action.name],
//         this.handleTarget(action.callee),
//         "on",
//         this.handleTarget(action.argument),
//       ];

//     case "wrapWithPairedDelimiter":
//     case "rewrapWithPairedDelimiter":
//       return [
//         surroundingPairDelimitersToSpokenForm(
//           this.spokenFormMap,
//           action.left,
//           action.right,
//         ),
//         actions[action.name],
//         this.handleTarget(action.target),
//       ];

//     case "pasteFromClipboard":
//       return [actions[action.name], this.handleDestination(action.destination)];

//     case "insertSnippet":
//       return [
//         actions[action.name],
//         insertionSnippetToSpokenForm(action.snippetDescription),
//         this.handleDestination(action.destination),
//       ];

//     case "generateSnippet":
//       if (action.snippetName != null) {
//         throw new NoSpokenFormError(`${action.name}.snippetName`);
//       }
//       return [actions[action.name], this.handleTarget(action.target)];

//     case "wrapWithSnippet":
//       return [
//         wrapperSnippetToSpokenForm(action.snippetDescription),
//         actions[action.name],
//         this.handleTarget(action.target),
//       ];

//     case "highlight": {
//       if (action.highlightId != null) {
//         throw new NoSpokenFormError(`${action.name}.highlightId`);
//       }
//       return [actions[action.name], this.handleTarget(action.target)];
//     }

//     default: {
//       return [actions[action.name], this.handleTarget(action.target)];
//     }
//   }
// }
