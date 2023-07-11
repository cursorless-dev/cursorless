import {
  CommandLatest,
  DestinationDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";

export function getPartialTargetDescriptors(
  command: CommandLatest,
): PartialTargetDescriptor[] {
  switch (command.action.name) {
    case "callAsFunction":
      return [command.action.callee, command.action.argument];
    case "replaceWithTarget":
    case "moveToTarget":
      return [
        command.action.source,
        getPartialTargetDescriptorFromDestination(command.action.destination),
      ];
    case "swapTargets":
      return [command.action.target1, command.action.target2];
    case "pasteFromClipboard":
    case "insertSnippet":
    case "replace":
      return [
        getPartialTargetDescriptorFromDestination(command.action.destination),
      ];
    default:
      return [command.action.target];
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
