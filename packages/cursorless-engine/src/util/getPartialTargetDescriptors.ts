import {
  ActionDescriptor,
  DestinationDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";

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
      // FIXME: This is a hack
      return action.arguments.filter(isPartialTargetDescriptor);
    default:
      return [action.target];
  }
}

function isPartialTargetDescriptor(
  arg: unknown,
): arg is PartialTargetDescriptor {
  return typeof arg === "object" && arg != null && "type" in arg;
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
