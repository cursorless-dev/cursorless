import {
  ActionDescriptor,
  CommandComplete,
  DestinationDescriptor,
  InsertionMode,
  PartialTargetDescriptor,
} from "@cursorless/common";
import { RecursiveArray, flattenDeep } from "lodash";
import { NoSpokenFormError } from "./NoSpokenFormError";
import { actions } from "./defaultSpokenForms/actions";
import { connectives } from "./defaultSpokenForms/connectives";
import { surroundingPairDelimitersToSpokenForm } from "./defaultSpokenForms/modifiers";
import {
  insertionSnippetToSpokenForm,
  wrapperSnippetToSpokenForm,
} from "./defaultSpokenForms/snippets";
import { getRangeConnective } from "./getRangeConnective";
import { primitiveTargetToSpokenForm } from "./primitiveTargetToSpokenForm";

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
    case "private.getTargets":
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
      if (action.argument.type === "implicit") {
        return [actions[action.name], targetToSpokenForm(action.callee)];
      }
      return [
        actions[action.name],
        targetToSpokenForm(action.callee),
        "on",
        targetToSpokenForm(action.argument),
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
