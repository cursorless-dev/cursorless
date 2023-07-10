import {
  CommandLatest,
  PartialDestinationDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";

export function getPartialTargetDescriptors(
  command: CommandLatest,
): PartialTargetDescriptor[] {
  switch (command.action.name) {
    case "replaceWithTarget":
    case "moveToTarget":
      return [
        command.action.source,
        getPartialTargetDescriptorFromDestination(command.action.destination),
      ];
    case "swapTargets":
      return [command.action.target1, command.action.target2];
    case "pasteFromClipboard":
      return [
        getPartialTargetDescriptorFromDestination(command.action.destination),
      ];
    default:
      return [command.action.target];
  }
}

export function getPartialTargetDescriptorFromDestination(
  destination: PartialDestinationDescriptor,
): PartialTargetDescriptor {
  if (destination.type === "destinationList") {
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
  return destination.target;
}
