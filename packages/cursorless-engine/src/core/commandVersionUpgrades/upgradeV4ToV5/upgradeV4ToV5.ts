import {
  ActionCommand,
  ActionCommandV4,
  CommandV4,
  CommandV5,
} from "@cursorless/common";

export function upgradeV4ToV5(command: CommandV4): CommandV5 {
  return {
    ...command,
    version: 5,
    action: upgradeAction(command.action),
  };
}

function upgradeAction(action: ActionCommandV4): ActionCommand {
  switch (action.name) {
    case "wrapWithSnippet": {
      const [name, variableName] = parseSnippetLocation(action.args![0] as string);
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
      return {
        name: "insertSnippet",
        args: [
          {
            type: "named",
            name,
            substitutions,
          },
        ],
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
