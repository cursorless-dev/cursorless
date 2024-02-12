import {
  CommandComplete,
  CommandServerApi,
  DestinationDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";
import { Fallback, FallbackModifier } from "../api/CursorlessEngineApi";
import { CommandRunner } from "../CommandRunner";

export async function getCommandFallback(
  commandServerApi: CommandServerApi | null,
  commandRunner: CommandRunner,
  command: CommandComplete,
): Promise<Fallback | null> {
  if (
    commandServerApi == null ||
    commandServerApi.getFocusedElementType() === "textEditor"
  ) {
    return null;
  }

  const action = command.action;

  switch (action.name) {
    case "replace":
      return destinationIsSelection(action.destination) &&
        Array.isArray(action.replaceWith)
        ? {
            action: "insert",
            modifiers: getModifiersFromDestination(action.destination),
            text: action.replaceWith.join("\n"),
          }
        : null;

    case "replaceWithTarget":
      if (destinationIsSelection(action.destination)) {
        return {
          action: "insert",
          modifiers: getModifiersFromDestination(action.destination),
          text: await getText(
            commandRunner,
            command.usePrePhraseSnapshot,
            action.source,
          ),
        };
      }
      return null;

    case "moveToTarget":
      if (destinationIsSelection(action.destination)) {
        const text = await getText(
          commandRunner,
          command.usePrePhraseSnapshot,
          action.source,
        );
        await remove(
          commandRunner,
          command.usePrePhraseSnapshot,
          action.source,
        );
        return {
          action: "insert",
          modifiers: getModifiersFromDestination(action.destination),
          text,
        };
      }
      return null;

    case "callAsFunction":
      if (targetIsSelection(action.argument)) {
        return {
          action: action.name,
          modifiers: getModifiersFromTarget(action.argument),
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
            modifiers: getModifiersFromTarget(action.target),
            left: action.left,
            right: action.right,
          }
        : null;

    case "pasteFromClipboard":
      return destinationIsSelection(action.destination)
        ? {
            action: action.name,
            modifiers: getModifiersFromDestination(action.destination),
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
        ? {
            action: action.name,
            modifiers: getModifiersFromTarget(action.target),
          }
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

function getModifiersFromDestination(
  destination: DestinationDescriptor,
): FallbackModifier[] {
  if (destination.type === "primitive") {
    return getModifiersFromTarget(destination.target);
  }
  return [];
}

function getModifiersFromTarget(
  target: PartialTargetDescriptor,
): FallbackModifier[] {
  if (target.type === "primitive") {
    if (target.modifiers != null && target.modifiers.length > 0) {
      return target.modifiers;
    }

    if (target.mark?.type === "cursor") {
      return [{ type: "containingTokenIfEmpty" }];
    }
  }
  return [];
}

async function getText(
  commandRunner: CommandRunner,
  usePrePhraseSnapshot: boolean,
  target: PartialTargetDescriptor,
): Promise<string> {
  const returnValue = await commandRunner.run({
    version: 7,
    usePrePhraseSnapshot,
    action: {
      name: "getText",
      target,
    },
  });
  const texts = returnValue as string[];
  return texts.join("\n");
}

function remove(
  commandRunner: CommandRunner,
  usePrePhraseSnapshot: boolean,
  target: PartialTargetDescriptor,
): Promise<unknown> {
  return commandRunner.run({
    version: 7,
    usePrePhraseSnapshot,
    action: {
      name: "remove",
      target,
    },
  });
}
