import {
  CommandComplete,
  CommandServerApi,
  DestinationDescriptor,
  LATEST_VERSION,
  PartialTargetDescriptor,
} from "@cursorless/common";

import { CommandRunner } from "..";
import { Fallback } from "../api/CursorlessEngineApi";

export async function getCommandFallback(
  commandServerApi: CommandServerApi | null,
  commandRunner: CommandRunner,
  command: CommandComplete,
): Promise<Fallback | null> {
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
      if (destinationIsSelection(action.destination)) {
        return {
          action: "insert",
          scope: getScopeFromDestination(action.destination),
          text: await getText(
            commandRunner,
            command.usePrePhraseSnapshot,
            action.source,
          ),
        };
      }
      return null;

    case "callAsFunction":
      if (targetIsSelection(action.argument)) {
        return {
          action: action.name,
          scope: getScopeFromTarget(action.argument),
          callee: await getText(
            commandRunner,
            command.usePrePhraseSnapshot,
            action.callee,
          ),
        };
      }
      return null;

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

    case "moveToTarget":
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

async function getText(
  commandRunner: CommandRunner,
  usePrePhraseSnapshot: boolean,
  target: PartialTargetDescriptor,
): Promise<string> {
  const returnValue = await commandRunner.run({
    version: LATEST_VERSION,
    usePrePhraseSnapshot,
    action: {
      name: "getText",
      target,
    },
  });
  const replaceWith = returnValue as string[];
  return replaceWith.join("\n");
}
