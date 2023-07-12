import {
  ActionDescriptor,
  DestinationDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
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
        getPartialTargetDescriptorFromDestination(action.destination),
      ];
    case "swapTargets":
      return [action.target1, action.target2];
    case "pasteFromClipboard":
    case "insertSnippet":
    case "replace":
    case "editNew":
      return [getPartialTargetDescriptorFromDestination(action.destination)];
    default:
      return [action.target];
  }
}

export function getPartialTargetDescriptorFromDestination(
  destination: DestinationDescriptor,
): PartialTargetDescriptor {
  switch (destination.type) {
    case "list": {
      const elements: (
        | PartialPrimitiveTargetDescriptor
        | PartialRangeTargetDescriptor
      )[] = [];
      destination.destinations.forEach((destination) => {
        if (destination.target.type === "list") {
          elements.push(...destination.target.elements);
        } else {
          elements.push(destination.target);
        }
      });
      return {
        type: "list",
        elements,
      };
    }
    case "primitive":
      return destination.target;
    case "implicit":
      return destination;
  }
}
