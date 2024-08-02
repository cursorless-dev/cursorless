import type {
  ActionCommandV4,
  ActionCommandV5,
  CommandV4,
  CommandV5,
  MarkV4,
  ModifierV4,
  ModifierV5,
  PartialMarkV5,
  PartialPrimitiveTargetDescriptorV5,
  PartialTargetDescriptorV4,
  PartialTargetDescriptorV5,
} from "@cursorless/common";

export function upgradeV4ToV5(command: CommandV4): CommandV5 {
  return {
    ...command,
    version: 5,
    action: upgradeAction(command.action),
    targets: command.targets.map(upgradeTarget),
  };
}

function upgradeAction(action: ActionCommandV4): ActionCommandV5 {
  switch (action.name) {
    case "wrapWithSnippet": {
      const [name, variableName] = parseSnippetLocation(
        action.args![0] as string,
      );
      return {
        name: "wrapWithSnippet",
        args: [
          {
            type: "named",
            name,
            variableName,
          },
        ],
      };
    }
    case "insertSnippet": {
      const [name, substitutions] = action.args!;
      const snippetDescription: Record<string, unknown> = {
        type: "named",
        name,
      };
      if (substitutions != null) {
        snippetDescription.substitutions = substitutions;
      }
      return {
        name: "insertSnippet",
        args: [snippetDescription],
      };
    }
    default:
      return action;
  }
}

function parseSnippetLocation(snippetLocation: string): [string, string] {
  const [snippetName, placeholderName] = snippetLocation.split(".");
  if (snippetName == null || placeholderName == null) {
    throw new Error("Snippet location missing '.'");
  }
  return [snippetName, placeholderName];
}

function upgradeTarget(
  target: PartialTargetDescriptorV4,
): PartialTargetDescriptorV5 {
  switch (target.type) {
    case "implicit":
      return target;
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          upgradeTarget,
        ) as PartialPrimitiveTargetDescriptorV5[],
      };
    case "range":
      return {
        ...target,
        anchor: upgradeTarget(
          target.anchor,
        ) as PartialPrimitiveTargetDescriptorV5,
        active: upgradeTarget(
          target.active,
        ) as PartialPrimitiveTargetDescriptorV5,
      };
    case "primitive":
      return {
        ...target,
        mark: target.mark != null ? upgradeMark(target.mark) : undefined,
        modifiers:
          target.modifiers != null && target.modifiers.length > 0
            ? target.modifiers.map(upgradeModifier)
            : undefined,
      };
  }
}

function upgradeMark(mark: MarkV4): PartialMarkV5 {
  if (mark.type === "range") {
    return {
      ...mark,
      anchor: upgradeMark(mark.anchor),
      active: upgradeMark(mark.active),
      excludeAnchor: mark.excludeAnchor ?? false,
      excludeActive: mark.excludeActive ?? false,
    };
  }
  return mark;
}

function upgradeModifier(modifier: ModifierV4): ModifierV5 {
  if (modifier.type === "range") {
    return {
      ...modifier,
      anchor: upgradeModifier(modifier.anchor),
      active: upgradeModifier(modifier.active),
      excludeAnchor: modifier.excludeAnchor ?? false,
      excludeActive: modifier.excludeActive ?? false,
    };
  }
  return modifier as ModifierV5;
}
