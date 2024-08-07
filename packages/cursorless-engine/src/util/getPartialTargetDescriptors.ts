import type {
  ActionDescriptor,
  DestinationDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";
import { parseAndFillOutAction } from "../customCommandGrammar/parseAndFillOutAction";

export function getPartialTargetDescriptors(
  action: ActionDescriptor,
): PartialTargetDescriptor[] {
  switch (action.name) {
    case "callAsFunction":
      return [action.callee, action.argument];
    case "replaceWithTarget":
    case "moveToTarget":
      return [
        action.source,
        ...getPartialTargetDescriptorsFromDestination(action.destination),
      ];
    case "swapTargets":
      return [action.target1, action.target2];
    case "pasteFromClipboard":
    case "insertSnippet":
    case "replace":
    case "editNew":
      return getPartialTargetDescriptorsFromDestination(action.destination);
    case "parsed":
      return getPartialTargetDescriptors(
        parseAndFillOutAction(action.content, action.arguments),
      );
    default:
      return [action.target];
  }
}

function getPartialTargetDescriptorsFromDestination(
  destination: DestinationDescriptor,
): PartialTargetDescriptor[] {
  switch (destination.type) {
    case "list":
      return destination.destinations.map(({ target }) => target);
    case "primitive":
      return [destination.target];
    case "implicit":
      return [];
  }
}
