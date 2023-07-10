import {
  CommandLatest,
  PartialDestinationDescriptor,
  PartialPrimitiveTargetDescriptor,
  PartialRangeTargetDescriptor,
  PartialTargetDescriptor,
} from "@cursorless/common";

export function getPartialTargets(
  command: CommandLatest,
): PartialTargetDescriptor[] {
  switch (command.action.name) {
    case "replaceWithTarget":
    case "moveToTarget":
      return [
        command.action.source,
        getTargetsFromDestination(command.action.destination),
      ];
    case "swapTargets":
      return [command.action.target1, command.action.target2];
    case "pasteFromClipboard":
      return [getTargetsFromDestination(command.action.destination)];
    default:
      return [command.action.target];
  }
}

function getTargetsFromDestination(
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
        elements.push(
          destination.target as
            | PartialPrimitiveTargetDescriptor
            | PartialRangeTargetDescriptor,
        );
      }
    });
    return {
      type: "list",
      elements,
    };
  }
  return destination.target;
}
